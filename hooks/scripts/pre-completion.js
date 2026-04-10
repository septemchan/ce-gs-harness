const { runGit, inject, log, fileExists, readStdin } = require("./lib/utils");
const os = require("os");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const CODE_EXTENSIONS = /\.(ts|js|py|go|rb|java|rs|c|cpp|h)$/;
const UI_EXTENSIONS = /\.(html|css|tsx|jsx|vue)$/;
const UI_DIRECTORIES = /\b(components|pages)\//;
const DOC_DIRECTORIES = /^(docs\/brainstorms\/|docs\/plans\/)/;
const SECURITY_PATTERNS = /\b(auth|payment|token|secret|credential|session|jwt|oauth)\b/i;

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Detection functions
// ---------------------------------------------------------------------------

/**
 * Parse `git status --porcelain` output into an array of file paths.
 * Handles standard statuses (M, A, D, ??) and renames (R -> destination).
 */
function parseChangedFiles(gitStatusOutput) {
  if (!gitStatusOutput || !gitStatusOutput.trim()) return [];
  return gitStatusOutput
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      // git status --porcelain: XY + space + path (XY is exactly 2 chars)
      // e.g. " M src/app.ts", "?? new.js", "A  added.ts", "R  old -> new"
      const filePart = line.slice(3);
      if (filePart.includes(" -> ")) {
        // Rename: take the destination
        return filePart.split(" -> ").pop().trim();
      }
      return filePart.trim();
    })
    .filter((f) => f.length > 0);
}

/**
 * Given a list of changed file paths, return an array of reminders
 * that should fire. Each reminder: { type: string, message: string }.
 */
function detectReminders(files) {
  if (!files || files.length === 0) return [];

  const reminders = [];

  // Normalize paths to forward slashes for matching
  const normalized = files.map((f) => f.replace(/\\/g, "/"));

  const codeFiles = normalized.filter((f) => CODE_EXTENSIONS.test(f));
  const uiFiles = normalized.filter(
    (f) => UI_EXTENSIONS.test(f) || UI_DIRECTORIES.test(f)
  );
  const docFiles = normalized.filter((f) => DOC_DIRECTORIES.test(f));
  const securityFiles = normalized.filter((f) => SECURITY_PATTERNS.test(f));

  // Condition 1: docs + code → sync
  if (docFiles.length > 0 && codeFiles.length > 0) {
    reminders.push({
      type: "sync",
      message:
        "[ce-gs-harness] Docs and code changed together. Consider running /product-spec sync to keep specs aligned.",
    });
  }

  // Condition 2: ≥3 code files → check
  if (codeFiles.length >= 3) {
    reminders.push({
      type: "check",
      message:
        "[ce-gs-harness] Substantial code changes detected (≥3 files). Consider running /product-spec check.",
    });
  }

  // Condition 3: ≥3 code files AND UI files → qa
  if (codeFiles.length >= 3 && uiFiles.length > 0) {
    reminders.push({
      type: "qa",
      message:
        "[ce-gs-harness] Code + UI changes detected. Consider running gstack /qa to verify visual behavior.",
    });
  }

  // Condition 4: security-sensitive paths → cso
  if (securityFiles.length > 0) {
    reminders.push({
      type: "cso",
      message:
        "[ce-gs-harness] Security-sensitive files changed. Consider running gstack /cso for a security review.",
    });
  }

  return reminders;
}

// ---------------------------------------------------------------------------
// Temp file for session dedup
// ---------------------------------------------------------------------------

/**
 * Compute the temp file path for a given working directory.
 * Uses SHA256 of cwd, truncated to 16 hex chars.
 */
function getTempPath(cwd) {
  const hash = crypto.createHash("sha256").update(cwd).digest("hex").slice(0, 16);
  return path.join(os.tmpdir(), `ce-gs-harness-${hash}.json`);
}

/**
 * Filter out reminders whose types have already been shown in this session.
 * If the temp file is older than 30 minutes, treat it as expired (return all).
 */
function filterAlreadyReminded(reminders, tempPath) {
  try {
    if (!fs.existsSync(tempPath)) return reminders;
    const raw = fs.readFileSync(tempPath, "utf8");
    const data = JSON.parse(raw);

    // Check TTL
    if (!data.timestamp || Date.now() - data.timestamp > SESSION_TTL_MS) {
      // Expired — remove the file and return all
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore
      }
      return reminders;
    }

    const already = new Set(data.reminded || []);
    return reminders.filter((r) => !already.has(r.type));
  } catch {
    return reminders;
  }
}

/**
 * Persist the given reminder types to the temp file, merging with existing ones.
 * Resets timestamp if file was expired.
 */
function saveReminded(types, tempPath) {
  let existing = { reminded: [], timestamp: Date.now() };
  try {
    if (fs.existsSync(tempPath)) {
      const raw = fs.readFileSync(tempPath, "utf8");
      const data = JSON.parse(raw);
      // Only merge if not expired
      if (data.timestamp && Date.now() - data.timestamp <= SESSION_TTL_MS) {
        existing = data;
      }
    }
  } catch {
    // start fresh
  }

  const merged = new Set(existing.reminded || []);
  for (const t of types) merged.add(t);

  const out = {
    reminded: Array.from(merged),
    timestamp: existing.timestamp || Date.now(),
  };
  fs.writeFileSync(tempPath, JSON.stringify(out));
}

// ---------------------------------------------------------------------------
// Main hook execution
// ---------------------------------------------------------------------------

async function main() {
  try {
    const stdin = readStdin();
    const cwd = stdin.cwd || process.cwd();

    // Non-git project: silent exit
    const gitDir = path.join(cwd, ".git");
    if (!fileExists(gitDir)) {
      process.exit(0);
    }

    // Get changed files
    const gitOutput = runGit(["status", "--porcelain"], cwd);
    const files = parseChangedFiles(gitOutput);
    if (files.length === 0) {
      process.exit(0);
    }

    // Detect reminders
    const reminders = detectReminders(files);
    if (reminders.length === 0) {
      process.exit(0);
    }

    // Filter already-reminded
    const tempPath = getTempPath(cwd);
    const fresh = filterAlreadyReminded(reminders, tempPath);
    if (fresh.length === 0) {
      process.exit(0);
    }

    // Output reminders
    const context = fresh.map((r) => r.message).join("\n");
    inject(context);

    // Save to temp file
    saveReminded(
      fresh.map((r) => r.type),
      tempPath
    );
  } catch {
    // Silent error handling
  }
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseChangedFiles,
  detectReminders,
  getTempPath,
  filterAlreadyReminded,
  saveReminded,
  CODE_EXTENSIONS,
  UI_EXTENSIONS,
  UI_DIRECTORIES,
  DOC_DIRECTORIES,
  SECURITY_PATTERNS,
};

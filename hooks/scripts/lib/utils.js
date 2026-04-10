const fs = require("fs");
const { spawnSync } = require("child_process");

const PREFIX = "[ce-gs-harness]";

let _stdinCache = undefined;

/**
 * Read JSON from stdin (fd 0), cache result. Return {} on failure.
 */
function readStdin() {
  if (_stdinCache !== undefined) return _stdinCache;
  try {
    const buf = fs.readFileSync(0, "utf8");
    if (!buf || !buf.trim()) {
      _stdinCache = {};
      return _stdinCache;
    }
    _stdinCache = JSON.parse(buf);
  } catch {
    _stdinCache = {};
  }
  return _stdinCache;
}

/**
 * Output JSON to stdout with hookSpecificOutput structure.
 * hookEventName comes from stdin's hook_event_name field, default 'Stop'.
 */
function inject(context) {
  const stdin = readStdin();
  const hookEventName = stdin.hook_event_name || "Stop";
  const output = {
    hookSpecificOutput: {
      hookEventName,
      additionalContext: context,
    },
  };
  process.stdout.write(JSON.stringify(output) + "\n");
}

/**
 * Write to stderr with [ce-gs-harness] prefix.
 */
function log(msg) {
  process.stderr.write(`${PREFIX} ${msg}\n`);
}

/**
 * Check if a file exists, return boolean.
 */
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute git command via child_process.spawnSync, return stdout string.
 * Timeout 5000ms. Return empty string on error/timeout.
 */
function runGit(args, cwd) {
  try {
    const result = spawnSync("git", args, {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (result.error || result.status !== 0) {
      return "";
    }
    return result.stdout || "";
  } catch {
    return "";
  }
}

module.exports = { readStdin, inject, log, fileExists, runGit };

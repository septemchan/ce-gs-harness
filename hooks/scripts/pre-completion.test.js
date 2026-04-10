const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const {
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
} = require("./pre-completion.js");

// ---------------------------------------------------------------------------
// parseChangedFiles
// ---------------------------------------------------------------------------
describe("parseChangedFiles", () => {
  it("parses standard git status --porcelain output", () => {
    const output = [
      " M src/app.ts",
      "?? docs/brainstorms/idea.md",
      "A  lib/utils.js",
      "D  old/file.py",
    ].join("\n");
    const files = parseChangedFiles(output);
    assert.deepStrictEqual(files, [
      "src/app.ts",
      "docs/brainstorms/idea.md",
      "lib/utils.js",
      "old/file.py",
    ]);
  });

  it("returns empty array for empty output", () => {
    assert.deepStrictEqual(parseChangedFiles(""), []);
  });

  it("trims whitespace and ignores blank lines", () => {
    const output = " M foo.ts\n\n M bar.js\n";
    const files = parseChangedFiles(output);
    assert.deepStrictEqual(files, ["foo.ts", "bar.js"]);
  });

  it("handles renamed files (-> syntax)", () => {
    const output = "R  old/name.ts -> new/name.ts";
    const files = parseChangedFiles(output);
    // Should include the destination path
    assert.ok(files.some((f) => f.includes("new/name.ts")));
  });
});

// ---------------------------------------------------------------------------
// detectReminders — individual conditions
// ---------------------------------------------------------------------------
describe("detectReminders", () => {
  it("suggests /product-spec sync when docs/brainstorms + code files", () => {
    const files = ["docs/brainstorms/idea.md", "src/app.js"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("sync"), `Expected 'sync' in ${JSON.stringify(types)}`);
  });

  it("suggests /product-spec sync when docs/plans + code files", () => {
    const files = ["docs/plans/v2.md", "src/server.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("sync"), `Expected 'sync' in ${JSON.stringify(types)}`);
  });

  it("suggests /product-spec check when ≥3 code files", () => {
    const files = ["a.ts", "b.ts", "c.ts", "d.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("check"), `Expected 'check' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /qa when ≥3 code files AND UI files", () => {
    const files = ["a.ts", "b.ts", "c.ts", "components/Button.tsx"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("qa"), `Expected 'qa' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /qa when UI file is in pages/ directory", () => {
    const files = ["a.ts", "b.ts", "c.ts", "pages/index.js"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("qa"), `Expected 'qa' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /qa when UI extension (.html) present with ≥3 code files", () => {
    const files = ["a.ts", "b.ts", "c.ts", "index.html"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("qa"), `Expected 'qa' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /cso when path matches security pattern", () => {
    const files = ["src/auth/login.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("cso"), `Expected 'cso' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /cso for payment path", () => {
    const files = ["lib/payment/stripe.js"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("cso"), `Expected 'cso' in ${JSON.stringify(types)}`);
  });

  it("suggests gstack /cso for jwt in filename", () => {
    const files = ["utils/jwt-helper.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("cso"), `Expected 'cso' in ${JSON.stringify(types)}`);
  });

  // Edge: no check reminder with < 3 code files
  it("does NOT suggest check when < 3 code files", () => {
    const files = ["a.ts", "b.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(!types.includes("check"), `Unexpected 'check' in ${JSON.stringify(types)}`);
  });

  // Edge: no qa reminder without UI files even with ≥3 code files
  it("does NOT suggest qa when ≥3 code files but no UI files", () => {
    const files = ["a.ts", "b.ts", "c.ts"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(!types.includes("qa"), `Unexpected 'qa' in ${JSON.stringify(types)}`);
  });

  // Edge: no sync when docs change but no code files
  it("does NOT suggest sync when only docs change (no code files)", () => {
    const files = ["docs/brainstorms/idea.md", "docs/plans/v2.md"];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(!types.includes("sync"), `Unexpected 'sync' in ${JSON.stringify(types)}`);
  });

  // Edge: all conditions met simultaneously
  it("outputs all reminders when all conditions are met", () => {
    const files = [
      "docs/brainstorms/idea.md",
      "src/auth/login.ts",
      "src/api.ts",
      "src/utils.ts",
      "components/Header.tsx",
    ];
    const reminders = detectReminders(files);
    const types = reminders.map((r) => r.type);
    assert.ok(types.includes("sync"), "missing sync");
    assert.ok(types.includes("check"), "missing check");
    assert.ok(types.includes("qa"), "missing qa");
    assert.ok(types.includes("cso"), "missing cso");
  });

  // Edge: empty file list → no reminders
  it("returns no reminders for empty file list", () => {
    const reminders = detectReminders([]);
    assert.strictEqual(reminders.length, 0);
  });

  // Edge: non-code, non-doc files only → no reminders
  it("returns no reminders when only non-code files changed", () => {
    const files = ["README.md", "package.json", ".gitignore"];
    const reminders = detectReminders(files);
    assert.strictEqual(reminders.length, 0);
  });

  // Each reminder message includes [ce-gs-harness] prefix
  it("includes [ce-gs-harness] prefix in all reminder messages", () => {
    const files = [
      "docs/brainstorms/idea.md",
      "src/auth/login.ts",
      "src/a.ts",
      "src/b.ts",
      "components/C.tsx",
    ];
    const reminders = detectReminders(files);
    for (const r of reminders) {
      assert.ok(
        r.message.startsWith("[ce-gs-harness]"),
        `Message should start with prefix: ${r.message}`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// getTempPath
// ---------------------------------------------------------------------------
describe("getTempPath", () => {
  it("returns path inside os.tmpdir()", () => {
    const p = getTempPath("/some/project");
    assert.ok(p.startsWith(os.tmpdir()));
  });

  it("includes ce-gs-harness in filename", () => {
    const p = getTempPath("/some/project");
    assert.ok(path.basename(p).startsWith("ce-gs-harness-"));
  });

  it("produces different paths for different cwds", () => {
    const p1 = getTempPath("/project/a");
    const p2 = getTempPath("/project/b");
    assert.notStrictEqual(p1, p2);
  });

  it("produces same path for same cwd", () => {
    const p1 = getTempPath("/project/a");
    const p2 = getTempPath("/project/a");
    assert.strictEqual(p1, p2);
  });

  it("ends with .json", () => {
    const p = getTempPath("/whatever");
    assert.ok(p.endsWith(".json"));
  });
});

// ---------------------------------------------------------------------------
// filterAlreadyReminded + saveReminded — dedup logic
// ---------------------------------------------------------------------------
describe("temp file tracking (filterAlreadyReminded / saveReminded)", () => {
  let tempPath;

  beforeEach(() => {
    const unique = crypto.randomBytes(8).toString("hex");
    tempPath = path.join(os.tmpdir(), `ce-gs-harness-test-${unique}.json`);
  });

  afterEach(() => {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // ignore
    }
  });

  it("returns all reminders when no temp file exists", () => {
    const reminders = [
      { type: "sync", message: "[ce-gs-harness] sync" },
      { type: "check", message: "[ce-gs-harness] check" },
    ];
    const filtered = filterAlreadyReminded(reminders, tempPath);
    assert.strictEqual(filtered.length, 2);
  });

  it("filters out already-reminded types", () => {
    const reminders = [
      { type: "sync", message: "[ce-gs-harness] sync" },
      { type: "check", message: "[ce-gs-harness] check" },
    ];
    // Save 'sync' as already reminded
    saveReminded(["sync"], tempPath);

    const filtered = filterAlreadyReminded(reminders, tempPath);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].type, "check");
  });

  it("second trigger after saveReminded produces no output for same types", () => {
    const reminders = [{ type: "cso", message: "[ce-gs-harness] cso" }];
    saveReminded(["cso"], tempPath);
    const filtered = filterAlreadyReminded(reminders, tempPath);
    assert.strictEqual(filtered.length, 0);
  });

  it("resets when temp file is older than 30 minutes", () => {
    // Write temp file with old timestamp
    const data = {
      reminded: ["sync", "check"],
      timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
    };
    fs.writeFileSync(tempPath, JSON.stringify(data));

    const reminders = [
      { type: "sync", message: "[ce-gs-harness] sync" },
      { type: "check", message: "[ce-gs-harness] check" },
    ];
    const filtered = filterAlreadyReminded(reminders, tempPath);
    // All should pass through because the temp file is stale
    assert.strictEqual(filtered.length, 2);
  });

  it("preserves previous types when saving new ones", () => {
    saveReminded(["sync"], tempPath);
    saveReminded(["check"], tempPath);

    const reminders = [
      { type: "sync", message: "[ce-gs-harness] sync" },
      { type: "check", message: "[ce-gs-harness] check" },
      { type: "cso", message: "[ce-gs-harness] cso" },
    ];
    const filtered = filterAlreadyReminded(reminders, tempPath);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].type, "cso");
  });
});

// ---------------------------------------------------------------------------
// git status integration edge cases
// ---------------------------------------------------------------------------
describe("git status edge cases", () => {
  it("git status fails (empty output) → no reminders", () => {
    // Simulates git returning empty string
    const files = parseChangedFiles("");
    const reminders = detectReminders(files);
    assert.strictEqual(reminders.length, 0);
  });

  it("non-git project (no changes) → no output from detection", () => {
    const files = parseChangedFiles("");
    assert.strictEqual(files.length, 0);
    const reminders = detectReminders(files);
    assert.strictEqual(reminders.length, 0);
  });
});

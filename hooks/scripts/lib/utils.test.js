const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const UTILS_PATH = path.join(__dirname, "utils.js");

// Helper: run a snippet in a child process, optionally piping stdinData,
// and return { stdout, stderr, status }.
function run(snippet, stdinData) {
  const args = ["-e", snippet];
  const opts = {
    cwd: __dirname,
    encoding: "utf8",
    timeout: 10000,
  };
  if (stdinData !== undefined) {
    opts.input = stdinData;
  }
  try {
    const stdout = execFileSync(process.execPath, args, opts);
    return { stdout, status: 0 };
  } catch (err) {
    return { stdout: err.stdout || "", stderr: err.stderr || "", status: err.status };
  }
}

describe("inject()", () => {
  it("outputs valid hookSpecificOutput JSON with default hookEventName", () => {
    const snippet = `
      const { inject } = require(${JSON.stringify(UTILS_PATH)});
      inject("test context message");
    `;
    // Pipe empty JSON to stdin so readStdin returns {} (no hook_event_name)
    const { stdout } = run(snippet, "{}");
    const parsed = JSON.parse(stdout.trim());
    assert.ok(parsed.hookSpecificOutput, "should have hookSpecificOutput");
    assert.equal(parsed.hookSpecificOutput.hookEventName, "Stop");
    assert.equal(parsed.hookSpecificOutput.additionalContext, "test context message");
  });

  it("uses hook_event_name from stdin when available", () => {
    const stdinData = JSON.stringify({ hook_event_name: "PreToolUse" });
    const snippet = `
      const { inject } = require(${JSON.stringify(UTILS_PATH)});
      inject("context from hook");
    `;
    const { stdout } = run(snippet, stdinData);
    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.hookSpecificOutput.hookEventName, "PreToolUse");
    assert.equal(parsed.hookSpecificOutput.additionalContext, "context from hook");
  });
});

describe("runGit()", () => {
  it("returns file change list from git status --porcelain", () => {
    const { runGit } = require(UTILS_PATH);
    // Use the project root (which is a workspace directory) — go up 3 levels from lib/
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    // If this project has a .git, runGit should return a string (possibly empty)
    const result = runGit(["status", "--porcelain"], projectRoot);
    assert.equal(typeof result, "string");
  });

  it("returns empty string on invalid git command", () => {
    const { runGit } = require(UTILS_PATH);
    const result = runGit(["not-a-real-command"], __dirname);
    assert.equal(result, "");
  });

  it("returns empty string on timeout (simulated via bad cwd)", () => {
    const { runGit } = require(UTILS_PATH);
    // Use a path that doesn't exist as cwd — should error and return ""
    const result = runGit(["status"], "/nonexistent/path/that/does/not/exist");
    assert.equal(result, "");
  });
});

describe("readStdin()", () => {
  it("returns empty object when no stdin data is provided", () => {
    const snippet = `
      const { readStdin } = require(${JSON.stringify(UTILS_PATH)});
      const data = readStdin();
      process.stdout.write(JSON.stringify(data));
    `;
    // Pass empty string as stdin — readStdin should return {}
    const { stdout } = run(snippet, "");
    const parsed = JSON.parse(stdout.trim());
    assert.deepEqual(parsed, {});
  });

  it("parses valid JSON from stdin", () => {
    const input = { hook_event_name: "Stop", some_key: "some_value" };
    const snippet = `
      const { readStdin } = require(${JSON.stringify(UTILS_PATH)});
      const data = readStdin();
      process.stdout.write(JSON.stringify(data));
    `;
    const { stdout } = run(snippet, JSON.stringify(input));
    const parsed = JSON.parse(stdout.trim());
    assert.deepEqual(parsed, input);
  });

  it("caches the result across multiple calls", () => {
    const input = { cached: true };
    const snippet = `
      const { readStdin } = require(${JSON.stringify(UTILS_PATH)});
      const first = readStdin();
      const second = readStdin();
      process.stdout.write(JSON.stringify({ same: first === second }));
    `;
    const { stdout } = run(snippet, JSON.stringify(input));
    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.same, true);
  });
});

describe("log()", () => {
  it("writes to stderr with [ce-gs-harness] prefix", () => {
    const snippet = `
      const { log } = require(${JSON.stringify(UTILS_PATH)});
      log("hello world");
    `;
    const result = run(snippet, "{}");
    // log writes to stderr; in our helper, on success stderr isn't captured,
    // so we run it in a way that captures stderr
    const args = ["-e", snippet];
    try {
      execFileSync(process.execPath, args, {
        cwd: __dirname,
        encoding: "utf8",
        input: "{}",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      // If it errors, check stderr
      assert.ok(err.stderr.includes("[ce-gs-harness]"));
      return;
    }
    // If it succeeded, re-run capturing stderr via a wrapper
    const wrapperSnippet = `
      const { execFileSync } = require("child_process");
      try {
        const stderr = execFileSync(process.execPath, ["-e", ${JSON.stringify(snippet)}], {
          encoding: "utf8",
          input: "{}",
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch(e) {
        process.stdout.write(e.stderr || "");
      }
    `;
    // Actually, let's just use spawnSync to capture stderr properly
    const { spawnSync } = require("node:child_process");
    const proc = spawnSync(process.execPath, ["-e", snippet], {
      cwd: __dirname,
      encoding: "utf8",
      input: "{}",
      stdio: ["pipe", "pipe", "pipe"],
    });
    assert.ok(
      proc.stderr.includes("[ce-gs-harness]"),
      `stderr should contain prefix, got: ${proc.stderr}`
    );
    assert.ok(
      proc.stderr.includes("hello world"),
      `stderr should contain message, got: ${proc.stderr}`
    );
  });
});

describe("fileExists()", () => {
  it("returns true for a file that exists", () => {
    const { fileExists } = require(UTILS_PATH);
    assert.equal(fileExists(UTILS_PATH), true);
  });

  it("returns false for a file that does not exist", () => {
    const { fileExists } = require(UTILS_PATH);
    assert.equal(fileExists("/nonexistent/file/path.txt"), false);
  });
});

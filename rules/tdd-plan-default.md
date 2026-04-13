# TDD Plan Default

When running CE `/ce:plan`, add `Execution note: test-first` to every implementation unit.

## Why

CE `/ce:work` reads the Execution note and auto-follows the TDD workflow:

1. Write a failing test
2. Verify it fails
3. Minimal implementation to make it pass
4. Verify it passes
5. Commit

Without this note, `/ce:work` defaults to implement-first, skipping the test-fail-pass cycle.

## When to skip

Do not add `Execution note: test-first` to:

- Pure documentation units (markdown, comments, READMEs)
- Pure configuration units (dotfiles, JSON/YAML config, CI pipelines)
- Markdown-only units (changelogs, specs, design docs)

<!-- ce-gs-harness v0.8.0 -->

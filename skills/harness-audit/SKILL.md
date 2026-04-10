---
name: harness-audit
description: >
  Use when: user wants to know how well their .claude/ is set up,
  starting a new project and unsure what .claude/ should contain,
  or periodic health check after many changes.
  Trigger on: "harness-audit", "/harness-audit", "harness体检",
  ".claude健康检查", "check harness health", "harness 打分".
  Do not trigger for: creating/modifying .claude/ files (user does that manually or via /harvest),
  reviewing individual prompt files (prompt-audit's job).
---

# harness-audit

Diagnostic tool for evaluating the health of a project's `.claude/` harness setup. Reports issues and suggests specific skills to fix them. Two modes depending on whether `.claude/` already exists.

---

## Audit mode (when .claude/ exists)

Check these items and score each as **pass** / **partial** / **fail**:

| Check | Pass when |
|-------|-----------|
| CLAUDE.md | Exists in `.claude/` or project root, non-empty, under 100 lines |
| Product-Spec.md | Exists in project root |
| rules/ | `.claude/rules/` contains at least 1 `.md` file |
| settings.json | `.claude/settings.json` exists |
| Content freshness | CLAUDE.md mentions tech stack that matches actual project files (e.g., mentions "React" and `package.json` lists react) |
| No contradictions | Rules don't contradict CLAUDE.md content (e.g., CLAUDE.md says "use tabs" but a rule says "use spaces") |

### Output format

1. **Score summary** — e.g., "4/6 checks passed"
2. **Each check result** with specific finding (what was found or missing, quote relevant lines)
3. **Top 3 improvement suggestions** with:
   - File path to create or modify
   - What to do (one sentence)
   - Which skill to use (e.g., `/harvest`, `/product-spec`)
4. If CLAUDE.md is missing or empty, suggest `/harvest` as the first action

---

## Init mode (when .claude/ doesn't exist or is empty)

1. Check if design docs exist in common locations:
   - `docs/brainstorms/`
   - `docs/plans/`
   - `docs/ideation/`
   - Any `*.md` files in `docs/`
2. If design docs found: recommend running `/harvest` to auto-generate CLAUDE.md from existing context
3. If no design docs found: guide user through manual creation:
   - Create `.claude/` directory
   - Create minimal CLAUDE.md with: project name, tech stack (detected from project files), key commands (build/test/run)
   - Suggest running `/product-spec` to create Product-Spec.md

---

## Important notes

- This is a **diagnostic tool** — it reports issues but does not fix them.
- Suggest specific skills for each issue:
  - Missing/stale CLAUDE.md → `/harvest`
  - Missing Product-Spec.md → `/product-spec`
  - Missing rules/ → manual creation or `/harvest`
  - Missing settings.json → `/update-config`
- Keep output concise and actionable. No walls of text.
- When checking for contradictions, only flag clear conflicts, not stylistic differences.

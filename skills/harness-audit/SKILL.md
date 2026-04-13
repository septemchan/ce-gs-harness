---
name: harness-audit
description: >
  Use when: user wants to know how well their .claude/ is set up,
  starting a new project and unsure what .claude/ should contain,
  or periodic health check after many changes.
  Trigger on: "harness-audit", "/ce-gs-harness:harness-audit", "harness体检",
  ".claude健康检查", "check harness health", "harness 打分".
  Do not trigger for: creating/modifying .claude/ files (user does that manually or via /ce-gs-harness:harvest),
  reviewing individual prompt files (prompt-audit's job).
---

# harness-audit

Diagnostic tool for evaluating a project's `.claude/` harness health. Reports issues, assigns a maturity level, and suggests specific skills to fix problems. Does not modify any files.

Two modes depending on whether `.claude/` already exists.

---

## Audit mode (when .claude/ exists)

Audit has two layers. Layer 1 (existence check) verifies components are present. Layer 2 (quality check) examines the content of each present component for correctness and consistency. Both layers feed into the final score.

### Layer 1: Existence checks

Each check has a weight reflecting its impact on Claude's effectiveness.

#### Critical (×3)

**CLAUDE.md**
- Pass: exists in `.claude/` or project root, non-empty, under 100 lines
- Partial: exists but empty, or over 100 lines
- This file is loaded into every conversation. Missing means Claude has zero project context. Over 100 lines means context budget is being spent on information that should live in rules/ or skills/（按需加载的机制存在就该用）.

#### High (×2)

**rules/**
- Pass: `.claude/rules/` or project root `rules/` contains at least 1 `.md` file
- Rules are always-on instructions injected into every conversation, but they don't占 CLAUDE.md 的行数。No rules means all behavioral guidance is either crammed into CLAUDE.md or absent.
- **Version check**: see Layer 1 independent check below.

**settings.json**
- Pass: `.claude/settings.json` or project root `settings.json` exists and is valid JSON
- Controls permissions, allowed/denied commands, MCP server config. Without it every session starts from defaults, the user gets repeated approval prompts for routine operations.

#### Medium (×1)

**Product-Spec.md** _(conditional — skip for libraries, CLI tools, plugins)_
- Detection: check package.json `keywords` for "lib"/"sdk"/"plugin"/"cli", or directory name patterns like `*-lib`, `*-sdk`, `*-plugin`, or absence of UI-related dependencies
- Pass: exists in project root
- For product/app projects, this is the requirements source of truth. Without it Claude has no way to judge whether a feature is complete.

**Content freshness**
- Pass: CLAUDE.md mentions tech that matches actual project files (e.g., mentions "React" and `package.json` lists react)
- Fail: mentions tech not in project, or project's primary tech is absent
- A stale CLAUDE.md actively misleads Claude, worse than having none, because Claude trusts it and makes wrong assumptions.

#### Optional (×0.5)

**Workflow entry points** _(skills/ or commands/)_
- Pass: project has at least 1 skill (`.claude/skills/*/SKILL.md`) or 1 command (`.claude/commands/*.md`)
- Skills and commands both serve as entry points for repeatable workflows. Having either satisfies this check; having both for the same workflow is redundant.

**Design spec file** _(conditional — skip for non-frontend projects)_
- Detection: check package.json `dependencies` or `devDependencies` for react/vue/svelte/next/nuxt/angular 等常见前端框架, or presence of frontend config files (`tailwind.config.*`, `postcss.config.*`, `vite.config.*`, `next.config.*` etc.)
- Search path (priority order): `DESIGN.md` in project root → `design-system/*/MASTER.md` (/ui-ux-pro-max output)
- Pass: any design spec file found at the above paths
- Frontend projects without a design spec file will produce inconsistent AI-generated UI — colors, typography, and spacing drift randomly across pages.

### Harness rules version check

Independent of Layer 1/Layer 2 scoring. List all expected harness rule files from `<skill-path>/../../rules/` (the plugin source), then check the project's `.claude/rules/` or `rules/`:

1. **Completeness check**: for each expected file, check if it exists in the project. Missing files → "harness rule {file} 缺失，要安装吗？"
2. **Version check**: for each existing file, read the last line, look for `<!-- ce-gs-harness vX.Y.Z -->`
3. Compare with the current plugin version from `<skill-path>/../../.claude-plugin/plugin.json`
4. Report results:
   - File missing → "harness rule {file} 缺失，要安装吗？"
   - Version comment missing → "harness rule {file} 没有版本标记，建议重新安装"
   - Version lower than current → "harness rules 有更新可用（本地 vX.Y.Z → 最新 vA.B.C），要更新吗？"
   - Version matches → pass, no output
5. If user confirms, copy missing or outdated files from `<skill-path>/../../rules/` to the project's rules directory

### Layer 2: Quality checks

For each component that passed Layer 1, examine the content for real problems. This layer prevents false confidence from a project where everything "exists" but nothing is well-configured.

**settings.json quality**
- Check for redundant permissions (e.g., path-scoped `Edit(/.claude/skills/**)` when global `Edit` is already allowed)
- Check for missing deny rules — especially in projects with valuable content files that shouldn't be accidentally deleted
- Flag if allow list is missing commonly needed commands (e.g., test runner, build tool)

**Cross-reference consistency**
- Compare CLAUDE.md claims against actual project contents. If CLAUDE.md references specific files, directories, agents, or commands, verify they exist. Flag any phantom references.
- If README.md exists, check whether its claims about the project (number of skills, commands, hooks, etc.) match reality. Stale README numbers are a common issue after rapid iteration.
- If skills/ have SKILL.md descriptions that claim specific slash-command triggers (e.g., "trigger via /foo"), verify the corresponding entry exists either as a skill name or a command file.

**Architecture highlights**
- Identify and call out good design patterns: write/read separation in agents (disallowedTools), path-scoped rules, layered security (deny rules), etc.
- Recognizing what's working well gives the user confidence and documents patterns worth preserving.

### Scoring and maturity

Layer 1 produces the base score:
1. Sum passed weights (critical ×3, high ×2, medium ×1, optional ×0.5; partial = half weight)
2. Divide by maximum possible (exclude conditionally skipped items)

Layer 2 can downgrade the maturity level (but not upgrade it):
- If Layer 2 finds 2+ substantive issues (redundant permissions, phantom references), cap the maturity at 🟠 regardless of Layer 1 score. A project where everything exists but is misconfigured isn't truly production-ready.

Map to maturity level:

| Score | Level | Meaning |
|-------|-------|---------|
| < 40% | 🟡 刚起步 | Claude can work but is flying blind |
| 40–74% | 🟠 基本可用 | Core context in place, automation and guardrails missing |
| ≥ 75% | 🟢 生产就绪 | Harness well-configured for sustained development |

### Output format

1. **Maturity level** — emoji + level + one-sentence summary
2. **Weighted score** — e.g., "8.5/12 (71%)"
3. **Layer 1 results** — pass/partial/fail per check with specific finding
4. **Layer 2 findings** — quality issues and cross-reference inconsistencies (if any)
5. **Architecture highlights** — good patterns worth preserving (if any)
6. **Top 3 improvement suggestions** ordered by impact (highest weight first):
   - What to do (one sentence)
   - File path to create or modify
   - Which skill to use (e.g., `/ce-gs-harness:harvest`, `/ce-gs-harness:product-spec-draft`, `/update-config`)
7. If CLAUDE.md is missing, `/ce-gs-harness:harvest` is always suggestion #1

---

## Init mode (when .claude/ doesn't exist or is empty)

1. Scan for existing documentation:
   - `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md` in project root
   - `docs/` directory (any `.md` files)
   - `docs/brainstorms/`, `docs/plans/`, `docs/ideation/`
2. Detect project type from config files:
   - `package.json`, `tsconfig.json`, `pyproject.toml`, `go.mod`, `requirements.txt`, `Cargo.toml`, `Gemfile`
3. **Install harness rules**: Check whether `.claude/rules/` contains the 5 harness rules (workflow-map.md, tdd-plan-default.md, noise-filter.md, source-dir-convention.md, karpathy-coding-guidelines.md). If any are missing, ask the user: "要安装 harness rules 吗？包含阶段导航、TDD 纪律、输出质量控制、源代码目录约定和 Karpathy 编码准则。" If confirmed, copy from `<skill-path>/../../rules/` to `.claude/rules/`. Create the directory if needed. Each copied file already contains a `<!-- ce-gs-harness vX.Y.Z -->` version comment at the end — do not strip it. If a file already exists and has an older version comment, overwrite the entire file to get the latest version.
4. Based on findings:
   - Docs found → recommend `/ce-gs-harness:harvest` to generate CLAUDE.md from existing context
   - No docs found → guide manual creation: create `.claude/`, write minimal CLAUDE.md (project name, detected tech stack, key commands), suggest `/ce-gs-harness:product-spec-draft` for product/app projects

---

## Gotchas

These are observed failure patterns from testing. They are the highest-signal part of this skill.

- **Layer 2 gets skipped.** The model tends to finish the Layer 1 checklist and treat it as complete. Layer 1 is the easy part; Layer 2 (quality + cross-references) is where the real value is. If you find yourself outputting a score after Layer 1 and moving to suggestions, stop — you haven't done Layer 2 yet.
- **100% Layer 1 score needs more scrutiny, not less.** A project where every component exists is exactly the project where misconfiguration hides. The sps-harness test case scored 100% on Layer 1 but had 4 stale README claims. Treat a perfect Layer 1 score as a trigger to dig deeper in Layer 2.
- **README claims drift fast.** After rapid iteration (adding agents, commands, skills), README component counts go stale within days. Always cross-check README numbers against actual file counts.
- **Mixed Chinese/English content freshness is tricky.** When CLAUDE.md uses Chinese terms for tech (e.g., "技术栈" instead of "tech stack"), keyword matching against English config files (package.json) can miss valid references. Match on the underlying tech names, not the surrounding language.

---

## Important notes

- This is a **diagnostic tool** — report issues and suggest fixes. The only direct action it takes is copying harness rules to `.claude/rules/` (with user confirmation).
- Suggest specific skills for each issue:
  - Missing/stale CLAUDE.md → `/ce-gs-harness:harvest`
  - Missing Product-Spec.md → `/ce-gs-harness:product-spec-draft`
  - Missing rules/ → manual creation or `/ce-gs-harness:harvest`
  - Missing settings.json → `/update-config`
  - No workflow entry points → suggest creating a skill if the project has repeatable workflows
  - Missing design spec (frontend projects) → `/ui-ux-pro-max`
- Keep output concise and actionable. No walls of text.
- Layer 2 is what makes this audit genuinely useful. Without it, the audit is just a file-existence checklist that gives false confidence. Spend the majority of your analysis effort on Layer 2.

---
title: "refactor: Remove hooks, split product-spec into 3 skills"
type: refactor
status: active
date: 2026-04-11
origin: docs/brainstorms/2026-04-11-simplify-hooks-and-split-product-spec-requirements.md
---

# refactor: Remove hooks, split product-spec into 3 skills

## Overview

删除不可靠的 pre-completion hook 系统，提醒职责全部交给 workflow-map rule。拆分 product-spec 为 3 个独立 skill（draft/check/sync），解决 args 路由无法命令行触发的问题。

## Problem Frame

hook 在 VS Code 环境下不触发，调试成本高。workflow-map 已覆盖相同提醒场景。product-spec 的 args 路由不支持命令行直接触发 check 和 sync 模式。

（see origin: docs/brainstorms/2026-04-11-simplify-hooks-and-split-product-spec-requirements.md）

## Requirements Trace

- R1. 删除 hook 系统（hooks/ 目录及所有内容）
- R2. 强化 workflow-map 提醒措辞（去掉 hook 引用，写明触发条件）
- R3. 拆分 product-spec 为 product-spec-draft / product-spec-check / product-spec-sync
- R4. 更新 CLAUDE.md、README.md、harness-audit 中的关联引用

## Scope Boundaries

- 不修改全局 ~/.claude/CLAUDE.md
- 不修改 harvest skill
- 不修改 noise-filter / tdd-plan-default
- workflow-map 阶段内容不变，只改提醒措辞

## Context & Research

### Relevant Code and Patterns

- `hooks/` 目录包含 5 个文件：hooks.json、pre-completion.js、pre-completion.test.js、lib/utils.js、lib/utils.test.js
- `rules/workflow-map.md` 行 5-15 为阶段提醒职责，行 37/38/40/41 标注 `[hook 会提醒]`
- `skills/product-spec/` 包含 SKILL.md（路由器）+ modes/draft.md、check.md、sync.md
- `CLAUDE.md` 行 7-10 全是 hook 开发约定，删除后只剩发布段
- `README.md` 的 Hooks 表格需要删除，Skills 表格需要更新
- `skills/harness-audit/SKILL.md` 行 47-50 有 hooks/ 检查项，行 79-81 有 hooks quality 检查

### Key Technical Decisions

- **product-spec-draft/check/sync 的 SKILL.md 直接从 modes/*.md 升级**：已有完整内容，只需加 YAML frontmatter
- **harness-audit 保留 hooks/ 检查**：这是审计用户项目的 hooks 配置，不是审计 ce-gs-harness 自己。用户项目可能有 hooks，保留。

## Implementation Units

- [ ] **Unit 1: Delete hooks/ directory**

**Goal:** 完全移除 hook 系统。

**Requirements:** R1

**Dependencies:** None

**Files:**
- Delete: `hooks/hooks.json`
- Delete: `hooks/scripts/pre-completion.js`
- Delete: `hooks/scripts/pre-completion.test.js`
- Delete: `hooks/scripts/lib/utils.js`
- Delete: `hooks/scripts/lib/utils.test.js`

**Approach:**
- `git rm -r hooks/` 一条命令删除整个目录

**Test expectation:** none — 纯删除

**Verification:**
- `hooks/` 目录不存在
- `git status` 显示 5 个文件已删除

---

- [ ] **Unit 2: Strengthen workflow-map reminders**

**Goal:** 去掉 hook 引用，把提醒措辞从"建议"改为明确的触发条件。

**Requirements:** R2

**Dependencies:** Unit 1

**Files:**
- Modify: `rules/workflow-map.md`

**Approach:**
- 阶段提醒职责段：删除"标注 `[hook 会提醒]` 的步骤有 pre-completion hook 兜底"这句话
- 阶段 5 的 4 个步骤：去掉 `← [hook 会提醒]` 标注，改为在提醒职责段写明触发条件：
  - /product-spec sync：改动涉及 docs/brainstorms/ 或 docs/plans/ + 有代码改动时
  - /product-spec check：代码改动 ≥3 个文件时
  - gstack /qa：有 UI/页面文件改动时
  - gstack /cso：改了 auth/payment/token/secret 等安全相关路径时

**Patterns to follow:**
- 现有 workflow-map.md 的格式

**Test expectation:** none — markdown 文件

**Verification:**
- 文件中不包含 "hook" 字样
- 4 个提醒场景的触发条件明确写在阶段提醒职责段中

---

- [ ] **Unit 3: Split product-spec into 3 independent skills**

**Goal:** 拆分为 product-spec-draft、product-spec-check、product-spec-sync，每个可独立触发。

**Requirements:** R3

**Dependencies:** None

**Files:**
- Create: `skills/product-spec-draft/SKILL.md`（从 modes/draft.md 升级，加 frontmatter）
- Create: `skills/product-spec-check/SKILL.md`（从 modes/check.md 升级，加 frontmatter）
- Create: `skills/product-spec-sync/SKILL.md`（从 modes/sync.md 升级，加 frontmatter）
- Delete: `skills/product-spec/SKILL.md`
- Delete: `skills/product-spec/modes/draft.md`
- Delete: `skills/product-spec/modes/check.md`
- Delete: `skills/product-spec/modes/sync.md`

**Approach:**
- 每个新 SKILL.md = YAML frontmatter + 原 modes/*.md 内容
- frontmatter 格式参考 harvest/SKILL.md（name + description trigger 语句）
- product-spec-draft description: `Use when: drafting product requirements. Trigger on: "product-spec-draft", "/product-spec-draft", "产品需求", "产品文档起草".`
- product-spec-check description: `Use when: checking feature completeness against code. Trigger on: "product-spec-check", "/product-spec-check", "功能完整度", "产品检查".`
- product-spec-sync description: `Use when: syncing design docs to Product-Spec.md. Trigger on: "product-spec-sync", "/product-spec-sync", "同步产品文档", "产品同步".`

**Patterns to follow:**
- `skills/harvest/SKILL.md` 的 frontmatter 格式

**Test expectation:** none — SKILL.md 文件

**Verification:**
- 3 个新 skill 目录各有 SKILL.md
- 旧 `skills/product-spec/` 目录已删除
- 每个 SKILL.md 有完整的 YAML frontmatter

---

- [ ] **Unit 4: Update CLAUDE.md and README.md**

**Goal:** 删除 hook 引用，更新组件清单。

**Requirements:** R4

**Dependencies:** Units 1, 3

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Approach:**
- CLAUDE.md：删除 4 行 hook 开发约定（行 7-10），保留测试约定和发布段
- README.md：
  - Skills 表格从 3 行改为 5 行（harvest、product-spec-draft、product-spec-check、product-spec-sync、harness-audit）
  - 删除 Hooks 表格
  - 更新 Skills 数量从 3 改为 5

**Test expectation:** none — 文档更新

**Verification:**
- CLAUDE.md 不含 "hook" / "Hook" 字样
- README.md Skills 表格有 5 行，无 Hooks 表格

## System-Wide Impact

- **Unchanged invariants:** harvest skill、noise-filter、tdd-plan-default 不受影响。harness-audit 保留 hooks/ 检查（审计用户项目，非审计自身）。全局 CLAUDE.md 不变。

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 删 hooks/ 后忘记更新引用 | Unit 4 验证：grep "hook" 确认无残留引用 |
| 拆分后 product-spec 内容丢失 | 对比新旧文件行数确认内容完整迁移 |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-11-simplify-hooks-and-split-product-spec-requirements.md](docs/brainstorms/2026-04-11-simplify-hooks-and-split-product-spec-requirements.md)
- Related code: `hooks/`, `skills/product-spec/`, `rules/workflow-map.md`, `CLAUDE.md`, `README.md`

---
title: "Remove hooks, split product-spec into 3 skills"
type: requirements
status: ready-for-planning
date: 2026-04-11
---

# Remove hooks, split product-spec into 3 skills

## Problem

1. pre-completion hook 在 VS Code 环境下不触发，调试成本高收益低。workflow-map rule 已经覆盖了相同的提醒场景，hook 是多余的。
2. product-spec 的 args 路由机制（一个 skill 三个 mode）不支持命令行独立触发 check 和 sync。

## Requirements

### R1. 删除 hook 系统

删除所有 hook 相关文件：
- `hooks/hooks.json`
- `hooks/scripts/pre-completion.js`
- `hooks/scripts/pre-completion.test.js`
- `hooks/scripts/lib/utils.js`
- `hooks/scripts/lib/utils.test.js`
- 整个 `hooks/` 目录

### R2. 强化 workflow-map 提醒措辞

把 workflow-map 的"阶段提醒职责"中原本标注 `[hook 会提醒]` 的 4 个步骤，改为明确的触发条件和动作（不再依赖 hook 兜底）。

### R3. 拆分 product-spec 为 3 个独立 skill

- `skills/product-spec-draft/SKILL.md` — 对话收集需求，生成 Product-Spec.md
- `skills/product-spec-check/SKILL.md` — 功能完整度检查
- `skills/product-spec-sync/SKILL.md` — 设计文档同步

删除原 `skills/product-spec/` 目录（SKILL.md 和 modes/）。

### R4. 更新关联文件

- CLAUDE.md：如果提到 hooks 相关内容，删除
- README.md：更新组件清单（Hooks 从 1 改为 0，Skills 从 3 改为 5）
- harness-audit SKILL.md：去掉 hooks/ 相关的检查项

## Scope Boundaries

- 不修改全局 CLAUDE.md
- 不修改 noise-filter / tdd-plan-default / workflow-map 的阶段内容（只改提醒措辞）
- 不修改 harvest skill

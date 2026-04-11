---
title: "Split rules by project type"
type: requirements
status: ready-for-planning
date: 2026-04-11
---

# Split rules by project type

## Problem

Claude Code 插件的 `rules/` 目录不会自动加载到会话上下文，只有项目级 `.claude/rules/` 才会。当前 harness-audit init 模式会把 3 条 rules 全量复制到项目中，但代码项目不需要 Superpowers 链导航，非代码项目不需要 CE 链导航和 TDD 纪律。多余的 rules 浪费上下文 tokens。

## Solution

拆分 workflow-map 为两个文件（CE 版和 Superpowers 版），harness-audit 按项目类型智能选择复制哪些 rules。

## Requirements

### R1. 拆分 workflow-map

将 `rules/workflow-map.md` 拆为：
- `rules/workflow-map-ce.md` — CE 链阶段导航 + 阶段提醒职责（代码项目用）
- `rules/workflow-map-sps.md` — Superpowers 链阶段导航（非代码项目用）

删除原 `rules/workflow-map.md`。

### R2. harness-audit 按项目类型复制 rules

检测逻辑：存在 package.json / tsconfig.json / pyproject.toml / go.mod / requirements.txt / Cargo.toml / Gemfile / pom.xml / build.gradle 任一文件 → 代码项目。否则 → 非代码项目。

复制策略：

| 文件 | 代码项目 | 非代码项目 |
|------|---------|-----------|
| workflow-map-ce.md | ✅ | ❌ |
| workflow-map-sps.md | ❌ | ✅ |
| tdd-plan-default.md | ✅ | ❌ |
| noise-filter.md | ✅ | ✅ |

### R3. harness-audit 版本对比

audit 模式下，如果项目 `.claude/rules/` 已有 harness rules，对比内容是否与插件源版本一致。不一致时提醒"harness rules 有更新可用"并询问是否覆盖。

### R4. 项目类型变更处理

audit 模式下，如果检测到项目类型与已安装的 rules 不匹配（例如之前装了 Superpowers 版但现在有了 package.json），提醒用户并询问是否切换。

## Scope Boundaries

- 不修改全局 CLAUDE.md
- 不修改 pre-completion hook
- 不修改 harvest / product-spec skill
- workflow-map 内容不变，只拆文件

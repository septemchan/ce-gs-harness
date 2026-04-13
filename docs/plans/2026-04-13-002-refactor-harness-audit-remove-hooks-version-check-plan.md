---
title: "refactor: harness-audit 删除 hooks 检查 + 版本标记对比"
type: refactor
status: active
date: 2026-04-13
origin: docs/brainstorms/2026-04-13-harness-audit-remove-hooks-and-version-check-requirements.md
---

# refactor: harness-audit 删除 hooks 检查 + 版本标记对比

## Overview

从 harness-audit 中删除所有 hooks 相关检查（ce-gs-harness 已不使用 hooks），并将 rules 版本检查从内容逐字比对改为版本标记比对。(see origin: docs/brainstorms/2026-04-13-harness-audit-remove-hooks-and-version-check-requirements.md)

## Requirements Trace

- R1. 从 Layer 1 删除 hooks 检查项
- R2. 从 Layer 2 删除 hooks quality 检查
- R3. 从评分降级条件、修复建议、Gotchas 等删除 hooks 引用
- R4. 调整总分计算
- R5. 每个 harness rule 文件末尾加版本注释
- R6. init mode 安装 rules 时自动加版本注释
- R7. audit mode 读取版本注释比对插件版本
- R8. 版本比对独立为明确的检查步骤

## Scope Boundaries

- 不改 hooks 在 Claude Code 平台层的功能
- 不改其他 skill
- 版本注释只加在 harness 自己的 rule 文件里

## Key Technical Decisions

- 版本注释格式 `<!-- ce-gs-harness vX.Y.Z -->`：HTML 注释不影响 rule 内容渲染，版本号跟 plugin.json 一致
- Layer 1 权重调整：删除 hooks 后 High 类只剩 rules/ 和 settings.json，总分分母变小，不影响评分逻辑

## Implementation Units

- [x] **Unit 1: 删除 harness-audit 中的 hooks 检查**

**Goal:** 移除所有 hooks 相关的检查、评分、建议

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Modify: `skills/harness-audit/SKILL.md`

**Approach:**

删除以下内容：
- Layer 1 High (×2) 下的 `**hooks/**` 检查块（存在性检查 + 说明）
- Layer 2 的 `**hooks/ quality**` 检查块
- 评分降级条件中的 "broken hooks" 引用
- Important notes 修复建议中的 hooks 条目
- Gotchas 和其他散落的 hooks 引用
- Architecture highlights 中的 "hook guards" 引用

调整文字：
- Layer 2 降级条件中 "redundant permissions, phantom references, broken hooks" → 去掉 broken hooks
- README 交叉检查中的 "hooks" 引用考虑是否保留（README 检查是通用的，项目可能自己有 hooks，保留 hooks 作为 README 检查项之一）

**Test expectation:** none — pure documentation change

**Verification:**
- grep `hook` 在 harness-audit SKILL.md 中应无匹配（除非 README 交叉检查保留了通用引用）

- [x] **Unit 2: 给所有 harness rule 文件加版本注释**

**Goal:** 每个 rule 文件末尾标记当前插件版本

**Requirements:** R5

**Dependencies:** None

**Files:**
- Modify: `rules/workflow-map.md`
- Modify: `rules/tdd-plan-default.md`
- Modify: `rules/noise-filter.md`
- Modify: `rules/source-dir-convention.md`
- Modify: `rules/karpathy-coding-guidelines.md`

**Approach:**

在每个 rule 文件末尾加一行：`<!-- ce-gs-harness v0.8.0 -->`（使用本次升版后的版本号）

**Test expectation:** none — pure annotation

**Verification:**
- 每个 rule 文件末尾有版本注释

- [x] **Unit 3: 更新 harness-audit 版本检查逻辑**

**Goal:** 将 rules 版本检查从内容比对改为版本标记比对，并独立为明确步骤

**Requirements:** R6, R7, R8

**Dependencies:** Unit 1（hooks 删除后再改版本检查，避免冲突）

**Files:**
- Modify: `skills/harness-audit/SKILL.md`

**Approach:**

**Audit mode（R7, R8）：**
- 将 Layer 1 rules 检查中嵌套的 `**Version check**` 提取为独立检查步骤
- 新逻辑：读取已安装 rule 文件末尾的 `<!-- ce-gs-harness vX.Y.Z -->` 注释，与当前插件 plugin.json 版本比较
- 版本注释缺失或版本号低于当前版本 → 提示 "harness rules 有更新可用（本地 vX.Y.Z → 最新 vA.B.C）"
- 版本注释存在且版本号一致 → 通过

**Init mode（R6）：**
- step 3 安装 rules 时，复制文件后在末尾追加 `<!-- ce-gs-harness vX.Y.Z -->`（X.Y.Z 来自插件 plugin.json）
- 如果文件已有版本注释行，替换为当前版本

**Patterns to follow:**
- 现有 `skills/harness-audit/SKILL.md` 的检查项格式

**Test expectation:** none — pure documentation change

**Verification:**
- audit mode 有独立的版本检查步骤，不再嵌套在 rules 存在性检查里
- init mode 描述了安装后追加版本注释的行为

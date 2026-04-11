---
title: "feat: Split rules by project type"
type: feat
status: active
date: 2026-04-11
origin: docs/brainstorms/2026-04-11-split-rules-by-project-type-requirements.md
---

# feat: Split rules by project type

## Overview

将 workflow-map.md 拆为 CE 版和 Superpowers 版，让 harness-audit 按项目类型智能选择复制哪些 rules 到项目的 `.claude/rules/`。

## Problem Frame

Claude Code 插件的 `rules/` 不自动加载到会话上下文，只有项目级 `.claude/rules/` 才会。harness-audit init 模式全量复制 3 条 rules，但代码项目不需要 Superpowers 链，非代码项目不需要 CE 链和 TDD。多余的 rules 浪费上下文 tokens。

（see origin: docs/brainstorms/2026-04-11-split-rules-by-project-type-requirements.md）

## Requirements Trace

- R1. 拆分 workflow-map 为 CE 版和 Superpowers 版
- R2. harness-audit 按项目类型复制对应 rules 子集
- R3. audit 模式下对比 rules 版本，过期时提醒更新
- R4. 检测项目类型与已安装 rules 不匹配时提醒切换

## Scope Boundaries

- 不修改全局 CLAUDE.md
- 不修改 pre-completion hook
- 不修改 harvest / product-spec skill
- workflow-map 内容不变，只拆文件

## Context & Research

### Relevant Code and Patterns

- `rules/workflow-map.md`（57 行）：行 3-15 为通用部分（路由原则 + 阶段提醒职责），行 17-49 为 CE 链，行 51-57 为 Superpowers 链
- `skills/harness-audit/SKILL.md` 行 130-132：当前 init 模式的 rules 复制逻辑（全量复制 3 条）
- `skills/harness-audit/SKILL.md` 行 38-40：audit 模式的 rules/ 检查（含 version check）

### Institutional Learnings

- 插件 `rules/` 不被 Claude Code 自动加载，只有项目级 `.claude/rules/` 才会（本次开发中发现并验证）

## Key Technical Decisions

- **阶段提醒职责放入 CE 版**：这段内容描述的全是 CE 链跨插件步骤的提醒时机，Superpowers 链不需要。
- **项目类型检测复用 harness-audit 已有逻辑**：init 模式行 130-131 已有 config 文件检测列表，扩展即可。
- **Superpowers 版保留"阶段 1 同 CE 链"引用**：非代码项目也需要初始化（/harvest、/product-spec、/harness-audit），CE 版阶段 1 的内容在 Superpowers 版中保留。

## Open Questions

### Resolved During Planning

- **阶段提醒职责放哪个版本**：放 CE 版。Superpowers 链内部自动接力，不需要跨插件提醒。
- **两个版本是否都包含路由原则（"起点决定链路"）**：不包含。全局 CLAUDE.md 已有路由原则，项目级 rule 不重复。

### Deferred to Implementation

- 无

## Implementation Units

- [ ] **Unit 1: Split workflow-map into two files**

**Goal:** 将 workflow-map.md 拆为 CE 版和 Superpowers 版，删除原文件。

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `rules/workflow-map-ce.md`
- Create: `rules/workflow-map-sps.md`
- Delete: `rules/workflow-map.md`

**Approach:**
- workflow-map-ce.md：阶段提醒职责 + CE 链阶段 1-6（从原文件行 5-49）
- workflow-map-sps.md：Superpowers 链（从原文件行 51-57），阶段 1 展开写（/harvest、/product-spec、/harness-audit），不引用"同 CE 链"
- 两个文件都不包含"起点决定链路"路由原则（全局 CLAUDE.md 已有）

**Patterns to follow:**
- 原 `rules/workflow-map.md` 的 markdown 格式

**Test expectation:** none — markdown 规则文件

**Verification:**
- 两个新文件内容完整覆盖原文件所有阶段
- 原 workflow-map.md 已删除
- CE 版包含阶段提醒职责，Superpowers 版不包含

---

- [ ] **Unit 2: Update harness-audit init mode with project type detection**

**Goal:** 修改 init 模式的 rules 复制逻辑，按项目类型选择复制哪些 rules。

**Requirements:** R2

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/harness-audit/SKILL.md`

**Approach:**
- 在 init 模式步骤 3（Install harness rules）中增加项目类型检测
- 检测逻辑：存在 package.json / tsconfig.json / pyproject.toml / go.mod / requirements.txt / Cargo.toml / Gemfile / pom.xml / build.gradle 任一 → 代码项目
- 代码项目：复制 workflow-map-ce.md + tdd-plan-default.md + noise-filter.md
- 非代码项目：复制 workflow-map-sps.md + noise-filter.md
- 询问文案改为体现项目类型："检测到代码项目，要复制 CE 链 rules 吗？" / "检测到非代码项目，要复制 Superpowers 链 rules 吗？"

**Patterns to follow:**
- init 模式步骤 2 已有的 config 文件检测列表（行 130-131）

**Test expectation:** none — SKILL.md 是 prompt 指令文件

**Verification:**
- 在代码项目中跑 /harness-audit，询问复制 CE 链 rules
- 在空项目中跑 /harness-audit，询问复制 Superpowers 链 rules

---

- [ ] **Unit 3: Update harness-audit audit mode with version check and type mismatch**

**Goal:** audit 模式下增加 rules 版本对比和项目类型不匹配检测。

**Requirements:** R3, R4

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/harness-audit/SKILL.md`

**Approach:**
- 版本对比（R3）：对比项目 `.claude/rules/` 中的 harness rules 内容与插件源 `<skill-path>/../../rules/` 的内容。不一致时报告"harness rules 有更新可用"并询问是否覆盖。
- 类型不匹配（R4）：检测项目类型，对比已安装的 workflow-map 文件名（workflow-map-ce.md vs workflow-map-sps.md）。如果项目类型变化（例如原来是非代码项目现在有了 package.json），提醒并询问是否切换。
- 两项检查都在 audit 模式 Layer 1 的 rules/ 检查中执行，结果纳入评分。

**Patterns to follow:**
- audit 模式 Layer 1 已有的 rules/ 检查逻辑（行 38-40）
- 已有的 version check 描述（行 40 附近）

**Test expectation:** none — SKILL.md 是 prompt 指令文件

**Verification:**
- 项目有旧版 rules 时，audit 报告"有更新可用"
- 代码项目装了 Superpowers 版 rules 时，audit 报告类型不匹配

## System-Wide Impact

- **Interaction graph:** harness-audit 的 init/audit 模式改变复制行为。其他 skills/hooks 不受影响。
- **Unchanged invariants:** noise-filter.md 和 tdd-plan-default.md 内容不变。pre-completion hook 不受影响。全局 CLAUDE.md 不受影响。

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 拆分后遗漏内容 | Unit 1 验证：两个新文件完整覆盖原文件所有阶段 |
| harness-audit 项目类型误判 | config 文件检测列表足够全面（9 种），边缘情况下用户可在询问时选择另一套 |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-11-split-rules-by-project-type-requirements.md](docs/brainstorms/2026-04-11-split-rules-by-project-type-requirements.md)
- Related code: `rules/workflow-map.md`, `skills/harness-audit/SKILL.md`

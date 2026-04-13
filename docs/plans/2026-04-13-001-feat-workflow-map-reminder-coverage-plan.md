---
title: "feat: 补全 workflow-map 阶段提醒覆盖"
type: feat
status: active
date: 2026-04-13
origin: docs/brainstorms/2026-04-13-workflow-map-reminder-coverage-requirements.md
---

# feat: 补全 workflow-map 阶段提醒覆盖

## Overview

workflow-map.md 的"阶段提醒职责"目前只覆盖新项目初始化和特定完成后触发点，缺少"新工作入口"和"中断处理"两类提醒。补全后确保所有工作场景都有流程提醒。(see origin: docs/brainstorms/2026-04-13-workflow-map-reminder-coverage-requirements.md)

## Requirements Trace

- R1. 新增"新工作入口"提醒：用户描述任何新需求/bug/改进时，提醒从 brainstorm 开始
- R2. 新增"中断处理"提醒：工作流程中用户提出新问题时，提醒开新的 brainstorm
- R3. 将"阶段 1：项目初始化"的提醒范围扩大，不限于新项目
- R4. 保留现有的 post-completion 提醒

## Scope Boundaries

- 只改 `rules/workflow-map.md`
- 不改阶段结构（阶段 2-6 保持不变）
- 不新增文件

## Key Technical Decisions

- 提醒按触发时机分组（入口、过程中、完成后），而不是按阶段编号分组：因为提醒的目的是让 AI 在对的时机做对的事，按时机分组更直觉
- "阶段 1"改名为"项目上下文检查"而非"项目初始化"：因为旧项目也需要检查上下文

## Implementation Units

- [x] **Unit 1: 重写"阶段提醒职责"section + 更新"阶段 1"命名**

**Goal:** 补全提醒覆盖，使所有工作场景（新项目、旧项目加功能、修 bug、中途插入新工作）都有流程提醒

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Modify: `rules/workflow-map.md`

**Approach:**

重写"阶段提醒职责"section，按触发时机分三组：

**1. 新工作入口（R1）**
- 用户描述新需求/功能/改进/bug 时，提醒从 `/ce:brainstorm` 开始
- 不管是新项目还是旧项目，不管是新对话还是旧对话

**2. 工作流中断（R2）**
- 正在执行 plan/work 时用户提出新问题或发现新 bug，提醒开新的 brainstorm 而不是顺手改
- 当前工作流可以暂停或完成后再处理

**3. 阶段完成后衔接（R4，保留现有）**
- 保留现有的 /ce:work 完成后、/ce:review 通过后等触发点
- 保留 UI 工作、安全审计、QA 等跨插件提醒

**阶段 1 命名（R3）：**
- "项目初始化" → "项目上下文检查"
- 检查项扩大：不只是文件是否存在，还包括 CLAUDE.md 是否过时、Product-Spec.md 是否跟代码对得上

**Patterns to follow:**
- 现有 `rules/workflow-map.md` 的 markdown 格式和中文风格

**Test expectation:** none — pure documentation change

**Verification:**
- 读完新的"阶段提醒职责"，能回答：旧项目加功能时 AI 会提醒什么？执行 plan 中途用户说有 bug 时 AI 会怎么做？

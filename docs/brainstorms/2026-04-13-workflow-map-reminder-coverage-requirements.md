---
date: 2026-04-13
topic: workflow-map-reminder-coverage
---

# Workflow Map 阶段提醒覆盖补全

## Problem Frame

workflow-map.md 的"阶段提醒职责"覆盖不全。现有提醒只在特定触发点生效（新项目初始化、/ce:work 完成后、/ce:review 通过后），缺少两类关键场景：

1. **新工作入口**：用户在旧项目上描述新需求、bug、改进时，AI 没有提醒从 brainstorm 开始，容易直接上手改代码
2. **中断处理**：工作流程中用户提出新问题时，AI 容易顺手解决而不是开新的 brainstorm

这跟全局 CLAUDE.md 中已删除的"简单任务不强制走全流程"规则一致 — 所有任务都必须走流程，workflow-map 需要在每个入口确保提醒。

## Requirements

- R1. 新增"新工作入口"提醒：用户描述任何新需求/bug/改进时，提醒从 brainstorm 开始
- R2. 新增"中断处理"提醒：工作流程中用户提出新问题时，提醒开新的 brainstorm 而不是顺手改
- R3. 将"阶段 1：项目初始化"的提醒范围扩大，不限于新项目
- R4. 保留现有的 post-completion 提醒（/ce:work 完成后、/ce:review 通过后等）

## Success Criteria

- AI 在旧项目上收到"帮我修个 bug"时，提醒走 brainstorm
- AI 在执行 plan 过程中用户提到新问题时，建议开新 brainstorm 而不是直接改

## Scope Boundaries

- 只改 workflow-map.md 的"阶段提醒职责"section 和"阶段 1"命名
- 不改阶段结构本身（阶段 2-6 保持不变）
- 不新增文件

## Next Steps

-> /ce:plan for structured implementation planning

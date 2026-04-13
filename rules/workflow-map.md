# Workflow Map

## 阶段提醒职责

CE 链内部（brainstorm → plan → work → review → compound）由 CE 自动接力提醒，不需要你操心。但以下场景没有人提醒，你需要主动建议：

### 新工作入口

用户描述新需求、新功能、改进或 bug 时，提醒从 `/ce:brainstorm` 开始。不管是新项目还是旧项目，不管是新对话还是旧对话，所有新工作都走完整流程。

### 工作流中断

正在执行 plan/work 时用户提出新问题或发现新 bug，提醒开新的 `/ce:brainstorm` 而不是顺手改。当前工作流可以暂停或完成后再处理新问题。

### 阶段完成后衔接

- 开始工作前：检查 .claude/CLAUDE.md 和 Product-Spec.md 是否存在且不过时
- 实现前有 UI 工作时：建议先跑 /ui-ux-pro-max
- /ce:work 完成后：改动涉及 docs/brainstorms/ 或 docs/plans/ + 有代码改动 → 建议 `/ce-gs-harness:product-spec-sync`，然后 `/ce-gs-harness:product-spec-check`
- /ce:work 完成后：代码改动 ≥3 个文件 → 建议 `/ce-gs-harness:product-spec-check`
- /ce:review 通过后：有 UI/页面文件改动（.html/.css/.tsx/.jsx/.vue 或 components/pages/ 目录）→ 建议 gstack /qa
- /ce:review 通过后：改了 auth/payment/token/secret/credential/session 相关路径 → 建议 gstack /cso
- 发布后：建议 gstack /canary 监控

## 阶段

**阶段 1：项目上下文检查**
- 没有 .claude/CLAUDE.md 或内容过时 → `/ce-gs-harness:harvest`
- 没有 Product-Spec.md 或与代码不同步 → `/ce-gs-harness:product-spec-draft`
- .claude/ 需要体检 → `/ce-gs-harness:harness-audit`

**阶段 2：构思**
- 不知道做什么 → `/ce:ideate`（可选） → 选中想法后 → `/ce:brainstorm` ↓

**阶段 3：规划**
- 技术计划 → `/ce:plan` ↓
- 多视角审查 → gstack `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` ↓

**阶段 4：实现**
- 有前端 UI 工作 → `/ui-ux-pro-max`（实现前调用）
- 执行计划 → `/ce:work` ↓

**阶段 5：质量 & 发布**
- 代码审查 → `/ce:review` ← CE 从 /ce:work 自动触发
- 同步设计文档 → `/ce-gs-harness:product-spec-sync`
- 产品完整度检查 → `/ce-gs-harness:product-spec-check`
- 前端视觉 QA → gstack `/design-review`
- 功能 QA → gstack `/qa`
- 安全审计 → gstack `/cso`
- 发布 → gstack `/ship` → `/land-and-deploy`
- 部署后监控 → gstack `/canary`
- 更新项目文档 → gstack `/document-release`

**阶段 6：维护**
- 修了 bug / 完成功能 → `/ce:compound`
- 查看历史会话 → `/ce:sessions`
- 保存/恢复工作状态 → gstack `/checkpoint`

<!-- ce-gs-harness v0.8.0 -->

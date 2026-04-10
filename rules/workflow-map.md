# Workflow Map

起点决定链路：代码项目走 CE 链，非代码项目走 Superpowers 链。

## 阶段提醒职责

CE 链内部（brainstorm → plan → work → review → compound）由 CE 自动接力提醒，不需要你操心。但跨插件的步骤没有人提醒，你需要在合适的时机主动建议：

- 项目初始化（阶段 1）：新项目开始工作前，检查 .claude/CLAUDE.md 和 Product-Spec.md 是否存在
- 实现前有 UI 工作时：建议先跑 /ui-ux-pro-max
- /ce:work 完成后：如果改动涉及设计文档，建议 /product-spec sync → /product-spec check
- /ce:review 通过后：如果涉及 UI/页面改动，建议 gstack /qa；如果涉及安全相关文件，建议 gstack /cso
- 发布后：建议 gstack /canary 监控

标注 `[hook 会提醒]` 的步骤有 pre-completion hook 兜底，但不要依赖 hook，能提前建议就提前建议。

## CE 链（代码项目）

**阶段 1：项目初始化**
- 没有 .claude/CLAUDE.md → `/harvest`
- 没有 Product-Spec.md → `/product-spec`
- .claude/ 需要体检 → `/harness-audit`

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
- 同步设计文档 → `/product-spec sync` ← [hook 会提醒]
- 产品完整度检查 → `/product-spec check` ← [hook 会提醒]
- 前端视觉 QA → gstack `/design-review`
- 功能 QA → gstack `/qa` ← [hook 会提醒]
- 安全审计 → gstack `/cso` ← [hook 会提醒]
- 发布 → gstack `/ship` → `/land-and-deploy`
- 部署后监控 → gstack `/canary`
- 更新项目文档 → gstack `/document-release`

**阶段 6：维护**
- 修了 bug / 完成功能 → `/ce:compound`
- 查看历史会话 → `/ce:sessions`
- 保存/恢复工作状态 → gstack `/checkpoint`

## Superpowers 链（非代码项目）

- 阶段 1：项目初始化（同 CE 链）
- 阶段 2：构思 → `/superpowers:brainstorming` ↓
- 阶段 3：规划 → `/superpowers:writing-plans` → 多视角审查（可选）gstack `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` ↓
- 阶段 4：执行 → `/superpowers:executing-plans`
- 阶段 5、6 的 gstack 工具按需使用，同 CE 链

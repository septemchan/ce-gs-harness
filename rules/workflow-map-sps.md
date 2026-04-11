# Workflow Map — Superpowers 链（非代码项目）

## 阶段

**阶段 1：项目初始化**
- 没有 .claude/CLAUDE.md → `/harvest`
- 没有 Product-Spec.md → `/product-spec`
- .claude/ 需要体检 → `/harness-audit`

**阶段 2：构思**
- 明确要做什么 → `/superpowers:brainstorming` ↓

**阶段 3：规划**
- 实施计划 → `/superpowers:writing-plans` ↓
- 多视角审查（可选） → gstack `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` ↓

**阶段 4：执行**
- 执行计划 → `/superpowers:executing-plans` ↓ 自动触发 verification-before-completion 和 requesting-code-review

**阶段 5：质量**
- 前端视觉 QA → gstack `/design-review`
- 功能 QA → gstack `/qa`
- 安全审计 → gstack `/cso`
- 发布 → gstack `/ship` → `/land-and-deploy`
- 部署后监控 → gstack `/canary`
- 更新项目文档 → gstack `/document-release`

**阶段 6：维护**
- 保存/恢复工作状态 → gstack `/checkpoint`

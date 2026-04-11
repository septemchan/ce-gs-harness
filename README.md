# ce-gs-harness

CE + gstack 的基础设施插件。提供项目上下文维护、阶段导航、TDD 纪律和输出质量控制。

## 安装

```bash
claude plugins marketplace add septemchan/ce-gs-harness
claude plugins install ce-gs-harness@ce-gs-harness
```

## 组件

### Rules (3)

| Rule | 作用 |
|------|------|
| workflow-map | CE 链全阶段导航 + 跨插件提醒职责 |
| tdd-plan-default | CE /ce:plan 默认标记 test-first |
| noise-filter | 输出质量控制（>80% 置信度、合并重复、只报客观问题） |

### Skills (5)

| Skill | 作用 |
|-------|------|
| /harvest | 从设计文档 + 项目文件生成 .claude/CLAUDE.md |
| /product-spec-draft | 对话收集需求，生成 Product-Spec.md |
| /product-spec-check | 对比 Product-Spec.md 和代码，检查功能完整度 |
| /product-spec-sync | 同步设计文档内容到 Product-Spec.md |
| /harness-audit | 评估 .claude/ 配置健康度，安装 harness rules |

## 配套插件

- **CE (Compound Engineering)** — 开发全链：brainstorm → plan → work → review → compound
- **gstack** — 外部操作：QA、发布、部署、监控、安全

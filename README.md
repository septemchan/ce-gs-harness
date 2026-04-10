# ce-gs-harness

CE + gstack 的基础设施插件。提供项目上下文维护、阶段导航、TDD 纪律和会话结束提醒。

## 安装

```bash
claude plugins install /path/to/ce-gs-harness
```

## 组件

### Rules (3)

| Rule | 作用 |
|------|------|
| workflow-map | CE 链和 Superpowers 链的全阶段导航 |
| tdd-plan-default | CE /ce:plan 默认标记 test-first |
| noise-filter | 输出质量控制（>80% 置信度、合并重复、只报客观问题） |

### Skills (3)

| Skill | 作用 |
|-------|------|
| /harvest | 从设计文档 + 项目文件生成 .claude/CLAUDE.md |
| /product-spec | 维护 Product-Spec.md（draft/check/sync 三模式） |
| /harness-audit | 评估 .claude/ 配置健康度 |

### Hooks (1)

| Hook | 事件 | 作用 |
|------|------|------|
| pre-completion | Stop | 会话结束前基于 git status 提醒遗漏步骤 |

## 配套插件

- **CE (Compound Engineering)** — 开发全链：brainstorm → plan → work → review → compound
- **gstack** — 外部操作：QA、发布、部署、监控、安全

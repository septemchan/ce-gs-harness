# ce-gs-harness 设计文档

日期：2026-04-10

## 背景

用户从 superpowers 切换到 CE（Compound Engineering）+ gstack 双插件方案。sps-harness 是配合 superpowers 使用的工作流基础设施，现在需要针对 CE+gstack 重建。

### 为什么换

- Superpowers 的 brainstorming 有 HARD-GATE（修 bug 时不让进）
- Superpowers 的 review 只有 1 个 reviewer
- Superpowers 没有知识沉淀机制
- CE 解决了这三个问题：不区分新功能/修 bug、17 reviewer 并行、/ce:compound 沉淀经验

### CE+gstack 分工

- **CE** 负责开发全链：ce:brainstorm → ce:plan → ce:work → ce:review → ce:compound
- **gstack** 负责外部世界：/qa、/browse、/ship、/land-and-deploy、/canary、/cso

### harness 解决什么

CE 管开发流程，gstack 管外部操作，但有三件事它们都不做：

1. **不知道项目是什么** — 没有工具自动生成项目 .claude/CLAUDE.md 或维护 Product-Spec.md
2. **不知道该干什么** — CE 的线性流程（brainstorm → plan → work → review）内部有接力提醒，但跨插件的工具（/ui-ux-pro-max、/cso、/qa、/product-spec sync 等）没有人提醒
3. **不知道 .claude/ 配置是否健康** — 没有工具评估 .claude/ 目录的完整性

### CE brainstorm vs Product-Spec.md

CE /ce:brainstorm 产出的 requirements doc（`docs/brainstorms/*-requirements.md`）功能上等同于轻量 PRD，包含问题框架、需求列表、范围边界、成功标准等。但它是**一次性创建**的，brainstorm 完成后不再维护。

Product-Spec.md 是**持续维护**的项目级产品文档，通过 /product-spec check（对比代码实现）和 /product-spec sync（同步已落地的功能）保持与项目同步。两者互补：CE brainstorm 产出单次需求，Product-Spec.md 维护全局产品视图。

## 定位与边界

### 是什么

CE+gstack 的基础设施层：

- 项目上下文维护（.claude/CLAUDE.md + Product-Spec.md + .claude/ 健康度）
- 阶段导航（workflow-map 告诉 Claude 当前阶段该用哪个命令）
- 主动提醒（hook 在会话结束前提醒遗漏步骤，只提醒不拦截）
- TDD 纪律（让 CE plan 默认标记 test-first）

### 不是什么

- 不做需求探索（CE /ce:brainstorm）
- 不做技术规划（CE /ce:plan）
- 不做代码执行（CE /ce:work）
- 不做代码审查（CE /ce:review，17 reviewers）
- 不做知识沉淀（CE /ce:compound）
- 不做 QA / 发布 / 部署 / 监控（gstack）
- 不做安全审计（gstack /cso）
- 不做代码质量 hooks（信任 CE）
- 不做 git 安全 hooks（信任 CE + settings.json）
- 不做 compact 管理（需要时手动用 gstack /checkpoint）

### 与 sps-harness 的关系

全部针对 CE+gstack 重写，不复制旧代码。参考旧 hook 的格式确保触发可靠性。

---

## 安装后配置

### 禁用 Superpowers SessionStart hook

Superpowers 仍然安装（用于非编程项目手动调用），但其 SessionStart hook 会在每次新会话注入 118 行导航规则，与 harness 的 workflow-map rule 冲突。安装 ce-gs-harness 后需要禁用 Superpowers 的 SessionStart hook。

Superpowers 的 skill（TDD、debugging、verification 等）仍可手动调用，不受影响。

### 禁用 gstack 重叠功能

在全局 CLAUDE.md 禁用列表加入以下 gstack 功能（与 CE 或 harness 重叠）：

| 禁用 | 理由 |
|---|---|
| gstack /learn | CE /ce:compound 负责知识沉淀 |
| gstack /design-consultation | 与 /ui-ux-pro-max 功能重叠 |
| gstack /design-shotgun | 与 /ui-ux-pro-max 功能重叠 |
| gstack /health | CE /ce:review 已覆盖代码质量审查 |
| gstack /retro | CE /ce:compound 已覆盖知识沉淀 |
| gstack /careful | settings.json deny 已拦截危险命令 |

### 更新全局 CLAUDE.md

**删除「编码纪律」段落：** TDD 纪律由 harness 的 tdd-plan-default rule 管理。调试纪律不再独立维护（CE 和 Claude 自身能力已覆盖）。

**更新禁用列表：** 现有 4 条禁用项保留，追加 6 条新禁用项，更新 /investigate 条目：
- gstack /office-hours → 用 CE /ce:brainstorm（保留）
- gstack /autoplan → 用 CE /ce:plan（保留）
- gstack /review → 用 CE /ce:review（保留）
- gstack /investigate → 禁用（更新：原文引用编码纪律段落，该段落已删除）
- gstack /learn → 禁用，CE /ce:compound 负责知识沉淀（新增）
- gstack /design-consultation → 禁用，与 /ui-ux-pro-max 功能重叠（新增）
- gstack /design-shotgun → 禁用，与 /ui-ux-pro-max 功能重叠（新增）
- gstack /health → 禁用，CE /ce:review 已覆盖代码质量审查（新增）
- gstack /retro → 禁用，CE /ce:compound 已覆盖知识沉淀（新增）
- gstack /careful → 禁用，settings.json deny 已拦截危险命令（新增）

CLAUDE.md 保留：
- 交流规则（原则 + 输出格式）
- 插件分工路由表（CE vs gstack 分工 + 默认路由 + 禁用列表）
- 浏览器使用规则
- 核心原则

---

## 组件清单

| 类型 | 数量 | 内容 |
|---|---|---|
| Rules | 3 | workflow-map, tdd-plan-default, noise-filter |
| Skills | 3 | harvest, product-spec, harness-audit |
| Hooks | 1 | pre-completion |

对比 sps-harness（8 rules + 6 skills + 17 hooks + 3 agents + 8 commands），减少约 90%。

---

## Rules

### workflow-map

全流程阶段导航。标注每个阶段该用什么命令，哪些是 CE/gstack 自动接力的（用 ↓ 标记），哪些需要手动触发或 harness 提醒。

```
阶段 1：项目初始化
  没有 .claude/CLAUDE.md            → /harvest
  没有 Product-Spec.md              → /product-spec
  .claude/ 需要体检                 → /harness-audit

阶段 2：构思
  不知道做什么                      → /ce:ideate（可选，从代码里找改进方向）
                                      ↓ 选中一个想法后
  明确要做什么                      → /ce:brainstorm
                                      ↓ CE 自动建议 /ce:plan

阶段 3：规划
  技术计划                          → /ce:plan
  多视角计划审查                    → gstack /plan-ceo-review, /plan-eng-review, /plan-design-review
                                      ↓ CE 自动建议 /ce:work

阶段 4：实现
  有前端 UI 工作                    → /ui-ux-pro-max（实现前调用）
  执行计划                          → /ce:work
                                      ↓ CE 自动跑 /ce:review

阶段 5：质量 & 发布
                                      ↓ CE 从 /ce:work 自动触发 /ce:review
  代码审查                          → /ce:review（也可手动调用，用于维护阶段的小改动）
  同步设计文档到产品文档            → /product-spec sync（有设计文档变更 + 代码改动时，hook 会提醒）
  产品完整度检查                    → /product-spec check（较大代码改动时，hook 会提醒）
  前端视觉 QA（看起来对不对）       → gstack /design-review
  功能 QA（用起来对不对）           → gstack /qa（涉及 UI/页面的较大改动时，hook 会提醒）
  安全审计                          → gstack /cso（改了安全相关文件时，hook 会提醒）
  发布                              → gstack /ship → /land-and-deploy
  部署后监控                        → gstack /canary
  更新项目文档                      → gstack /document-release

阶段 6：维护
  修了 bug / 完成功能               → /ce:compound
  查看历史会话                      → /ce:sessions
  保存/恢复工作状态                 → gstack /checkpoint（手动，对话太长需要换新对话时使用）
```

### tdd-plan-default

让 CE /ce:plan 创建 implementation plan 时，每个 implementation unit 默认包含 `Execution note: test-first`。CE /ce:work 看到这个标记后自动走 TDD 流程（先写失败测试 → 验证失败 → 最小实现 → 验证通过 → commit）。

通过 CE 已有的 Execution note 机制实现 TDD，而不是独立维护一套 TDD 规则。

### noise-filter

控制 Claude 的输出质量。

- 只报告 >80% 置信度的发现
- 合并重复 pattern
- 只报客观正确性问题，不报风格偏好

---

## Skills

### harvest

从设计文档和项目文件生成/更新项目 .claude/CLAUDE.md。

**两种模式：**

- **Mode A（有设计文档）：** 读 `docs/brainstorms/`、`docs/plans/`、`docs/ideation/` + 扫描项目配置文件（package.json、tsconfig.json、pyproject.toml、go.mod 等）+ 扫描 `src/` 结构（限 2 层深度）
- **Mode B（无设计文档）：** 仅从项目配置文件和目录结构推断

**输出格式：** 固定 4 段

1. 技术栈
2. 命令（build、test、lint 等）
3. 架构（目录结构、核心模块）
4. 约定（命名、导入风格等）

限制 100 行以内。末尾注释标注生成来源。

**更新策略：** 已有 CLAUDE.md 时，生成新版本 → show diff → 用户选择 accept all / select / cancel。用户自定义段落（不在固定 4 段里的，包括 gstack /checkpoint 添加的 Skill routing 段落）保留不覆盖。

**与 gstack /document-release 的关系：** /harvest 负责初始生成和主动更新 CLAUDE.md，/document-release 负责发布后自动同步文档。两者不冲突（一个是主动生成，一个是发布后同步）。

### product-spec

维护 Product-Spec.md（项目级产品文档）。一个 skill，三个模式，通过 args 参数分发。

#### /product-spec 或 /product-spec draft

对话收集需求 → 生成/更新 Product-Spec.md。

**流程：**

1. 检查已有 Product-Spec.md（有则更新，无则新建）
2. 产品定位：做什么给谁用（追问到能画 UI 的程度）
3. 核心问题：解决什么问题 + 现有方案 + 差距
4. 核心功能：列出功能，追问到行为级别（用户动作 → 系统响应）
5. MVP 边界：明确列出第一版不做什么
6. AI 决策：是否需要 AI？需要的话生成 system prompt 草稿
7. 技术约束：前端 / 后端 / 数据存储 / 技术栈偏好
8. 自动推导：用户流（正常 + 异常）、数据模型、第三方依赖、非功能需求

**核心纪律：** 一次一个问题。不确定的标记 `[假设：...]`。

#### /product-spec check

从 Product-Spec.md 提取功能清单，扫描代码匹配度。

**流程：**

1. 读取 Product-Spec.md 中所有 `- [ ]`、`- [x]`、`- [~]` 条目
2. 扫描代码目录，按关键词匹配每个功能的实现状态
3. 判定：`[x]` 已完成 / `[~]` 部分完成 / `[ ]` 未实现
4. 输出分组报告 + 完成百分比 + 优先修复建议
5. 回写更新后的清单到 Product-Spec.md

低置信度匹配标记为"coverage uncertain"，不标为"未实现"。

#### /product-spec sync

同步设计文档内容到 Product-Spec.md。

**使用时机：** /ce:work 完成实现之后（不是 brainstorm 或 plan 创建之后，因为未执行的 plan 不应该同步到产品文档）。通过使用时机确保只同步已落地功能，sync 本身不验证代码是否存在（验证由 /product-spec check 负责）。

**建议顺序：** sync → check。先 sync 把新功能加到 Product-Spec.md（标记为 `[ ]`），再 check 扫描代码标记实现状态（`[x]`/`[~]`/`[ ]`）。

**流程：**

1. 读取 Product-Spec.md
2. 扫描 `docs/brainstorms/` 和 `docs/plans/` 中最近变更的文件
3. 对比差异，把新增/修改的内容更新到 Product-Spec.md
4. 追加变更记录到 Product-Changelog.md（没有则创建）

### harness-audit

评估 .claude/ 配置健康度。

**审计模式：** 检查以下项目是否存在且合理：

- .claude/CLAUDE.md（项目配置）
- Product-Spec.md（产品文档）
- rules/（规则文件）
- settings.json（权限配置）
- 各文件内容是否过时或矛盾

输出评分 + 具体改进建议（附文件路径和具体问题）。

**初始化模式：** 新项目 .claude/ 为空时，检测是否有设计文档：

- 有 → 建议跑 /harvest
- 无 → 引导手动创建基础配置

---

## Hooks

只有一个 hook：pre-completion（Stop 事件）。只做提醒（inject），不做拦截。每种提醒每次会话只触发一次。

Hook 脚本采用 CJS（CommonJS）格式，通过 hooks.json 注册，参考 sps-harness 的 hook 格式：
- 使用 `node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/<name>.js"` 执行
- 共享工具库 `hooks/scripts/lib/utils.js`（提供 `inject()`、`readStdin()`、`fileExists()` 等）
- 输出 JSON 格式 `{ hookSpecificOutput: { hookEventName, additionalContext } }`
- 所有 hook 以 `process.exit(0)` 结束，错误静默处理

### pre-completion（Stop）

会话结束前，通过 `git status --porcelain` 获取变更文件列表，检测遗漏步骤：

| 检测条件 | 提醒 |
|---|---|
| 变更文件含 docs/brainstorms/ 或 docs/plans/ + 有代码文件变更 | 建议跑 /product-spec sync |
| 代码文件变更 ≥ 3 个 | 建议跑 /product-spec check |
| 代码文件变更 ≥ 3 个 + 涉及 UI 文件（.html/.css/.tsx/.jsx/.vue 或 components/pages/ 目录） | 建议跑 gstack /qa |
| 变更文件路径匹配 auth/payment/token/secret/credential/session/jwt/oauth | 建议跑 gstack /cso |

---

## 技术决策

### 全新重写，不复制 sps-harness 代码

sps-harness 的 hook 脚本是为 superpowers 上下文写的，且存在触发不可靠的问题。参考旧 hook 的格式（CJS、hooks.json 结构、utils.js 工具函数模式）确保兼容 Claude Code 插件系统，但逻辑从零写。

### Hook 格式参考

参考 sps-harness 的 hook 实现格式，确保触发可靠：
- hooks.json 结构：`{ hooks: { EventName: [{ matcher?, hooks: [{ type, command, timeout }] }] } }`
- 脚本通过 `${CLAUDE_PLUGIN_ROOT}` 定位
- utils.js 提供统一的输入读取（readStdin 从 stdin 读 JSON）和输出（inject 输出 hookSpecificOutput JSON）
- timeout 设置：文件检测 ≤ 5s

### Hook 只提醒不拦截

CE+gstack 已经覆盖代码质量和安全审查。harness hook 的角色是补充导航提醒，不重复 CE/gstack 的执行职责。

### 每种提醒每会话一次

避免 hook 反复触发同一条提醒。使用 temp 文件（`${TMP}/ce-gs-harness-${cwd-hash}.json`）追踪已提醒的项目，30 分钟无活动后自动重置。

### product-spec 三合一

product-drafter + product-launcher /check + product-launcher /sync 合并为一个 skill，三个模式（draft / check / sync）。围绕同一个文件（Product-Spec.md），通过 Skill tool 的 args 参数分发模式。SKILL.md 可拆分子文件（modes/draft.md、modes/check.md、modes/sync.md）控制篇幅。

### TDD 通过 CE 机制实现

不独立维护 TDD 规则，而是让 CE /ce:plan 的 implementation unit 默认包含 `Execution note: test-first`。CE /ce:work 看到标记后自动走 TDD 流程。利用 CE 已有的基础设施，比写一条独立规则更可靠。

---

## 丢弃清单（及理由）

| 组件 | 来源 | 丢弃理由 |
|---|---|---|
| product-launcher /launch | sps-harness | CE /ce:brainstorm 覆盖 |
| security-reviewer agent | sps-harness | CE /ce:review security persona + gstack /cso |
| compliance-reviewer agent | sps-harness | CE /ce:review project-standards-reviewer |
| verification-agent | sps-harness | CE /ce:review adversarial-reviewer |
| observe hook | sps-harness | CE /ce:compound 替代 |
| /learn 命令 | sps-harness | CE /ce:compound 替代 |
| 代码质量 hooks | sps-harness (from ECC) | 信任 CE，且旧版触发不可靠 |
| git 安全 hooks | sps-harness (from ECC) | 信任 CE + settings.json deny |
| strategic-compact | sps-harness (from ECC) | 旧版自动化未生效，用 gstack /checkpoint 替代 |
| coding-standards rule | sps-harness (from ECC) | Claude 训练已覆盖 |
| testing-standards rule | sps-harness (from ECC) | TDD 通过 CE Execution note 机制实现 |
| security-standards rule | sps-harness (from ECC) | CE /ce:review + gstack /cso 覆盖 |
| git-standards rule | sps-harness (from ECC) | CE git-commit skill 覆盖 |
| debug-standards rule | 新设计后丢弃 | Claude 自身调试能力已覆盖 |
| tdd-standards rule | 新设计后丢弃 | 改为 tdd-plan-default，通过 CE Execution note 实现 |
| workflow-map rule (旧) | sps-harness | 重写为 CE+gstack 版本 |
| harness-method rule | sps-harness | 移到 harness 项目 CLAUDE.md |
| project-structure rule | sps-harness | 绑定旧 Product-Spec.md 工作流 |
| 4 产品提醒 hooks | sps-harness | 绑定被丢弃的 product-launcher |
| session-start hook | 新设计后丢弃 | workflow-map rule 已覆盖项目状态检测 |
| post-edit hook | 新设计后丢弃 | 时机不对（编辑中提醒不如会话结束前提醒） |
| prompt-audit | sps-harness | 保持独立，不打包进 harness |

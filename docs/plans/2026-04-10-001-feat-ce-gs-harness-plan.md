---
title: "feat: Build ce-gs-harness plugin"
type: feat
status: active
date: 2026-04-10
origin: docs/specs/2026-04-10-ce-gs-harness-design.md
---

# feat: Build ce-gs-harness plugin

## Overview

从零构建 ce-gs-harness，一个 Claude Code 插件，作为 CE+gstack 的基础设施层。包含 3 条 rules、3 个 skills、1 个 hook，覆盖项目上下文维护、阶段导航、TDD 纪律和会话结束提醒。

## Problem Frame

用户从 superpowers 切换到 CE+gstack，需要一个配套的工作流基础设施。CE 管开发全链，gstack 管外部操作，但三件事它们都不做：项目上下文维护（.claude/CLAUDE.md + Product-Spec.md）、跨插件阶段导航、.claude/ 健康度评估。ce-gs-harness 填补这些空缺。

（see origin: docs/specs/2026-04-10-ce-gs-harness-design.md）

## Requirements Trace

- R1. 提供 workflow-map rule，覆盖 CE 链和 Superpowers 链两条路径的全阶段导航
- R2. 提供 tdd-plan-default rule，让 CE /ce:plan 默认标记 test-first
- R3. 提供 noise-filter rule，控制输出质量
- R4. 提供 harvest skill，从设计文档 + 项目文件生成 .claude/CLAUDE.md
- R5. 提供 product-spec skill（draft/check/sync 三模式），维护 Product-Spec.md
- R6. 提供 harness-audit skill，评估 .claude/ 健康度
- R7. 提供 pre-completion hook，会话结束前基于 git status 提醒遗漏步骤
- R8. 插件可通过 claude plugins install 安装，全局生效
- R9. 更新全局 CLAUDE.md（删除编码纪律、更新禁用列表）
- R10. 禁用 Superpowers SessionStart hook

## Scope Boundaries

- 不复制 sps-harness 代码，全部重写
- 不包含 prompt-audit（保持独立）
- 不包含代码质量 hooks、git 安全 hooks、agents
- 不包含 strategic-compact
- hook 只做提醒（inject），不做拦截（deny/prevent/stop）

## Context & Research

### Relevant Code and Patterns

- sps-harness 插件结构：`.claude-plugin/plugin.json` + `rules/` + `skills/*/SKILL.md` + `hooks/hooks.json` + `hooks/scripts/`
- sps-harness hooks.json 格式：`{ hooks: { EventName: [{ matcher?, hooks: [{ type, command, timeout }] }] } }`
- sps-harness utils.js：提供 `inject()`、`readStdin()`、`fileExists()`、`log()` 等工具函数
- sps-harness rules 格式：纯 markdown，无 frontmatter
- sps-harness skills 格式：每个 skill 一个目录，内含 SKILL.md
- CE Execution note 机制：plan 的 implementation unit 中写 `Execution note: test-first`，ce:work 看到后走 TDD 流程

### Institutional Learnings

- sps-harness 的 hooks 存在触发不可靠问题（原因未定位），新 hook 需要尽量简单
- `git status --porcelain` 输出可靠，适合做文件变更检测
- CJS（CommonJS）是 Claude Code 插件 hook 的标准格式

## Key Technical Decisions

- **全部重写而非 fork**：sps-harness 代码绑定 superpowers 上下文，且 hooks 触发不可靠。（see origin）
- **product-spec 三合一**：draft/check/sync 通过 Skill tool 的 args 参数分发，一个 skill 三个模式。SKILL.md 拆分子文件控制篇幅。
- **hook 基于 git status 检测**：不解析 tool activity（不可靠），改用 `git status --porcelain`（可靠）。
- **TDD 通过 CE 机制实现**：tdd-plan-default rule 让 CE plan 默认加 Execution note，不独立维护 TDD 规则。
- **workflow-map 标注 hook 提醒**：workflow-map 和 hook 双重保险，rule 标注哪些步骤 hook 会兜底提醒。

## Open Questions

### Resolved During Planning

- **plugin 版本号**：从 0.1.0 开始。
- **hook 输出前缀**：`[ce-gs-harness]`，与 sps-harness 的 `[sps-harness]` 区分。
- **product-spec 子文件结构**：SKILL.md 作为入口做模式分发，modes/ 目录下 draft.md、check.md、sync.md 各负责一个模式。

### Deferred to Implementation

- **harvest 输出的具体 CLAUDE.md 模板**：100 行限制内的具体段落措辞，实现时调试。
- **harness-audit 评分维度细节**：具体检查项和权重，实现时基于实际 .claude/ 结构调整。
- **product-spec check 的关键词匹配策略**：如何从功能名称生成搜索关键词，实现时调试精度。

## Output Structure

```
ce-gs-harness/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── .gitignore
├── CLAUDE.md
├── README.md
├── docs/
│   ├── specs/
│   │   └── 2026-04-10-ce-gs-harness-design.md  (已存在)
│   └── plans/
│       └── 2026-04-10-001-feat-ce-gs-harness-plan.md  (本文件)
├── hooks/
│   ├── hooks.json
│   └── scripts/
│       ├── lib/
│       │   └── utils.js
│       └── pre-completion.js
├── rules/
│   ├── workflow-map.md
│   ├── tdd-plan-default.md
│   └── noise-filter.md
└── skills/
    ├── harvest/
    │   └── SKILL.md
    ├── product-spec/
    │   ├── SKILL.md
    │   └── modes/
    │       ├── draft.md
    │       ├── check.md
    │       └── sync.md
    └── harness-audit/
        └── SKILL.md
```

## Implementation Units

- [x] **Unit 1: Plugin scaffold and metadata**

**Goal:** 创建插件的基础结构，让 Claude Code 能识别和加载它。

**Requirements:** R8

**Dependencies:** None

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.gitignore`
- Create: `CLAUDE.md`（harness 项目自身的开发说明）
- Create: `README.md`

**Approach:**
- plugin.json：name `ce-gs-harness`，version `0.1.0`，author SEPTEM
- marketplace.json：source `./`，与 plugin.json 版本同步
- .gitignore：排除 node_modules/、.compact/、temp 文件
- CLAUDE.md：简述项目结构、开发约定（CJS hooks、markdown rules/skills）
- README.md：安装方式、组件清单、快速开始

**Patterns to follow:**
- sps-harness `.claude-plugin/plugin.json` 格式
- sps-harness `.claude-plugin/marketplace.json` 格式

**Test expectation:** none — 元数据和文档文件，无可执行代码

**Verification:**
- plugin.json 和 marketplace.json 的 JSON 格式合法
- claude plugins install 能识别插件（安装后验证）

---

- [x] **Unit 2: Rules**

**Goal:** 创建 3 条 rule 文件，提供阶段导航、TDD 纪律和输出质量控制。

**Requirements:** R1, R2, R3

**Dependencies:** Unit 1

**Files:**
- Create: `rules/workflow-map.md`
- Create: `rules/tdd-plan-default.md`
- Create: `rules/noise-filter.md`

**Approach:**
- workflow-map.md：开头写"起点决定链路"原则，CE 链完整列出（6 个阶段 + hook 提醒标注），Superpowers 链精简为 3-4 行流程（brainstorming → writing-plans → plan-ceo-review 可选 → executing-plans），标注"阶段 1 和 gstack 工具同 CE 链"。总长度控制在 50 行以内。
- tdd-plan-default.md：简短规则，告诉 Claude 在 CE /ce:plan 中为每个 implementation unit 默认加 `Execution note: test-first`。需要解释为什么（CE /ce:work 读到标记后自动走 TDD），以及什么情况下可以不加（纯文档、纯配置的 unit）。
- noise-filter.md：从 sps-harness 的 noise-filter.md 重写，内容基本一致（>80% 置信度、合并重复、只报客观问题）。

**Patterns to follow:**
- sps-harness `rules/noise-filter.md` 格式（纯 markdown，含理由说明）

**Test expectation:** none — markdown 规则文件

**Verification:**
- 安装插件后，Claude 对话中能引用 workflow-map 的阶段建议
- Claude 在跑 /ce:plan 时默认添加 Execution note: test-first

---

- [x] **Unit 3: Hook infrastructure**

**Goal:** 创建 hook 运行所需的基础设施：hooks.json 注册文件和共享工具库。

**Requirements:** R7

**Dependencies:** Unit 1

**Files:**
- Create: `hooks/hooks.json`
- Create: `hooks/scripts/lib/utils.js`

**Approach:**
- hooks.json：注册一个 Stop 事件 hook，指向 `pre-completion.js`，timeout 10s（需要跑 git status）
- utils.js：提供精简工具函数集：
  - `readStdin()`：从 stdin 读 JSON（Stop hook 的输入）
  - `inject(context)`：输出 hookSpecificOutput JSON，注入提醒文本
  - `log(msg)`：写 stderr 日志
  - `fileExists(path)`：检查文件存在
  - `runGit(args, cwd)`：执行 git 命令，返回 stdout，超时安全
- 不从 sps-harness 复制代码，但参考其 JSON 输出格式确保兼容

**Execution note:** test-first — 先写 utils.js 的测试（runGit、inject 的输出格式），再实现

**Patterns to follow:**
- sps-harness `hooks/hooks.json` 结构
- sps-harness `hooks/scripts/lib/utils.js` 的 inject() 输出格式

**Test scenarios:**
- Happy path: `inject("message")` 输出合法的 hookSpecificOutput JSON，包含 hookEventName 和 additionalContext
- Happy path: `runGit(["status", "--porcelain"], cwd)` 返回文件变更列表
- Error path: `runGit` 超时时返回空字符串而非抛异常
- Edge case: `readStdin()` 在无 stdin 数据时返回空对象

**Files (test):**
- Create: `hooks/scripts/lib/utils.test.js`

**Verification:**
- utils.test.js 全部通过
- inject() 输出的 JSON 能被 Claude Code 插件系统正确解析

---

- [x] **Unit 4: Pre-completion hook**

**Goal:** 创建会话结束前的提醒 hook，基于 git status 检测遗漏步骤。

**Requirements:** R7

**Dependencies:** Unit 3

**Files:**
- Create: `hooks/scripts/pre-completion.js`
- Create: `hooks/scripts/pre-completion.test.js`

**Execution note:** test-first — 先写检测逻辑的测试，再实现

**Approach:**
- 通过 `runGit(["status", "--porcelain"])` 获取变更文件列表
- 分析文件路径，按条件触发提醒：
  1. 变更含 docs/brainstorms/ 或 docs/plans/ + 代码文件 → sync 提醒
  2. 代码文件 ≥ 3 → check 提醒
  3. 代码文件 ≥ 3 + UI 文件（.html/.css/.tsx/.jsx/.vue 或 components/pages/）→ qa 提醒
  4. 路径匹配 auth/payment/token/secret/credential/session/jwt/oauth → cso 提醒
- 每种提醒用 temp 文件追踪（`${TMP}/ce-gs-harness-${cwd-hash}.json`），每次会话只触发一次
- 所有提醒通过 `inject()` 输出，前缀 `[ce-gs-harness]`
- 错误静默处理，`process.exit(0)` 结束

**Patterns to follow:**
- sps-harness `hooks/scripts/completion-guard.js` 的 Stop hook 结构
- 使用 `SECURITY_PATTERNS` 正则匹配安全相关文件

**Test scenarios:**
- Happy path: 变更含 docs/brainstorms/xxx.md + src/app.js → 输出 sync 提醒
- Happy path: 变更含 4 个 .ts 文件 → 输出 check 提醒
- Happy path: 变更含 3 个 .ts + components/Button.tsx → 输出 qa 提醒
- Happy path: 变更含 src/auth/login.ts → 输出 cso 提醒
- Edge case: 变更含 2 个代码文件 → 不输出 check 提醒
- Edge case: 同时满足多个条件 → 全部输出（不是只输出第一个）
- Edge case: 重复触发 → 使用 temp 文件追踪，第二次不输出
- Edge case: 非 git 项目（无 .git 目录）→ 静默退出，不输出
- Error path: git status 失败 → 静默退出，不输出

**Verification:**
- pre-completion.test.js 全部通过
- 安装插件后，编辑 3+ 代码文件再结束会话，收到 check 提醒

---

- [x] **Unit 5: harvest skill**

**Goal:** 创建 harvest skill，从设计文档和项目文件生成/更新 .claude/CLAUDE.md。

**Requirements:** R4

**Dependencies:** Unit 1

**Files:**
- Create: `skills/harvest/SKILL.md`

**Approach:**
- SKILL.md 定义两种模式（Mode A 有设计文档 / Mode B 无设计文档）
- Mode A 读取路径：`docs/brainstorms/`、`docs/plans/`、`docs/ideation/` + 项目配置文件
- Mode B 回退：仅从 package.json、tsconfig.json、pyproject.toml、go.mod 等推断
- 输出格式：固定 4 段（技术栈、命令、架构、约定），限 100 行
- 更新策略：show diff → accept all / select / cancel，保留用户自定义段落
- 末尾注释：`<!-- Generated by /harvest (mode A|B), YYYY-MM-DD -->`

**Patterns to follow:**
- sps-harness `skills/harvest/SKILL.md` 的模式切换逻辑和输出格式（适配 CE 路径）

**Test expectation:** none — SKILL.md 是 prompt 指令文件，通过实际调用验证

**Verification:**
- 在有 docs/brainstorms/ 的项目中跑 /harvest，生成 ≤100 行的 CLAUDE.md
- 在空项目中跑 /harvest，回退到 Mode B 从配置文件推断
- 已有 CLAUDE.md 时，show diff 并保留用户自定义段落

---

- [x] **Unit 6: product-spec skill**

**Goal:** 创建 product-spec skill，含 draft/check/sync 三个模式，维护 Product-Spec.md。

**Requirements:** R5

**Dependencies:** Unit 1

**Files:**
- Create: `skills/product-spec/SKILL.md`
- Create: `skills/product-spec/modes/draft.md`
- Create: `skills/product-spec/modes/check.md`
- Create: `skills/product-spec/modes/sync.md`

**Approach:**
- SKILL.md 作为入口：解析 args 参数（无参数或 "draft" → draft 模式，"check" → check 模式，"sync" → sync 模式），然后读取对应 modes/*.md 执行
- draft.md：对话收集需求的 8 步流程，一次一个问题纪律，`[假设：...]` 标记
- check.md：提取 `- [ ]`/`- [x]`/`- [~]` 条目 → 代码扫描 → 分组报告 → 回写
- sync.md：读 docs/brainstorms/ + docs/plans/ → 对比 Product-Spec.md → 更新 → 追加 Changelog
- sync 描述说明：同步设计文档内容（通过使用时机确保只同步已落地功能）
- sync 建议顺序：先 sync 再 check

**Patterns to follow:**
- sps-harness `skills/product-drafter/SKILL.md` 的对话流程和一次一个问题纪律
- sps-harness `skills/product-launcher/SKILL.md` 的 /check 和 /sync 模式逻辑

**Test expectation:** none — SKILL.md 和 modes/*.md 是 prompt 指令文件

**Verification:**
- `/product-spec` 或 `/product-spec draft`：进入对话模式，一次一个问题
- `/product-spec check`：读取 Product-Spec.md 功能清单，输出完成度报告
- `/product-spec sync`：检测 docs/ 变更，更新 Product-Spec.md，追加 Changelog

---

- [x] **Unit 7: harness-audit skill**

**Goal:** 创建 harness-audit skill，评估 .claude/ 配置健康度。

**Requirements:** R6

**Dependencies:** Unit 1

**Files:**
- Create: `skills/harness-audit/SKILL.md`

**Approach:**
- 两种模式：审计（有 .claude/ 时评估健康度）和初始化（无 .claude/ 时引导创建）
- 审计检查项：CLAUDE.md 存在且非空、Product-Spec.md 存在、rules/ 目录有内容、settings.json 存在、内容是否过时或矛盾
- 输出：评分 + 具体改进建议（附文件路径）
- 初始化模式：检测有无设计文档 → 有则建议 /harvest → 无则引导手动创建

**Patterns to follow:**
- sps-harness `skills/harness-audit/SKILL.md` 的审计维度概念（简化，去掉复杂的 7 维度评分）

**Test expectation:** none — SKILL.md 是 prompt 指令文件

**Verification:**
- 在完整配置的项目中跑 /harness-audit，输出健康度评分和建议
- 在空项目中跑 /harness-audit，进入初始化模式并建议 /harvest

---

- [x] **Unit 8: Global configuration**

**Goal:** 更新全局 CLAUDE.md 和禁用 Superpowers SessionStart hook。

**Requirements:** R9, R10

**Dependencies:** Units 1-7 完成后执行

**Files:**
- Modify: `~/.claude/CLAUDE.md`（全局）

**Approach:**
- 删除「编码纪律」段落（TDD + 调试流程）
- 改写路由表：去掉现有无条件路由表和默认路由表，替换为 2 行路由原则（代码项目 → /ce:brainstorm 起步，非代码项目 → /superpowers:brainstorming 起步）+ gstack 和 harness 角色各一行。完整阶段导航由 workflow-map rule 提供，CLAUDE.md 不重复
- 更新禁用列表：
  - 保留 4 条现有禁用（/office-hours、/autoplan、/review、/investigate）
  - /investigate 条目从"走调试纪律（见下方）"改为"禁用"
  - 新增 6 条禁用（/learn、/design-consultation、/design-shotgun、/health、/retro、/careful）
- 禁用 Superpowers SessionStart hook：在 Superpowers 插件的 hooks.json 中移除或注释 SessionStart 条目

**Test expectation:** none — 配置变更

**Verification:**
- 新会话中不再出现 Superpowers 的 118 行导航注入
- Claude 不再引用已删除的编码纪律段落
- 禁用列表中的 gstack 功能不再被自动建议

## System-Wide Impact

- **Interaction graph:** harness 的 rules 每次会话自动加载到 Claude 上下文。hook 在 Stop 事件触发。skills 用户手动调用。与 CE、gstack 无直接代码交互，仅通过 workflow-map 的文字引用关联。
- **Error propagation:** hook 错误静默处理（process.exit(0)），不影响会话。
- **State lifecycle risks:** pre-completion hook 使用 temp 文件追踪已提醒项目，30 分钟无活动自动重置。temp 文件损坏时静默忽略。
- **API surface parity:** N/A — 纯插件，无 API
- **Unchanged invariants:** CE 和 gstack 的所有现有功能不受影响。Superpowers 的 skills 仍可手动调用，只禁用 SessionStart hook。

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| hook 仍然不触发 | 参考 sps-harness hooks.json 格式，hook 逻辑尽量简单（只跑 git status + 正则匹配）。安装后手动验证触发。 |
| tdd-plan-default rule 被 Claude 忽略 | rule 中包含"为什么"的解释（CE /ce:work 读 Execution note 自动走 TDD），提高 Claude 遵守概率。安装后验证 CE plan 是否自动加标记。 |
| product-spec skill args 解析不工作 | SKILL.md 开头明确写 args 分发逻辑。如果 args 机制不可靠，退化为在 SKILL.md 中直接询问用户模式。 |
| 禁用 Superpowers hook 后影响非编程使用 | Superpowers skills 仍可手动调用，只是不自动注入导航。非编程项目手动调用 /superpowers:brainstorming 不受影响。 |

## Sources & References

- **Origin document:** [docs/specs/2026-04-10-ce-gs-harness-design.md](docs/specs/2026-04-10-ce-gs-harness-design.md)
- Related code: sps-harness `hooks/hooks.json`、`hooks/scripts/lib/utils.js`、`rules/noise-filter.md`
- Related code: sps-harness `skills/harvest/SKILL.md`、`skills/product-drafter/SKILL.md`、`skills/product-launcher/SKILL.md`、`skills/harness-audit/SKILL.md`

---
date: 2026-04-13
topic: design-spec-awareness
---

# harness-audit / harvest 感知设计规范文件

## Problem Frame

ce-gs-harness 负责项目上下文管理，但目前对设计规范文件没有感知。

前端项目可能存在两种设计规范文件：
- **DESIGN.md**（Google Stitch 标准）：放在项目根目录，9 个标准章节
- **MASTER.md**（/ui-ux-pro-max 输出）：放在 `design-system/[项目名]/MASTER.md`，含页面级覆盖

两者功能相同（给 AI 读的视觉设计规范），只是来源和格式不同。缺少设计规范文件的前端项目，AI 生成的 UI 配色随机、风格不一致。

harness-audit 检查不到这些文件的存在，harvest 生成 CLAUDE.md 时也不会引用它们，导致后续开发 session 里 AI 可能忽略已有的设计规范。

## Requirements

**harness-audit — Layer 1 新增检查项**

- R1. 新增设计规范文件检查，权重 Optional（×0.5），**有条件触发**：仅当项目检测到前端依赖时检查（package.json 含 react/vue/svelte/next/nuxt/angular，或存在 tailwind.config/postcss.config 等前端配置文件）。搜索路径按优先级：`DESIGN.md`（项目根目录）→ `design-system/*/MASTER.md`（/ui-ux-pro-max 输出）。找到任一即为 Pass。不是前端项目则跳过，不影响评分
- R2. 缺失时的修复建议："建议通过 /ui-ux-pro-max 生成设计规范"

**harvest — 生成 CLAUDE.md 时引用**

- R3. harvest 扫描阶段检测设计规范文件是否存在（搜索路径与 R1 一致）。如果存在，在 约定 section 添加一行约束，注明实际文件路径。例如：`All UI must follow design-system/my-project/MASTER.md. Do not invent new colors/typography outside the spec.`。此引用行在 one-line test 过滤之后注入（与 footer 注释同级），不受过滤影响。理由：Claude 可以发现文件存在，但不会自动将其视为强制约束

## Success Criteria

- 有前端依赖但没有设计规范文件的项目，harness-audit 会提示缺失并建议 /ui-ux-pro-max（所有检查项无论权重都会在结果中显示，Optional 权重只影响评分高低）
- 没有前端依赖的项目，检查被跳过，不扣分
- harvest 生成的 CLAUDE.md 会自动引用已有的设计规范文件，无需用户手动添加

## Scope Boundaries

- 不生成设计规范文件本身的内容（那是 /ui-ux-pro-max 的责任）。harvest 在 CLAUDE.md 中添加引用行属于 CLAUDE.md 内容生成，不受此限制
- 不验证设计规范文件的内容质量（未来扩展，不在本次范围内）
- 不改 harness-audit 的评分公式逻辑，只新增一个 Optional 检查项
- 不改 workflow-map 或其他 rules
- 不涉及 AGENTS.md（Claude Code 不会自动加载 AGENTS.md，架构信息继续放在 CLAUDE.md 的架构 section 中）

## Key Decisions

- 设计规范检查设为有条件（仅前端项目）：非前端项目不需要视觉规范，无条件检查会产生无意义的缺失提示
- 同时检测 DESIGN.md 和 MASTER.md：两者功能相同，来源不同（Google Stitch vs /ui-ux-pro-max），harness-audit 不区分格式，只检测存在性
- harvest 使用硬约束措辞（"must follow"）：设计规范的价值在于严格执行，软性引用会被 AI 忽略
- 不加 AGENTS.md：Claude Code 不自动加载该文件，架构信息放 CLAUDE.md 更实际

## Next Steps

-> /ce:plan for structured implementation planning

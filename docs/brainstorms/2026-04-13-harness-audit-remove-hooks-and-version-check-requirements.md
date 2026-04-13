---
date: 2026-04-13
topic: harness-audit-remove-hooks-and-version-check
---

# harness-audit 删除 hooks 检查 + 版本标记对比

## Problem Frame

1. harness-audit 仍在检查 hooks（High ×2 权重），但 ce-gs-harness 自身已删除 hooks（VS Code 下不触发，workflow-map 已覆盖提醒场景）。用没有 hooks 的项目会被不合理扣分。
2. harness-audit 的 rules 版本检查嵌在 Layer 1 rules 检查的子项里，Claude 容易跳过。且内容逐字比对在用户修改过文件后会误报。

## Requirements

**删除 hooks 检查**

- R1. 从 Layer 1 存在性检查中删除 hooks 检查项（包括 High ×2 权重）
- R2. 从 Layer 2 质量检查中删除 hooks/ quality 检查
- R3. 从评分降级条件、修复建议、Gotchas 等位置删除 hooks 相关引用
- R4. 调整总分计算：去掉 hooks 权重后，maximum possible 分值变小

**版本标记对比**

- R5. 每个 harness rule 文件末尾加版本注释 `<!-- ce-gs-harness vX.Y.Z -->`，版本号来自 plugin.json
- R6. harness-audit 安装 rules 时（init mode step 3），自动在复制的文件末尾加版本注释
- R7. harness-audit 审计时（audit mode Layer 1 rules 检查），读取每个已安装 rule 文件末尾的版本注释，与当前插件版本比较。版本落后则提示更新
- R8. 版本比对独立为一个明确的检查步骤，不嵌套在 rules 存在性检查里

## Success Criteria

- 没有 hooks 的项目不再被扣分
- 项目里的 harness rules 版本落后时，harness-audit 能检测到并提示

## Scope Boundaries

- 不改 hooks 在 Claude Code 平台本身的功能（那是平台层，跟 harness 无关）
- 不改其他 skill 的内容
- 版本注释只加在 harness 自己的 rule 文件里，不影响用户自己的 rule 文件

## Next Steps

-> /ce:plan for structured implementation planning

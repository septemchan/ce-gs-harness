# ce-gs-harness

CE + gstack 的基础设施插件。

## 结构

- `rules/` — markdown 规则文件，无 frontmatter
- `skills/*/SKILL.md` — skill 入口文件，含 YAML frontmatter
- `hooks/hooks.json` — hook 注册
- `hooks/scripts/` — CJS hook 脚本
- `hooks/scripts/lib/utils.js` — 共享工具函数

## 开发约定

- Hook 脚本使用 CJS（CommonJS）格式
- Hook 输出 JSON 到 stdout（`hookSpecificOutput` 格式）
- Hook 日志写 stderr，前缀 `[ce-gs-harness]`
- Hook 错误静默处理，`process.exit(0)` 结束
- 测试使用 Node.js 内置 test runner（`node --test`）

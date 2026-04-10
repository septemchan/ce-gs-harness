# ce-gs-harness

CE + gstack 的基础设施插件。

## 开发约定

- Hook 脚本使用 CJS（CommonJS）格式
- Hook 输出 JSON 到 stdout（`hookSpecificOutput` 格式）
- Hook 日志写 stderr，前缀 `[ce-gs-harness]`
- Hook 错误静默处理，`process.exit(0)` 结束
- 测试使用 Node.js 内置 test runner（`node --test`）

## 发布

- 升版本时同步改 plugin.json 和 marketplace.json 两个文件的 version 字段
- GitHub 默认分支必须是 master（marketplace add 克隆默认分支，指错了会装到旧版本）
- 发布后用 `claude plugins marketplace update ce-gs-harness` 更新缓存，缓存不生效时需要用户手动删 `~/.claude/plugins/cache/ce-gs-harness` 再重装

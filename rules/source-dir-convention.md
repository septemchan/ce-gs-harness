# Source Directory Convention

多端/多模块项目（前端、后端、小程序端等）的所有子项目必须收在同一个根目录下属文件夹内，不允许各自散在根目录。

## Why

子项目散在根目录会导致项目结构混乱，根目录充斥大量文件夹，难以区分项目代码和配置/文档目录。

## How to apply

1. 在 brainstorm/plan 阶段根据项目性质确定父目录名称（常见选择：`apps/`、`packages/`、`services/`）
2. 确定后写进项目 CLAUDE.md 的架构 section
3. 所有子项目代码放在该父目录下，如 `apps/frontend/`、`apps/backend/`、`apps/miniprogram/`

## When to skip

- 单端项目（只有一套代码，不存在多端分组的需求）
- 框架已约定目录结构的项目（如 Next.js monorepo 用 Turborepo 自带约定）

<!-- ce-gs-harness v0.8.0 -->

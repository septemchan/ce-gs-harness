---
name: product-spec-sync
description: >
  Use when: syncing design document content to Product-Spec.md after implementation is complete.
  Trigger on: "product-spec-sync", "/product-spec-sync", "同步产品文档", "产品同步",
  "把设计文档同步到产品文档".
  Do not trigger for: drafting requirements (product-spec-draft's job),
  checking completeness (product-spec-check's job).
---

# Sync — Design Doc to Product-Spec Synchronization

## When to Use

Run sync after features have been implemented (fully or partially), not right after brainstorm or plan creation. Unexecuted plans represent intent, not reality — syncing them would pollute the spec with features that don't exist yet. Partial implementation is fine: sync adds items as `[ ]`, and the downstream `/product-spec-check` determines actual completion status.

**Recommended order:** sync first, then check. Sync adds new features discovered in design docs as `[ ]` items. Check then scans code to update those items to `[x]`, `[~]`, or `[ ]`.

## Flow

### Step 1: Read Current Product-Spec

Read `Product-Spec.md` from the project root. If it doesn't exist, inform the user and suggest running `/product-spec-draft` first. Do not proceed without a base spec — sync needs something to sync into.

### Step 2: Locate Design Documents

Look for design documents in this order:

1. **Known paths first:** `docs/brainstorms/`, `docs/plans/` — default output locations for CE brainstorm and plan skills.
2. **Fallback — git history:** If those directories don't exist, use `git log --diff-filter=AM --name-only` to find recently added or modified `.md` files that look like design docs (brainstorms, plans, requirements, RFCs).
3. **Last resort — ask the user:** If neither approach finds relevant files, ask where their design documents live.

Determine the sync baseline: read the `## Sync History` section at the bottom of Product-Spec.md. If a previous sync entry exists, use its date as the cutoff — only process design documents modified after that date. If no Sync History exists (first run), treat all located design documents as in scope.

From the in-scope files, read each one and extract:

- New features or capabilities not in Product-Spec.md
- Modified requirements or scope changes
- Removed or deferred items

### Step 3: Compare, Review, and Update

#### Identify Differences

For each difference found:

- **New feature:** Add to Product-Spec.md as `- [ ]` following the same format as `/product-spec-draft` output. If the design doc mentions specific component names, routes, or API endpoints, include them as code identifiers — e.g., `- [ ] 用户注册 (`/api/auth/register`, `RegisterForm`) (source: plans/auth-system.md)`. These identifiers are what `/product-spec-check` uses to locate corresponding code; without them, check falls back to keyword guessing with lower accuracy.
- **Modified requirement:** Update the existing entry, preserving the current `[ ]`/`[x]`/`[~]` status. Add `[变更：...]` marker describing what changed.
- **Removed/deferred item:** Do not delete. Mark with `[延期：...]` and the reason.

**Annotation markers and downstream compatibility:** `[变更：...]`、`[延期：...]`、`[存疑：...]` are inline annotations that do not affect the checkbox status (`[ ]`/`[x]`/`[~]`). `/product-spec-check` reads the checkbox to judge implementation status and treats these markers as human-readable notes.

#### Detect Contradictions

After extracting all differences, cross-check the design documents against each other. Look for:

- Conflicting technology choices (e.g., one doc says ECharts, another says Recharts)
- Inconsistent version numbers or API schemas
- Different architectural approaches to the same problem

Flag each inconsistency as `[存疑：...]` with both sources cited. These contradictions need the user's decision before syncing — don't silently pick a winner.

#### Present Changes for Confirmation

Present all proposed changes using this structure before writing:

<example title="sync-preview">
### 新增
- [ ] Feature X (`ComponentName`, `/api/endpoint`) (source: plans/xxx.md)
- [ ] Feature Y (source: brainstorms/yyy.md)

### 变更
- Feature Z: [变更：scope 扩大到包含多语言支持]

### 延期
- Feature W: [延期：moved to v2 per plan discussion]

### 存疑（需确认）
- [存疑：plans/auth.md 使用 JWT，plans/api.md 使用 session — 需要统一]
</example>

Wait for user confirmation (and resolution of any `[存疑]` items) before proceeding to Step 4.

### Step 4: Record Changes

Append a sync summary to the bottom of `Product-Spec.md` under a `## Sync History` section. Keeping the change record co-located with the spec itself means it actually gets read, unlike a separate changelog file that nobody opens.

Format:

<example title="sync-history">
## Sync History

### YYYY-MM-DD — Sync from design docs
- Added: Feature X (source: plans/feature-x.md)
- Changed: Feature Y — updated scope to include Z
- Deferred: Feature W — moved to v2 per plan discussion
</example>

After writing, re-read Product-Spec.md and verify: new items appear in the correct section, existing items' checkbox status is preserved, and the Sync History entry is appended (not overwriting previous entries).

## Gotchas

- Brainstorm 文档常包含被否决的想法（讨论了但没采纳）。仅提取明确标记为"结论"或"决定"的内容，讨论过程中的备选方案不算新功能。
- 多份设计文档可能用不同措辞描述同一功能（如"用户认证"vs"登录系统"），提取前先对比 Product-Spec 现有条目，避免语义重复。
- 设计文档中的技术细节（如数据库 schema、API 字段定义）不属于产品规格层面，不要同步到 Product-Spec。

# Sync Mode — Design Doc to Product-Spec Synchronization

## When to Use

Run sync **after implementation is complete**, not after brainstorm or plan creation. Unexecuted plans represent intent, not reality — syncing them would pollute the spec with features that don't exist yet.

**Recommended order:** sync first, then check. Sync adds new features discovered in design docs as `[ ]` items. Check then scans code to update those items to `[x]`, `[~]`, or `[ ]`.

## Flow

### Step 1: Read Current Product-Spec

Read `Product-Spec.md` from the project root. If it doesn't exist, inform the user and suggest running `/product-spec draft` first. Do not proceed without a base spec — sync needs something to sync into.

### Step 2: Locate Design Documents

Look for design documents in this order:

1. **Known paths first:** `docs/brainstorms/`, `docs/plans/` — default output locations for CE brainstorm and plan skills.
2. **Fallback — git history:** If those directories don't exist, use `git log --diff-filter=AM --name-only` to find recently added or modified `.md` files that look like design docs (brainstorms, plans, requirements, RFCs).
3. **Last resort — ask the user:** If neither approach finds relevant files, ask where their design documents live.

From the located files, identify those modified since the last sync (use git log or file timestamps). Read each relevant file and extract:

- New features or capabilities not in Product-Spec.md
- Modified requirements or scope changes
- Removed or deferred items

### Step 3: Compare and Update

For each difference found:

- **New feature:** Add to Product-Spec.md as `- [ ]` with source attribution (e.g., `(source: plans/auth-system.md)`). Include code identifiers if the design doc mentions specific component names, routes, or endpoints.
- **Modified requirement:** Update the existing entry, preserving the current `[ ]`/`[x]`/`[~]` status. Add `[变更：...]` marker describing what changed.
- **Removed/deferred item:** Do not delete. Mark with `[延期：...]` and the reason.

**Contradiction detection:** After extracting all differences, cross-check the design documents against each other. Flag any inconsistencies between documents (e.g., one doc says ECharts, another says Recharts; conflicting version numbers; different caching strategies). List these as `[存疑：...]` items with both sources cited. These contradictions need the user's decision before syncing — don't silently pick a winner.

Present all proposed changes (including flagged contradictions) to the user before writing.

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

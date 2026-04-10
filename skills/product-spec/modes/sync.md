# Sync Mode — Design Doc to Product-Spec Synchronization

## When to Use

Run sync **after `/ce:work` completes implementation**, not after brainstorm or plan creation. Unexecuted plans should not be synced to the product spec, they represent intent, not reality.

**Recommended order:** sync first, then check. Sync adds new features discovered in design docs as `[ ]` items. Check then scans the code to update those items to `[x]`, `[~]`, or `[ ]`.

## Flow

### Step 1: Read Current Product-Spec

Read `Product-Spec.md` from the project root. If it doesn't exist, warn the user and suggest running `/product-spec draft` first.

### Step 2: Scan Design Documents

Look for recently changed files in:

- `docs/brainstorms/` — requirements exploration outputs
- `docs/plans/` — implementation plans

Identify files modified since the last sync (compare timestamps or use git log if available). Read each relevant file and extract:

- New features or capabilities not in Product-Spec.md
- Modified requirements or scope changes
- Removed or deferred items

### Step 3: Compare and Update

For each difference found:

- **New feature:** Add to Product-Spec.md as `- [ ]` with a note indicating source (e.g., `(from: plans/auth-system.md)`).
- **Modified requirement:** Update the existing entry, preserving the current `[ ]`/`[x]`/`[~]` status. Add `[变更：...]` marker describing what changed.
- **Removed/deferred item:** Do not delete. Mark with `[延期：...]` and the reason.

Present all proposed changes to the user before writing.

### Step 4: Changelog

Append a timestamped entry to `Product-Changelog.md` (create the file if it doesn't exist). Format:

<example title="changelog-entry">
```markdown
## YYYY-MM-DD — Sync from design docs

### Added
- Feature X (source: plans/feature-x.md)

### Changed
- Feature Y: updated scope to include Z

### Deferred
- Feature W: moved to v2 per plan discussion
```
</example>

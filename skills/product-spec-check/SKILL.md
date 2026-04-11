---
name: product-spec-check
description: >
  Use when: checking feature completeness by comparing Product-Spec.md against actual code.
  Trigger on: "product-spec-check", "/ce-gs-harness:product-spec-check", "功能完整度", "产品检查",
  "检查实现进度", "哪些功能还没做".
  Do not trigger for: drafting requirements (product-spec-draft's job),
  syncing design docs (product-spec-sync's job).
---

# Check — Feature Completeness Audit

## Purpose

Compare the Product-Spec.md checklist against actual code to determine what's been implemented, what's partial, and what's missing.

## Before You Start

If `docs/brainstorms/` or `docs/plans/` contain design documents that haven't been synced yet, suggest running `/ce-gs-harness:product-spec-sync` first. Sync adds new features from design docs as `[ ]` items, then check verifies them against code. Running check without sync may miss features that were planned but not yet tracked in Product-Spec.md.

## Flow

### Step 1: Extract Checklist

Read `Product-Spec.md` from the project root. If it doesn't exist, inform the user and suggest running `/ce-gs-harness:product-spec-draft` first — there's nothing to check without a spec.

Extract all checklist items (`- [ ]`, `- [x]`, `- [~]`).

For each item, note any code identifiers included (component names, route paths, API endpoints). These are your primary search targets — they're far more reliable than guessing keywords from a natural language description.

### Step 2: Determine Search Scope

Before scanning, identify the relevant source directories. Look at the project structure and focus on:

- `src/`, `app/`, `lib/`, `pages/` — typical source directories
- Test directories (`__tests__/`, `test/`, `spec/`) — as supporting evidence

If the project is large or the structure is unclear, ask the user which directories contain the relevant code. A targeted scan is faster and more accurate than a full-project grep — scanning `node_modules` or `dist` produces noise that drowns out real matches.

### Step 3: Scan Code

For each feature in the checklist:

**If code identifiers are present** (e.g., `RegisterForm`, `/api/auth/register`):

Use two complementary search strategies:
- **File name matching (Glob):** find component files, route files, and test files that match the identifier name (e.g., `**/RegisterForm.*`, `**/register.test.*`).
- **Content search (Grep):** find the identifier in imports, route definitions, class/function declarations. This catches cases where the implementation exists but lives in a differently-named file.

Both are needed — Glob alone misses implementations buried inside other files, Grep alone misses files whose existence is the evidence (e.g., a `RegisterForm.tsx` file).

**If no identifiers** (just a feature description):
- Extract the most specific nouns and verbs from the description.
- Search for those terms in file names, function names, imports, and route definitions.
- Flag these matches as lower-confidence since you're inferring the connection.

Look for related test files as additional evidence of implementation.

### Step 4: Judge Status

For each feature, assign a status based on the depth of evidence:

- **`[x]` Complete** — the code structure exists (file, function, route) AND reading the implementation confirms it covers the described behavior. Don't mark complete based on a file existing alone — a stub or skeleton doesn't count.
- **`[~]` Partial** — code structure exists but the implementation is incomplete. Explain specifically what's missing (e.g., "endpoint exists but returns hardcoded data", "UI component renders but form validation not implemented").
- **`[ ]` Not found** — no matching code detected through any search strategy.

Low-confidence matches (from keyword-based search without explicit identifiers) should be marked as "coverage uncertain", not "not implemented". Absence of evidence is not evidence of absence — the code might exist under a different name or structure than you searched for.

### Step 5: Output Report

Group findings by status:

<example title="completeness-report">
```
## Completeness Report

### Complete [x] — N items
- Feature A
- Feature B

### Partial [~] — N items
- Feature C: missing error handling for edge case X
- Feature D: UI exists but API integration not connected

### Not Found [ ] — N items
- Feature E
- Feature F

### Coverage Uncertain — N items
- Feature G: possible match in `src/utils/helper.ts` but unclear

---
Completion: XX% (N/M features)
```
</example>

After the report, suggest priority order for remaining work based on dependencies and user impact.

### Step 6: Update Product-Spec.md

Ask the user for confirmation before writing any changes. Then update:

- Checklist markers to reflect audit results.
- Add newly discovered code identifiers to items that were missing them. This makes future checks faster and more accurate — an item with explicit identifiers can be verified with high confidence instead of relying on keyword guessing.

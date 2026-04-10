# Check Mode — Feature Completeness Audit

## Purpose

Compare the Product-Spec.md checklist against actual code to determine what's been implemented, what's partial, and what's missing.

## Flow

### Step 1: Extract Checklist

Read `Product-Spec.md` from the project root. Extract all checklist items (`- [ ]`, `- [x]`, `- [~]`).

For each item, note any code identifiers included (component names, route paths, API endpoints). These are your primary search targets — they're far more reliable than guessing keywords from a natural language description.

### Step 2: Determine Search Scope

Before scanning, identify the relevant source directories. Look at the project structure and focus on:

- `src/`, `app/`, `lib/`, `pages/` — typical source directories
- Test directories (`__tests__/`, `test/`, `spec/`) — as supporting evidence

If the project is large or the structure is unclear, ask the user which directories contain the relevant code. A targeted scan is faster and more accurate than a full-project grep.

### Step 3: Scan Code

For each feature in the checklist:

**If code identifiers are present** (e.g., `RegisterForm`, `/api/auth/register`):
- Search directly for those identifiers — file names, class/function names, route definitions. This is a high-confidence match.

**If no identifiers** (just a feature description):
- Extract the most specific nouns and verbs from the description.
- Search for those terms in file names, function names, imports, and route definitions.
- Flag these matches as lower-confidence since you're inferring the connection.

Look for related test files as additional evidence of implementation.

### Step 4: Judge Status

For each feature, assign a status:

- **`[x]` Complete** — code clearly implements the described behavior.
- **`[~]` Partial** — code exists but is incomplete. Explain specifically what's missing (e.g., "endpoint exists but error handling not implemented").
- **`[ ]` Not found** — no matching code detected.

Low-confidence matches should be marked as "coverage uncertain", not "not implemented". Absence of evidence is not evidence of absence — the code might exist under a different name or structure than you searched for.

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
- Add newly discovered code identifiers to items that were missing them, so future checks are faster and more accurate.

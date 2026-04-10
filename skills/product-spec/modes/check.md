# Check Mode — Feature Completeness Audit

## Purpose

Compare the Product-Spec.md checklist against actual code to determine what's been implemented, what's partial, and what's missing.

## Flow

### Step 1: Extract Checklist

Read `Product-Spec.md` from the project root. Extract all items using these markers:

- `- [ ]` — not started
- `- [x]` — complete
- `- [~]` — partial

Build a structured list of all features with their current status.

### Step 2: Scan Code

For each feature in the checklist:

- Identify keywords, function names, component names, or route patterns that would indicate implementation.
- Search the code directory using keyword matching (file names, function names, imports, route definitions).
- Look for related test files as additional evidence of implementation.

### Step 3: Judge Status

For each feature, assign a status:

- **`[x]` Complete** — code clearly implements the described behavior.
- **`[~]` Partial** — code exists but is incomplete. Explain specifically what's missing (e.g., "endpoint exists but error handling not implemented").
- **`[ ]` Not found** — no matching code detected.

**Important:** Low-confidence matches should be marked as "coverage uncertain", not "not implemented". Absence of evidence is not evidence of absence.

### Step 4: Output Report

Group findings by status and present:

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

After the report, suggest priority order for remaining work based on dependencies and user impact.

### Step 5: Update Product-Spec.md

Ask the user for confirmation before writing any changes. Then update the checklist markers in Product-Spec.md to reflect the audit results.

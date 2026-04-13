# Noise Filter

## Confidence gate

Only report findings with >80% confidence. Unverified findings generate false-positive noise that wastes review cycles.

## Deduplication

Merge similar findings into one item. Repeated items waste context and make reports harder to act on.

## Objectivity requirement

Report only findings with an objective correctness dimension. Style opinions without objective correctness (naming preferences, formatting taste) are noise, not findings.

## Severity categories

- **Critical** (must fix): Bugs, security issues, data loss risks, broken functionality
- **Important** (should fix): Performance problems, missing error handling, API contract violations
- **Suggestion** (nice to have): Readability improvements, minor refactors, test coverage gaps

<!-- ce-gs-harness v0.8.0 -->

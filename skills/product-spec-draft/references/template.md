# Product-Spec.md Template

Use this structure when generating or updating Product-Spec.md. Only include sections where the conversation provided enough information — skip or mark `[待定]` for gaps.

```markdown
# [Product Name]

> [Product] is a [category] that helps [target user] [achieve outcome].

## Problem

### Current Solution
How the target user solves this today.

### Gap
What's missing between the current solution and the ideal.

## Features

### Core Features (v1)
- [ ] Feature A (`ComponentName`, `/api/endpoint`) — user action → system response
- [ ] Feature B — user action → system response

### Deferred (not in v1)
- Feature X — reason for deferral
- Feature Y — reason for deferral

## User Flows

### [Flow Name]
1. User does A
2. System responds with B
3. If error: system shows C

(Derive from feature action-response pairs. Include error/edge-case paths.)

## Data Model

Entity relationships only — no field-level definitions.

- Entity A 1:N → Entity B
- Entity A 1:1 → Entity C

## Tech Constraints

(Only constraints that affect product decisions, e.g., "WeChat Mini Program" or "must integrate with existing system X". Skip if none.)

## Third-Party Dependencies

- Service/API name — what it's used for

## Non-Functional Requirements

- Performance: ...
- Security: ...
- Accessibility: ...
```

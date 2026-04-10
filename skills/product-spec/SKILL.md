---
name: product-spec
description: >
  Use when: maintaining Product-Spec.md — drafting requirements, checking feature completeness, or syncing design docs.
  Trigger on: "product-spec", "/product-spec", "产品文档", "Product-Spec",
  "/product-spec draft", "/product-spec check", "/product-spec sync".
  Do not trigger for: technical design (CE brainstorm's job), UI design (ui-ux-pro-max's job),
  code review (CE review's job).
---

# Product-Spec

Parse the `args` parameter to determine which mode to run:

| Arg | Mode | Description |
|-----|------|-------------|
| _(none)_ or `draft` | Draft | Conversational requirements gathering to generate or update Product-Spec.md |
| `check` | Check | Feature completeness check — scan code against Product-Spec.md checklist |
| `sync` | Sync | Sync brainstorm/plan docs into Product-Spec.md after implementation |

## Routing

- If args is empty or equals `draft`: read `<skill-path>/modes/draft.md` and follow it.
- If args equals `check`: read `<skill-path>/modes/check.md` and follow it.
- If args equals `sync`: read `<skill-path>/modes/sync.md` and follow it.
- If args is anything else: show the table above and ask the user to choose a mode.

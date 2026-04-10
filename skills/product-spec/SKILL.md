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

## Gotchas

- Draft Step 7 的非功能需求：skill 说"问用户"，但模型倾向于自己猜然后标 `[假设]`。如果用户在场（交互模式），优先问而不是猜。
- Draft checkpoint save 容易被跳过，尤其在非交互场景或对话节奏快的时候。写完 Step 4 后务必先写文件再继续。
- Check mode 遇到 spec 描述模糊的功能（如"基础图表"）时，判定会在 Complete 和 Coverage Uncertain 之间摇摆。优先看代码能力是否具备，而不是纠结 spec 措辞。
- Draft 数据模型容易过度展开到字段级别。只写实体和关系，字段定义交给 `/ce:plan`。

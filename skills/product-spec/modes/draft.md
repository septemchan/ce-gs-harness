# Draft Mode — Conversational Requirements Gathering

## Core Discipline

**Ask one question at a time.** When users face multiple questions at once, they skip the hard ones, and the spec ends up with critical gaps. Sequential questions create a conversation rhythm that makes it easier for the user to think through each point properly.

**Push to behavioral level.** A feature description is detailed enough when you could draw a UI prototype from it. Keep asking until every feature is described as: user action → system response. Vague descriptions like "user management" aren't actionable — "user clicks 'Invite', enters email, system sends invitation link and shows pending status" is.

## 7-Step Flow

### Step 1: Check for Existing Product-Spec.md

Search the project root for `Product-Spec.md`.

- If found: read it, summarize the current state, and ask the user whether this is an update or a rewrite.
- If not found: inform the user you'll create a new one, then proceed to Step 2.

### Step 2: Product Positioning

Ask: **What is this product, and who is it for?**

Goal: one sentence in the format "[Product] is a [category] that helps [target user] [achieve outcome]."

This sentence becomes the anchor for all later decisions — when scope debates arise, you can check feature proposals against it.

### Step 3: Core Problem

Ask three sub-questions (one at a time):

1. What problem does this solve?
2. How does the target user currently solve it?
3. What's the gap between the current solution and the ideal?

Understanding the gap is what separates a spec that describes features from a spec that explains why those features matter. The gap directly informs which features are core vs. nice-to-have.

### Step 4: Core Features

List all features the user mentions. For each feature, push to behavioral level:

- What does the user do? (action)
- What does the system respond with? (response)
- What happens on error or edge case?

If a feature involves intelligent/generative behavior (e.g., content generation, recommendations, classification), dig deeper into: what inputs it receives, what outputs it produces, what constraints apply (tone, accuracy, safety), and what the failure modes look like. These details matter because AI-driven features are the ones most likely to behave unpredictably without clear boundaries.

If the user already has technical concepts in mind (component names, route paths, API endpoints), capture them alongside the feature. These identifiers make it much easier to verify implementation later — Check mode uses them to locate the corresponding code.

Do not move on until every feature has a concrete user-action → system-response pair.

**Checkpoint save:** After completing this step, write a draft `Product-Spec.md` with what you have so far (Steps 2–4), marked with `> ⚠️ 草稿 — 后续步骤尚未完成` at the top. This protects against conversation interruption — the core product identity and feature list won't be lost. Subsequent steps will update this file in place.

### Step 5: MVP Boundary

Explicitly ask: **What does v1 NOT do?**

List exclusions clearly. This prevents scope creep and sets expectations. If the user is unsure, suggest candidates based on the feature list (e.g., "Does v1 include multi-language support, or is that later?").

Scope exclusions are as important as scope inclusions — they give downstream implementors permission to say "no" when someone asks for a feature that was explicitly deferred.

### Step 6: Tech Constraints

Ask about preferences and constraints:

- Frontend framework / library
- Backend / API layer
- Database / storage
- Any existing stack or tools that must be used

If the user doesn't have preferences, that's fine — note it as "no constraint" rather than guessing defaults.

### Step 7: Derive and Confirm

Based on all gathered information, derive the following sections. Only generate a section if the conversation provided enough information — do not fabricate details to fill gaps.

1. **User flows** — derive from Step 4's action-response pairs. Include normal path and error/edge-case paths.
2. **Data model** — entities and their relationships only (e.g., "Member 1:N → Pet, Member 1:N → Transaction"). Do not expand into field-level definitions (column names, types, constraints) — that belongs in technical design (`/ce:plan`). If entities weren't discussed, skip and note `[待定：需要进一步讨论数据结构]`.
3. **Third-party dependencies** — only list services, APIs, or libraries that were explicitly mentioned or clearly implied.
4. **Non-functional requirements** — ask the user about performance, security, and accessibility expectations rather than assuming defaults.

Present the derived sections to the user for confirmation before writing.

## Output

Update (or create) the final `Product-Spec.md` at the project root. Remove the draft marker if present.

### Feature checklist format

Each feature in the checklist should include code identifiers when available, so Check mode can locate them:

<example title="feature-checklist">
- [ ] 用户注册 (`/api/auth/register`, `RegisterForm`)
- [ ] 商品搜索 (`SearchBar`, `/api/products/search`)
- [ ] 订单创建 (`POST /api/orders`, `OrderConfirmation`)
</example>

If the user didn't mention specific identifiers, write the feature name only — don't invent identifiers.

Mark any uncertain items with `[假设：...]` so they can be revisited.

# Draft Mode — Conversational Requirements Gathering

## Core Discipline

**Ask one question at a time.** When a user faces multiple questions simultaneously, they skip the hard ones, leaving critical gaps in the spec. Ask one question, wait for the answer, then ask the next.

**Push to behavioral level.** If you can't draw a UI prototype from the description, the spec isn't detailed enough. Keep asking until every feature is described as: user action -> system response.

## 8-Step Flow

### Step 1: Check for Existing Product-Spec.md

Search the project root for `Product-Spec.md`.

- If found: read it, summarize the current state, and ask the user whether this is an update or a rewrite.
- If not found: inform the user you'll create a new one, then proceed to Step 2.

### Step 2: Product Positioning

Ask: **What is this product, and who is it for?**

Goal: one sentence in the format "[Product] is a [category] that helps [target user] [achieve outcome]."

### Step 3: Core Problem

Ask three sub-questions (one at a time):

1. What problem does this solve?
2. How does the target user currently solve it?
3. What's the gap between the current solution and the ideal?

### Step 4: Core Features

List all features the user mentions. For each feature, push to behavioral level:

- What does the user do? (action)
- What does the system respond with? (response)
- What happens on error or edge case?

Do not move on until every feature has a concrete user-action -> system-response pair.

### Step 5: MVP Boundary

Explicitly ask: **What does v1 NOT do?**

List exclusions clearly. This prevents scope creep and sets expectations. If the user is unsure, suggest candidates based on the feature list (e.g., "Does v1 include multi-language support, or is that later?").

### Step 6: AI Decision

Ask: **Does this product need AI capabilities?**

- If yes: draft a system prompt for the AI component. Include role, constraints, tone, and output format.
- If no: note this explicitly and move on.

### Step 7: Tech Constraints

Ask about preferences and constraints:

- Frontend framework / library
- Backend / API layer
- Database / storage
- Any existing stack or tools that must be used

### Step 8: Auto-Derive

Based on all gathered information, automatically generate:

1. **User flows** — normal path + error/edge-case paths
2. **Data model** — entities, relationships, key fields
3. **Third-party dependencies** — APIs, services, libraries
4. **Non-functional requirements** — performance, security, accessibility expectations

Present the derived sections to the user for confirmation before writing.

## Output

Write the final Product-Spec.md to the project root. Mark any uncertain items with `[假设：...]` so they can be revisited.

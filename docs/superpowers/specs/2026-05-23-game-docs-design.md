# Game Canon Docs Design

Date: 2026-05-23

## Purpose

Create a lightweight Korean source of truth for the game concept, world,
characters, and first scenario flow.

The project is still at the beginning of development, so these documents should
not become a heavy game design bible. They should be short enough to maintain,
but clear enough for future AI and development sessions to use as the shared
reference before changing gameplay, story, characters, dog behavior, tone, or
world details.

## Source Material

Use `/Users/lucashan/Documents/dog-starland-design-brief.md` as the source
brief. The brief itself is not copied into the repository. Instead, its current
direction is distilled into four canonical documents under `docs/game/`.

## Decisions

- Store the game canon documents under `docs/game/`.
- Write all four documents in Korean.
- Keep the documents lightweight and practical.
- Treat the four documents as the source of truth after they are created.
- Do not copy the original brief into the repository.
- Add a short root `AGENTS.md` reference rule so AI coding agents read these
  documents before changing game concept, scenario, character, world, dialogue,
  or dog behavior.
- Do not create a custom skill yet. Add one later only if `docs/game/` updates
  become frequent enough to justify a repeatable workflow.

## Document Set

Create these files:

```text
docs/game/
  vision.md
  world.md
  characters.md
  scenario.md
```

### `vision.md`

Purpose: Define the game's core direction and decision criteria.

Include:

- One-line game description.
- Player emotional goals.
- Core day loop.
- Initial prototype success criteria.
- Features and tones that are out of scope for the early prototype.

This is the first document to read when deciding whether a new idea fits the
game.

### `world.md`

Purpose: Define the starland setting, tone, and boundaries.

Include:

- One-line description of the world.
- First playable space: small house and yard in the starland.
- Visual, audio, and emotional keywords.
- Rules for turning ordinary dog-care actions into starland expressions.
- Allowed tone and content.
- Things to avoid.
- A short list of unresolved world questions.

The world should feel unfamiliar but safe. It should support the relationship
between the player and the dog rather than becoming a large fantasy lore system.

### `characters.md`

Purpose: Define the player character, dog, relationship, and future NPC
constraints.

Include:

- Player character role and tone.
- Dog role, personality, and behavior expression.
- How the player and dog relationship should change over time.
- Candidate role for early NPCs, if any.
- Guardrails so NPCs do not steal focus from the player-dog relationship.
- Example dialogue tone for the player.

The dog should not be treated as a command object. Its emotions should be shown
through movement, distance, timing, sound, posture, and small autonomous actions.

### `scenario.md`

Purpose: Define the story start and first playable day.

Include:

- Starting situation.
- Prologue flow.
- First-day sequence.
- Emotional goal for each sequence.
- First-day emotional curve.
- Story developments to avoid.
- Long-term expansion candidates.

The first day should stay small, warm, and playable. Story should not overpower
the daily interaction with the dog.

## Writing Rules

- Use Korean prose with short, clear sentences and bullet lists.
- Keep the tone warm but actionable.
- Put only directionally stable content in the main body.
- Put unresolved items in an `아직 정하지 않은 것` section where needed.
- Avoid large lists of speculative ideas.
- Do not use formal decision logs yet.
- Do not over-structure the documents with `Confirmed`, `Deferred`, or similar
  status sections at this stage.
- Keep the repeated criteria visible:
  - Does this make the dog feel more alive?
  - Does this make time with the dog feel warmer?
  - Does this make repetition feel like affection rather than labor?
  - Does this give a small sense of satisfaction at the end of the day?
  - Does this avoid expanding the early prototype unnecessarily?

## Agent Guidance

Update the root `AGENTS.md` with a short rule:

- Before work that affects gameplay concept, scenario, characters, world,
  dialogue, dog behavior, or tone, read the relevant files under `docs/game/`.
- If a task changes canonical game direction, update the relevant `docs/game/`
  document together with the implementation.
- Keep `AGENTS.md` as a pointer, not a copy of the game design documents.
- Consider a dedicated skill later if this update pattern becomes repetitive.

## Non-Goals

- Do not implement gameplay.
- Do not create Phaser scenes, assets, systems, or data structures.
- Do not write a complete long-form GDD.
- Do not create a custom Codex skill yet.
- Do not import or commit the original design brief as a separate repo file.
- Do not add extra docs such as `systems/dog-state.md` or `art/style-guide.md`
  until real implementation work creates that need.

## Verification

After writing the implementation plan and later creating the documents, verify:

- The four files exist under `docs/game/`.
- The documents are in Korean.
- The root `AGENTS.md` points to `docs/game/` without duplicating the docs.
- The documents are short enough to read during future AI sessions.
- The documents do not introduce heavy mechanics, dark story pressure, or
  speculative world lore beyond the current brief.

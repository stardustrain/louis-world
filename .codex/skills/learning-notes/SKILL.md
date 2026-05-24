---
name: learning-notes
description: Use when the user wants to collect accepted learning points from a game design or implementation discussion and write them as one session-level raw Markdown note under docs/learning/raw for later concept-level reorganization.
---

# Learning Notes

Use this skill to help a frontend-experienced developer who is new to game development build a reusable learning trail from game design and implementation sessions.

The goal is not to create a polished encyclopedia immediately. The goal is to preserve session-level raw learning notes in a consistent format so they can later be reorganized into concept-level documents.

## When To Use

Use this skill when either condition is true:

- The user explicitly invokes `$learning-notes`.
- During a game design or implementation discussion, you notice a learning point that would help the user give clearer future instructions and save tokens.

Do not use this skill for general frontend basics, unrelated project notes, or game canon content that belongs in `docs/game/`.

## Operating Model

This workflow has two modes.

### 1. Suggest Learning Candidates During Discussion

During normal work, propose a learning note candidate when a topic meets one or more of these criteria:

- A game development beginner is likely to miss it.
- It looks similar to a frontend concept but behaves differently in game development.
- It would help the user make future Codex instructions more precise.
- It directly relates to Phaser, scenes, the game loop, physics, input, cameras, assets, tilemaps, save data, state ownership, testing, or game architecture.
- It explains a real decision or tradeoff from the current session.

Keep candidate suggestions short. Do not interrupt the main work with a long explanation.

Use this format:

```text
학습 노트 후보: <one-sentence candidate>. 수락하면 이번 세션의 학습 포인트 목록에 넣겠습니다.
```

If the user accepts, remember the item in the conversation as an accepted learning point. Do not write a repo file yet.

When the accepted list grows, restate it briefly so it does not get lost:

```text
현재 선택된 학습 포인트: LP 후보 3개 - Scene 생명주기, game loop와 React render 차이, PreloaderScene의 asset 소유권.
```

### 2. Write Raw Notes When Invoked

When the user invokes `$learning-notes`, write all accepted learning points from the current session into one raw Markdown file.

If there are no accepted learning points, do not create a file. Tell the user that there are no accepted learning points yet and ask them to select candidates first.

## Output Location

Write raw learning notes to:

```text
docs/learning/raw/YYYY-MM-DD-<session-topic>.md
```

Rules:

- Use the current date from the environment.
- Use an English lowercase slug for `<session-topic>`.
- If the session topic is unclear, propose a short slug and ask for confirmation.
- If the target file already exists, do not overwrite it without confirmation.
- Do not create or grow `docs/learning/README.md`.
- Do not create `docs/learning/concepts/` during this workflow.

## Raw Note Format

Every raw note must use this structure.

```md
---
title: "<Korean session title> 학습 노트"
date: "YYYY-MM-DD"
type: "learning-raw"
status: "raw"
audience: "frontend-10y-game-dev-beginner"
session_topic: "<session-topic-slug>"
project_area:
  - "<area>"
source:
  kind: "codex-session"
related_docs:
  - "<path-to-related-spec-or-doc>"
future_index_candidates:
  - "<concept-slug>"
---

# <Korean session title> 학습 노트

## 세션 맥락

이번 세션에서 무엇을 설계하거나 결정했는지, 그리고 왜 학습 노트가 필요한지 짧게 쓴다.

## 설계 결정 요약

- 결정: <actual decision>
  이유: <why this decision was made>
  관련 학습 포인트: LP-001

## 학습 포인트

### LP-001: <learning point title>

Metadata:

- Concepts: `<concept-slug>`, `<concept-slug>`
- Related decisions: `<decision summary>`
- Transfer from frontend: `<frontend concept>`, `<frontend concept>`
- Confidence: `stable`
- Future index candidate: `<concept-slug>`

Why it matters:
프론트엔드 개발자가 이 개념을 알아야 다음 설계 지시를 더 정확히 할 수 있는 이유를 설명한다.

Core idea:
핵심 개념을 짧고 명확하게 설명한다.

In this project:
이번 프로젝트에서는 이 개념이 어디에 적용됐는지 설명한다.

Tradeoffs:

- 선택지 A: <option>
- 선택지 B: <option>
- 현재 선택: <chosen option and reason>

How to instruct Codex next time:

- "<future instruction the user can reuse>"
- "<future instruction the user can reuse>"

Questions to revisit:

- <question to revisit later>
```

## Required Sections

Each raw note must include:

- YAML frontmatter.
- `세션 맥락`.
- `설계 결정 요약`.
- `학습 포인트`.
- One stable `LP-###` heading per accepted learning point.
- A `Metadata` block for every learning point.
- `How to instruct Codex next time` for every learning point.

Each `Metadata` block must include:

- `Concepts`.
- `Related decisions`.
- `Transfer from frontend`.
- `Confidence`.
- `Future index candidate`.

Use `Confidence: stable` when the note is based on stable project decisions or official docs. Use `Confidence: provisional` when the note captures an early project choice that may change.

## Writing Guidance

Write in Korean unless the user asks for another language.

Optimize for a senior frontend developer learning game development:

- Connect game concepts to frontend concepts without pretending they are the same.
- Explain architecture and tradeoffs, not just API usage.
- Prefer concrete project examples over generic textbook explanations.
- Preserve raw context from the session, including why a decision was made.
- Keep each learning point useful for future instructions to Codex.

Do not include:

- General frontend basics the user likely already knows.
- Long copied excerpts from external docs.
- Game canon summaries that belong in `docs/game/`.
- Unaccepted learning candidates.
- A large `README.md` index.

## Context7 And Exa

If the user invokes `$context7` or asks for current library behavior, use Context7 for official library documentation before writing technical claims about Phaser, Vite, testing tools, or related libraries.

If the user invokes `$exa` or asks for current Codex behavior, use Exa or official OpenAI documentation before writing technical claims about Codex skills, commands, MCP, or related Codex features.

External sources should support the raw learning note. They should not replace the session-specific explanation.

## Verification Before Finishing

Before claiming the note is complete, check:

- The file path is under `docs/learning/raw/`.
- The file is one session-level raw note, not a concept-level document.
- Every accepted learning point appears exactly once as `LP-###`.
- Every `LP-###` has a `Metadata` block.
- Every `LP-###` has `How to instruct Codex next time`.
- No large `docs/learning/README.md` was created.
- No `docs/learning/concepts/` document was created.

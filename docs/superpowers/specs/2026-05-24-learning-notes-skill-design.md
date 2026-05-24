# Learning Notes Skill Design

작성일: 2026-05-24

## 목적

게임 설계와 구현 논의가 끝난 뒤, 사용자가 게임 개발자로서 알고 넘어가면
다음 지시를 더 명확하게 할 수 있는 학습 포인트를 `docs/learning`에 남긴다.

사용자는 프론트엔드 개발 경험이 길지만 게임 개발은 처음이다. 따라서 문서는
기초 용어 설명만 나열하지 않고, 프론트엔드 경험과 게임 개발 개념 사이의 차이,
아키텍처 선택지, 트레이드오프, 다음 Codex 지시 문장으로 바로 연결되는 지식을
정리해야 한다.

이 작업의 목표는 완성된 장기 백과사전을 즉시 만드는 것이 아니다. 현재 단계의
목표는 세션별 raw 학습 노트를 일관된 형식으로 축적해서, 나중에 개념별 문서로
재구성할 수 있게 만드는 것이다.

## 결정 사항

- repo-local 스킬을 만든다.
- 스킬 위치는 `.codex/skills/learning-notes/SKILL.md`로 한다.
- 스킬 이름은 `learning-notes`로 한다.
- 호출 형태는 `$learning-notes`를 기준으로 한다.
- 트리거 방식은 혼합형으로 한다.
- Codex는 설계/구현 논의 중 학습 가치가 높은 후보를 제안할 수 있다.
- 사용자가 수락한 후보만 선택된 학습 포인트로 유지한다.
- 사용자가 스킬을 호출하면 선택된 학습 포인트를 한 번에 정리한다.
- 결과 문서는 세션별 raw 파일 1개로 만든다.
- raw 파일은 `docs/learning/raw/YYYY-MM-DD-<session-topic>.md`에 둔다.
- `docs/learning/README.md`는 만들지 않는다.
- 나중에 필요해지면 `docs/learning/README.md`는 짧은 안내만 담는다.
- 개념별로 정제된 문서는 이번 범위에서 만들지 않는다.

## 비목표

- 매 학습 후보 수락 때마다 repo 파일을 수정하지 않는다.
- `docs/learning/README.md`를 장기 목차나 백과사전처럼 키우지 않는다.
- `docs/learning/concepts/` 문서를 이번 작업에서 만들지 않는다.
- 일반 개발 작업마다 강제로 학습 노트를 생성하지 않는다.
- 게임 정본 문서인 `docs/game/`의 내용을 학습 노트에 중복 복사하지 않는다.
- 학습 노트를 설계 문서나 구현 계획의 대체물로 쓰지 않는다.

## 스킬 동작

### 1. 학습 후보 제안

Codex는 게임 설계, 구현 방향, 아키텍처 선택, Phaser 동작 방식, 에셋 파이프라인,
입력 처리, 상태 소유권, 테스트 전략처럼 학습 가치가 높은 지점이 보이면
짧게 후보를 제안한다.

제안은 본 작업 흐름을 방해하지 않아야 한다. 후보는 한두 문장으로 충분하다.

예시:

```text
학습 노트 후보: Phaser Scene 생명주기는 React component lifecycle과 비슷해
보이지만 책임이 다릅니다. 나중에 정리하면 scene 경계를 더 정확히 지시할 수 있습니다.
```

### 2. 개발자 수락

사용자가 후보를 수락하면 Codex는 그 항목을 대화 상태의 선택된 학습 포인트로
기억한다.

선택 목록은 파일에 즉시 쓰지 않는다. 긴 대화에서는 Codex가 필요한 시점에
선택된 항목을 짧게 재표시해서 누락을 줄인다.

### 3. 반복

후보 제안과 수락은 한 세션 안에서 여러 번 반복될 수 있다. 후보가 많아지면
Codex는 중복 후보를 합치거나 더 좁은 이름으로 바꿀 수 있다.

### 4. 스킬 호출 시 raw 문서 생성

사용자가 `$learning-notes`를 호출하면 Codex는 선택된 모든 학습 포인트를
세션별 raw 문서 1개로 정리한다.

선택된 학습 포인트가 없으면 파일을 만들지 않고, 먼저 정리할 후보를 선택해야
한다고 답한다.

같은 날짜와 주제의 raw 파일이 이미 있으면 덮어쓰지 않는다. 기존 파일을 갱신할지,
더 구체적인 slug로 새 파일을 만들지 확인한다.

## 문서 경로

raw 학습 노트는 다음 경로를 사용한다.

```text
docs/learning/raw/YYYY-MM-DD-<session-topic>.md
```

`<session-topic>`은 영문 소문자 slug로 작성한다.

예시:

```text
docs/learning/raw/2026-05-24-phaser-scene-architecture.md
docs/learning/raw/2026-05-24-asset-loading-and-preloader.md
```

## raw 문서 포맷

각 raw 문서는 frontmatter와 반복 가능한 학습 포인트 블록으로 구성한다.
이 포맷은 사람이 읽기 쉬우면서도 나중에 개념별 문서로 재가공하기 쉽게 만드는
것을 목표로 한다.

```md
---
title: "Phaser 초기 아키텍처 설계 학습 노트"
date: "2026-05-24"
type: "learning-raw"
status: "raw"
audience: "frontend-10y-game-dev-beginner"
session_topic: "phaser-initial-architecture"
project_area:
  - phaser
  - architecture
  - game-loop
source:
  kind: "codex-session"
related_docs:
  - "docs/superpowers/specs/2026-05-23-phaser-vite-workspace-design.md"
future_index_candidates:
  - "phaser-scene-lifecycle"
  - "game-loop-vs-react-rendering"
---

# Phaser 초기 아키텍처 설계 학습 노트

## 세션 맥락

이번 세션에서 어떤 설계 결정을 했고, 왜 이 학습 노트가 생겼는지 짧게 쓴다.

## 설계 결정 요약

- 결정: 공유 asset은 `PreloaderScene`에서 로드한다.
  이유: scene 전환 전에 공용 asset 준비 책임을 한곳에 모을 수 있다.
  관련 학습 포인트: LP-001, LP-002

## 학습 포인트

### LP-001: Scene 생명주기는 React component lifecycle과 다르게 봐야 한다

Metadata:

- Concepts: `phaser-scene`, `lifecycle`, `game-loop`
- Related decisions: `BootScene -> PreloaderScene -> GameScene`
- Transfer from frontend: `component lifecycle`, `resource loading`
- Confidence: `stable`
- Future index candidate: `phaser-scene-lifecycle`

Why it matters:
프론트엔드 개발자가 이 개념을 알아야 다음 설계 지시를 더 정확히 할 수 있는 이유.

Core idea:
핵심 개념을 짧고 명확하게 설명한다.

In this project:
이번 프로젝트에서는 이 개념이 어디에 적용됐는지 설명한다.

Tradeoffs:

- 선택지 A: 모든 scene이 필요한 asset을 직접 로드한다.
- 선택지 B: 공용 asset은 preloader가 로드하고, scene 전용 asset만 각 scene이 로드한다.
- 현재 선택: 선택지 B. 초기 구조가 단순하고 나중에 asset 소유권을 설명하기 쉽다.

How to instruct Codex next time:

- "공유 asset은 PreloaderScene에서 로드하고, scene 전용 asset은 해당 scene이 소유하게 해줘."
- "Scene 전환 데이터와 전역 게임 상태를 분리해서 설계해줘."

Questions to revisit:

- 나중에 UI가 React로 붙으면 어떤 state가 scene 밖으로 나가야 하는가?
```

## 학습 포인트 선정 기준

학습 포인트 후보는 다음 조건 중 하나 이상을 만족해야 한다.

- 게임 개발 초심자가 놓치기 쉬운 개념이다.
- 프론트엔드 경험과 비슷해 보여서 오해하기 쉬운 개념이다.
- 설계 지시의 품질을 크게 높일 수 있는 개념이다.
- Phaser, 게임 루프, 씬, 물리, 입력, 카메라, 에셋, 타일맵, 저장, 상태 관리,
  테스트 전략과 직접 연결된다.
- 이번 세션의 실제 결정이나 트레이드오프를 이해하는 데 필요하다.

다음 항목은 후보로 삼지 않는다.

- 단순한 API 암기.
- 이번 프로젝트 결정과 연결되지 않는 일반론.
- 이미 사용자가 명확히 알고 있다고 밝힌 프론트엔드 기초.
- `docs/game/` 정본 내용을 반복 설명하는 세계관 요약.

## 나중에 개념별 문서로 재구성하기 위한 규칙

각 학습 포인트는 안정적인 ID를 가진다. 예: `LP-001`, `LP-002`.

각 학습 포인트는 반드시 `Metadata` 블록을 가진다. `Concepts`,
`Related decisions`, `Transfer from frontend`, `Confidence`,
`Future index candidate`를 포함한다.

`Concepts`와 `Future index candidate`는 나중에 raw 파일 여러 개를 모아
`docs/learning/concepts/<concept>.md` 문서를 만들 때의 색인 역할을 한다.

`How to instruct Codex next time`은 반드시 포함한다. 이 섹션은 학습 노트가
실제 토큰 절약과 지시 품질 개선으로 이어지는지를 확인하는 핵심 기준이다.

## Context7와 Exa 사용

사용자가 `$context7` 또는 `$exa`를 함께 언급한 경우, 스킬은 필요한 범위에서
현재 문서나 공식 자료를 확인할 수 있다.

- Phaser, Vite, 테스트 도구처럼 라이브러리 동작이 중요하면 Context7로 최신
  공식 문서를 우선 확인한다.
- Codex 기능, 스킬, 커맨드, MCP처럼 현재 동작이 바뀔 수 있는 정보는 Exa나
  공식 OpenAI 문서로 확인한다.
- 외부 자료는 raw 학습 노트의 본문을 대체하지 않는다. 이번 세션의 결정과
  사용자의 이해에 필요한 부분만 요약한다.

## 오류 처리

- 선택된 학습 포인트가 없으면 파일을 만들지 않는다.
- 세션 주제가 모호하면 Codex가 짧은 slug를 제안하고 확인받는다.
- 기존 raw 파일과 경로가 충돌하면 덮어쓰기 전에 확인한다.
- 학습 포인트가 너무 많으면 세션별 파일 하나 안에서 섹션을 나누되, 개념별
  별도 파일로 쪼개지 않는다.

## 검증 기준

구현 뒤에는 다음을 확인한다.

- `.codex/skills/learning-notes/SKILL.md`가 존재한다.
- 스킬 frontmatter에 `name: learning-notes`가 있다.
- 스킬 설명이 명시 호출과 학습 후보 제안 흐름을 모두 설명한다.
- 스킬 본문에 `docs/learning/raw/YYYY-MM-DD-<session-topic>.md` 경로 규칙이 있다.
- raw 문서 포맷에 frontmatter, 세션 맥락, 설계 결정 요약, 학습 포인트,
  `Metadata`, `How to instruct Codex next time`가 포함되어 있다.
- README 비대화를 막는 규칙이 있다.
- 선택된 학습 포인트가 없을 때 파일을 만들지 않는 규칙이 있다.

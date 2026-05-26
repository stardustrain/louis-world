---
title: "키보드 액션 아키텍처 학습 노트"
date: "2026-05-25"
type: "learning-raw"
status: "raw"
audience: "frontend-10y-game-dev-beginner"
session_topic: "keyboard-action-architecture"
project_area:
  - "game"
  - "architecture"
  - "input"
  - "interaction"
  - "presentation"
source:
  kind: "codex-session"
related_docs:
  - "docs/superpowers/specs/2026-05-24-keyboard-action-design.md"
  - "docs/superpowers/plans/2026-05-24-keyboard-action.md"
future_index_candidates:
  - "scene-object-system-separation"
  - "game-interaction-events"
  - "presenter-boundaries"
  - "game-loop-input"
  - "physics-world-bounds"
---

# 키보드 액션 아키텍처 학습 노트

## 세션 맥락

이번 세션에서는 방향키로 플레이어를 움직이고, 플레이어와 강아지를 24x24 타일맵에 어울리는 작은 토큰으로 표시하는 기능을 설계하고 구현했다. 프론트엔드 경험이 있는 개발자가 게임 구조를 이해할 때 헷갈리기 쉬운 지점은 `object`, `system`, `scene`, `interaction`, `presenter`가 각각 무엇을 책임지는지다. 이 노트는 이번 구현에서 실제로 나눈 책임과 앞으로 Codex에 더 정확히 지시하기 위한 표현을 보존한다.

## 설계 결정 요약

- 결정: 화면에 보이는 플레이어, 강아지, 상호작용 프롬프트는 `objects/`의 presenter가 담당한다.
  이유: Phaser sprite, depth, display size, tint 같은 렌더링 세부사항을 규칙 코드와 분리하기 위해서다.
  관련 학습 포인트: LP-001, LP-003

- 결정: 이동 판단과 상호작용 가능 여부는 `systems/`의 순수 함수 또는 작은 컨트롤러로 분리한다.
  이유: Phaser Scene 없이도 규칙을 테스트하고, 나중에 입력 방식이 늘어나도 같은 규칙을 재사용하기 위해서다.
  관련 학습 포인트: LP-001, LP-002

- 결정: `GameScene`은 맵, presenter, physics, camera, input controller를 조립하는 역할에 집중한다.
  이유: Scene에 모든 규칙을 몰아넣으면 기능이 늘어날수록 update 루프가 비대해지고 테스트하기 어려워지기 때문이다.
  관련 학습 포인트: LP-001, LP-004

- 결정: Arcade physics world bounds를 tilemap 픽셀 크기에 맞추고, camera bounds도 같은 맵 크기를 따른다.
  이유: 화면 크기와 월드 크기는 다르며, 둘을 혼동하면 플레이어가 맵 일부에 접근하지 못한다.
  관련 학습 포인트: LP-005

## 학습 포인트

### LP-001: Scene, object, system은 서로 다른 책임을 가진다

Metadata:

- Concepts: `scene-object-system-separation`, `game-architecture`
- Related decisions: `GameScene은 조립을 담당하고, objects는 표현을, systems는 규칙을 담당한다`
- Transfer from frontend: `container/component separation`, `domain logic extraction`
- Confidence: `stable`
- Future index candidate: `scene-object-system-separation`

Why it matters:
프론트엔드에서는 컴포넌트 하나가 상태, 이벤트, 렌더링을 함께 가질 때도 많다. 게임에서는 매 프레임 실행되는 update 루프와 physics, camera, input이 얽히기 때문에 역할을 나누지 않으면 기능 추가가 빠르게 어려워진다.

Core idea:
`Scene`은 게임 오브젝트를 만들고 서로 연결하는 조립자다. `objects/`는 화면에 보이는 존재와 표시 방법을 다룬다. `systems/`는 입력과 상태를 받아 게임 규칙에 따른 결과를 계산한다.

In this project:
`GameScene`은 home yard map을 만들고, `PlayerPresenter`, `DogPresenter`, `InteractionPromptPresenter`, `PlayerKeyboardController`를 연결했다. 실제 이동 벡터 계산은 `playerMovement`에 있고, 강아지를 쓰다듬을 수 있는지 판단하는 규칙은 `dogInteraction`에 있다.

Tradeoffs:

- 선택지 A: `GameScene` 하나에 모든 이동, 상호작용, 렌더링 코드를 둔다.
- 선택지 B: Scene은 연결만 하고, object/system으로 역할을 나눈다.
- 현재 선택: 선택지 B. 코드가 조금 더 나뉘지만, 테스트와 확장이 쉬워진다.

How to instruct Codex next time:

- "Scene에는 조립 코드만 두고, 판단 규칙은 system의 pure function으로 분리해줘."
- "Phaser sprite 조작은 presenter/object에 두고, game rule에는 Phaser 의존성을 넣지 말아줘."

Questions to revisit:

- Scene이 커지기 시작하면 어떤 단위로 별도 coordinator를 둘 것인가?

### LP-002: Interaction은 입력 장치가 아니라 게임 의미를 표현한다

Metadata:

- Concepts: `game-interaction-events`, `input-mapping`, `domain-event`
- Related decisions: `마우스 클릭과 키보드 E 입력을 DogInteractionEvent로 수렴시킨다`
- Transfer from frontend: `UI event normalization`, `command pattern`
- Confidence: `stable`
- Future index candidate: `game-interaction-events`

Why it matters:
키보드, 마우스, 터치, 게임패드는 모두 입력 장치일 뿐이다. 게임 규칙 입장에서는 "E 키가 눌렸다"보다 "강아지를 쓰다듬는 이벤트가 발생했다"가 더 중요한 의미다.

Core idea:
interaction layer는 raw input을 게임 의미로 바꾼다. 입력 장치별 차이는 이 계층에서 끝나야 하고, 이후 시스템은 공통 이벤트를 처리해야 한다.

In this project:
강아지를 클릭하는 포인터 입력과, 플레이어가 강아지를 바라보는 상태에서 누르는 키보드 상호작용 입력은 둘 다 `DogInteractionEvent`로 이어질 수 있게 설계됐다. 사용자 최종 범위는 우선 방향키 이동이었지만, E 상호작용을 확장할 수 있는 규칙은 이미 `dogInteraction`에 분리되어 있다.

Tradeoffs:

- 선택지 A: 마우스 클릭 로직과 키보드 E 로직이 각각 강아지 반응 시스템을 직접 호출한다.
- 선택지 B: 입력 방식별 처리를 공통 interaction event로 변환한 뒤 반응 시스템에 전달한다.
- 현재 선택: 선택지 B. 입력 방식이 늘어나도 강아지 반응 규칙을 중복하지 않는다.

How to instruct Codex next time:

- "새 입력을 추가할 때 기존 interaction event로 변환하고, reaction system은 건드리지 말아줘."
- "입력 장치 이름이 아니라 게임 의미 기준으로 이벤트 타입을 설계해줘."

Questions to revisit:

- 상호작용 대상이 강아지 외에 NPC, 아이템, 문으로 늘어나면 공통 `InteractionEvent` 타입으로 승격할 것인가?

### LP-003: Presenter는 게임 상태를 시각 표현으로 바꾸는 경계다

Metadata:

- Concepts: `presenter-boundaries`, `rendering-adapter`, `sprite-presentation`
- Related decisions: `PlayerPresenter와 DogPresenter가 sprite 생성과 표시 변경을 담당한다`
- Transfer from frontend: `view adapter`, `presentational component`
- Confidence: `stable`
- Future index candidate: `presenter-boundaries`

Why it matters:
게임 규칙 코드가 sprite tint, display size, angle 같은 표현 세부사항을 직접 만지면 규칙과 렌더링이 강하게 결합된다. 그러면 나중에 SVG 토큰을 애니메이션 sprite sheet로 바꾸거나, 강아지 반응 표현을 교체할 때 규칙 코드까지 흔들린다.

Core idea:
Presenter는 상태나 이벤트를 받아 화면 표현으로 변환한다. 규칙을 판단하지 않고, 받은 결과를 어떻게 보여줄지 담당한다.

In this project:
`PlayerPresenter`는 플레이어 토큰 sprite를 만들고 facing direction에 따라 각도를 바꾼다. `DogPresenter`는 강아지 토큰, 반응 tint, ring 표현을 담당한다. `InteractionPromptPresenter`는 상호작용 가능할 때 강아지 주변에 `E` 프롬프트를 보여준다.

Tradeoffs:

- 선택지 A: 시스템 함수가 직접 Phaser sprite를 수정한다.
- 선택지 B: 시스템은 결과만 만들고 presenter가 sprite를 수정한다.
- 현재 선택: 선택지 B. 표현 교체와 테스트가 쉬워진다.

How to instruct Codex next time:

- "규칙 시스템은 화면 객체를 직접 변경하지 말고, presenter 메서드로 표현을 위임해줘."
- "새 시각 효과를 추가할 때 presenter에만 Phaser sprite 조작이 들어가게 해줘."

Questions to revisit:

- presenter가 많아질 때 각 presenter를 Scene이 직접 소유할지, 별도 object registry를 둘지 결정해야 한다.

### LP-004: Game loop 입력 처리는 React render와 다르다

Metadata:

- Concepts: `game-loop-input`, `held-input`, `per-frame-update`
- Related decisions: `방향키는 keydown 한 번이 아니라 매 프레임 isDown 상태를 읽어 velocity를 설정한다`
- Transfer from frontend: `event handler`, `state update loop`
- Confidence: `stable`
- Future index candidate: `game-loop-input`

Why it matters:
프론트엔드 이벤트는 버튼 클릭처럼 한 번 발생하는 액션이 많다. 게임 이동은 키를 누르고 있는 동안 매 프레임 계속 반영돼야 하므로, keydown 이벤트만 처리하면 부드러운 이동이 어렵다.

Core idea:
게임 루프에서는 현재 입력 상태를 매 프레임 읽고, 그 프레임의 velocity나 action을 결정한다. 이동은 held input이고, 상호작용은 one-shot input으로 다르게 다룬다.

In this project:
방향키 이동은 `PlayerKeyboardController.update()`에서 매 프레임 cursor key 상태를 읽어 velocity를 설정한다. 반면 E 상호작용은 `JustDown` 개념으로 한 번만 소비되는 입력으로 설계했다.

Tradeoffs:

- 선택지 A: keydown 이벤트에서 player position을 직접 이동한다.
- 선택지 B: update 루프에서 현재 key state를 읽고 physics velocity를 설정한다.
- 현재 선택: 선택지 B. 부드러운 이동, diagonal normalization, physics collision과 잘 맞는다.

How to instruct Codex next time:

- "이동 입력은 이벤트 콜백에서 position을 직접 바꾸지 말고, update 루프에서 velocity로 처리해줘."
- "누르고 있는 입력과 한 번만 발동하는 입력을 타입이나 메서드에서 구분해줘."

Questions to revisit:

- 모바일 터치 이동이나 게임패드 입력을 추가할 때 같은 movement intent 모델로 통합할 수 있는가?

### LP-005: Physics world bounds와 camera bounds는 같은 개념이 아니다

Metadata:

- Concepts: `physics-world-bounds`, `camera-bounds`, `tilemap-size`
- Related decisions: `Arcade physics world bounds와 camera bounds를 tilemap 픽셀 크기로 맞춘다`
- Transfer from frontend: `viewport vs document size`, `scroll container bounds`
- Confidence: `stable`
- Future index candidate: `physics-world-bounds`

Why it matters:
화면에 보이는 영역과 실제 게임 월드 크기는 다를 수 있다. camera bounds만 설정하면 카메라는 맵 안에서 움직일 수 있지만, physics world bounds가 기본 게임 크기로 남아 있으면 충돌 경계는 다른 크기를 기준으로 동작한다.

Core idea:
Camera bounds는 무엇을 볼 수 있는지의 경계이고, physics world bounds는 물리 오브젝트가 어디까지 움직일 수 있는지의 경계다. 둘 다 같은 tilemap 크기를 따라야 플레이어 이동과 카메라 추적이 자연스럽다.

In this project:
home yard map은 게임 viewport보다 아래로 더 긴 영역이 있었다. `setCollideWorldBounds(true)`만 설정하면 기본 physics bounds 때문에 하단 일부 접근이 막힐 수 있어, `GameScene`에서 `physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)`를 추가했다.

Tradeoffs:

- 선택지 A: camera bounds만 tilemap 크기로 설정한다.
- 선택지 B: camera bounds와 physics world bounds를 모두 tilemap 크기로 설정한다.
- 현재 선택: 선택지 B. 플레이어 이동 제한과 카메라 추적 기준이 일치한다.

How to instruct Codex next time:

- "맵 크기가 viewport와 다르면 camera bounds뿐 아니라 physics world bounds도 tilemap 크기로 맞춰줘."
- "world bounds 관련 변경은 실제 이동 가능한 영역을 브라우저에서 확인해줘."

Questions to revisit:

- 맵 전환이 생기면 physics world bounds를 Scene마다 재설정할지, map runtime 생성 함수에서 일관 처리할지 결정해야 한다.

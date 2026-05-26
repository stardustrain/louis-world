# 강아지 따라오기 설계

작성일: 2026-05-25

## 목적

강아지가 마당에 고정된 오브젝트가 아니라 주인과 함께 움직이는 동반자로
느껴지게 한다.

이번 설계는 전체 강아지 AI가 아니다. 첫 구현 목표는 주인과 강아지 사이가
멀어졌을 때 강아지가 편안한 거리감을 회복하도록 천천히 따라오는 메커니즘이다.
정본 문서의 방향에 맞춰, 따라오기는 불안이나 처벌보다 "함께 있는 안정감"을
보여주는 행동이어야 한다.

## 정본 문맥

`docs/game/vision.md`는 이 게임을 강아지를 효율적으로 관리하는 게임이 아니라,
낯선 별나라에서 강아지와 함께 적응해가는 따뜻한 생활 게임으로 정의한다.

`docs/game/characters.md`는 강아지가 단순한 펫 오브젝트가 아니라 플레이어의
동반자이며, 감정은 이동, 거리감, 반응 속도, 작은 자율 행동으로 표현한다고
정의한다.

이번 설계는 다음 방향을 따른다.

- 강아지는 주인과 적당한 안전거리를 유지하려 한다.
- 따라오기는 빠른 추격이 아니라 조용한 동행감으로 느껴져야 한다.
- 플레이어 이동을 과하게 방해하지 않는다.
- 초기 프로토타입 범위를 키우는 경로 탐색과 복잡한 상태 머신은 만들지 않는다.

## 확정 결정

- 주인과 강아지 거리가 `96px` 이상이면 따라오기 시작한다.
- 주인과 강아지 거리가 `56px` 안쪽이면 멈춘다.
- 강아지 이동 속도는 `90px/s`로 시작한다.
- 주인이 움직이는 중에는 주인의 facing 반대 방향을 목표로 한다.
- 주인이 멈춰 있으면 주인의 정면을 막지 않는 옆쪽 또는 수직 후보 중 강아지와
  가까운 목표를 고른다.
- 목표 offset은 `48px`로 시작한다.
- 이동은 직선 추적이다.
- 경로 탐색은 하지 않는다.
- 강아지는 맵 충돌을 유지한다.
- 강아지가 따라오는 중에는 주인공과 강아지 사이의 물리 충돌을 끈다.
- 강아지가 안정 거리에서 멈추면 주인공과 강아지 사이의 물리 충돌을 다시 켠다.
- 장애물에 막히면 우회, 재배치, 텔레포트 없이 계속 목표 방향 이동을 시도한다.

## 하지 않을 것

- A\* 또는 타일 기반 경로 탐색을 만들지 않는다.
- 막힘 감지와 자동 재배치를 만들지 않는다.
- 호출 입력을 만들지 않는다.
- 강아지 mood에 따라 속도를 바꾸지 않는다.
- 최종 강아지 애니메이션 상태 머신을 만들지 않는다.
- 밥 주기, 공놀이, 하루 루프와 통합하지 않는다.
- 게임 정본 문서의 세계관이나 캐릭터 방향을 바꾸지 않는다.

## 아키텍처

새 시스템은 `apps/game/src/game/systems/dogFollow/` 아래에 둔다.

```text
apps/game/src/game/systems/dogFollow/
  dogFollow.ts
  dogFollow.test.ts
```

`dogFollow.ts`는 Phaser에 의존하지 않는 순수 로직 모듈이다. 기존
`playerMovement`, `dogInteraction`, `dogReaction`처럼 런타임 Scene과 분리한다.

역할은 세 부분으로 나눈다.

```text
DogFollow
-> 위치, facing, player velocity, 이전 follow 상태로 따라오기 intent를 계산한다.

DogPresenter
-> follow intent를 Phaser sprite velocity에 적용한다.

GameScene
-> player, dog, collider, presenter를 조립하고 매 프레임 데이터를 전달한다.
```

`GameScene`은 조립자 역할을 유지한다. 거리 계산, 목표 위치 선택, 속도 계산,
충돌 on/off 결정은 `DogFollow`가 담당한다.

## 순수 로직 계약

`DogFollow`는 작은 상태를 가진다. 히스테리시스를 구현하려면 이전 프레임의
상태가 필요하기 때문이다.

예상 계약은 다음과 같다.

```ts
type DogFollowMode = "following" | "settled";

type DogFollowState = {
  readonly mode: DogFollowMode;
};

type DogFollowPoint = {
  readonly x: number;
  readonly y: number;
};

type DogFollowInput = {
  readonly dogPosition: DogFollowPoint;
  readonly playerFacing: FacingDirection;
  readonly playerPosition: DogFollowPoint;
  readonly playerVelocity: MovementVector;
  readonly previousState: DogFollowState;
};

type DogFollowIntent = {
  readonly mode: DogFollowMode;
  readonly shouldCollideWithPlayer: boolean;
  readonly targetPosition: DogFollowPoint;
  readonly velocity: MovementVector;
};
```

초기 상태는 `{ mode: "settled" }`이다. `GameScene`은 현재 follow 상태를 필드로
보관하고, 매 프레임 `DogFollowIntent.mode`를 다음 프레임의
`previousState.mode`로 저장한다.

`DogFollowPoint`는 이 모듈 안에 둔다. 이미 `dogInteraction`에 `WorldPoint`가
있지만, 따라오기 로직이 쓰다듬기 모듈에 의존하지 않게 하기 위해 작은 위치 타입은
중복 정의한다. 나중에 여러 시스템에서 같은 타입 반복이 늘어나면 별도 공간 타입을
추출할 수 있다.

## 상태 전환 규칙

상태 전환은 주인과 강아지 중심 거리 기준으로 판단한다.

```text
follow start distance: 96px
settle stop distance: 56px
follow speed: 90px/s
target offset: 48px
```

규칙은 다음과 같다.

```text
previous settled + player distance >= 96px
-> following

previous following + player distance <= 56px
-> settled

previous following + player distance > 56px
-> following 유지

previous settled + player distance < 96px
-> settled 유지
```

시작 거리와 정지 거리를 분리해서 경계 근처에서 따라오기와 정지가 빠르게
반복되는 현상을 줄인다.

`following`이면 목표 방향으로 크기 `90px/s`의 velocity를 만든다. 목표점과
강아지 위치가 같거나 매우 가까우면 NaN이 나오지 않도록 zero velocity를 반환한다.

`settled`이면 velocity는 `{ x: 0, y: 0 }`이다.

## 목표 위치 선택

주인이 움직이는 중이면 주인의 facing 반대 방향을 목표로 한다.

```text
player facing up    -> player 아래쪽 48px
player facing down  -> player 위쪽 48px
player facing left  -> player 오른쪽 48px
player facing right -> player 왼쪽 48px
```

주인이 멈춰 있으면 정면을 막지 않는 후보 중 강아지와 가까운 쪽을 고른다.

```text
player facing up/down
-> player 왼쪽 48px 또는 오른쪽 48px 중 가까운 후보

player facing left/right
-> player 위쪽 48px 또는 아래쪽 48px 중 가까운 후보
```

단, 강아지가 이미 주인 중심 `56px` 안쪽에 있으면 자리 재배치를 위해 다시 움직이지
않는다. 첫 버전의 우선순위는 정확한 자리 잡기가 아니라 편안한 거리 회복이다.

## Phaser 연결

`GameScene.update()`의 흐름은 다음처럼 확장한다.

```text
1. PlayerKeyboardController가 player velocity와 facing을 갱신한다.
2. player position, player velocity, player facing을 읽는다.
3. DogPresenter에서 dog position을 읽는다.
4. resolveDogFollowIntent(...)를 호출한다.
5. DogPresenter.applyFollowIntent(...)로 dog velocity를 적용한다.
6. player-vs-dog collider active 값을 intent.shouldCollideWithPlayer로 갱신한다.
7. 기존 키보드 쓰다듬기 가능 여부와 반응 흐름을 실행한다.
```

`DogPresenter`에 추가할 API는 작게 유지한다.

```ts
applyFollowIntent(intent: DogFollowIntent): void
```

이 메서드는 follow intent의 velocity를 sprite에 적용한다.

```text
sprite.setVelocity(intent.velocity.x, intent.velocity.y)
```

목표 위치 계산이나 충돌 정책 판단은 `DogPresenter`에 넣지 않는다.

## 충돌 정책

강아지는 맵 충돌을 유지한다.

```text
physics.add.collider(dogSprite, collisionBlockout)
```

주인공과 강아지 사이의 collider는 `GameScene` 필드에 저장한다.

```text
private playerDogCollider: Phaser.Physics.Arcade.Collider | undefined;
```

매 프레임 follow intent에 따라 active 값을 갱신한다.

```text
following -> playerDogCollider.active = false
settled   -> playerDogCollider.active = true
```

강아지 body 설정은 다음 방향으로 조정한다.

- gravity 없음 유지
- body size `18x18` 유지
- `setCollideWorldBounds(true)` 추가
- 강아지가 이동할 수 있도록 기존 `setImmovable(true)` 호출은 제거한다.
- `setPushable(false)`는 유지해서 충돌이 켜졌을 때 주인공이 강아지를 밀어내지
  못하게 한다.

collider를 다시 켜는 순간 두 sprite가 겹쳐 있을 가능성이 있다. 첫 버전에서는
`56px` 정지 거리 때문에 겹침이 크게 줄어든다고 본다. 실제 플레이에서 겹침이나
밀림이 자주 보이면 후속 작업으로 "collider 재활성화 전 최소 거리 확인"을 추가한다.

## 장애물 처리

이 설계는 직선 추적이다. 강아지는 목표 위치를 향해 계속 velocity를 받지만, 맵
충돌 레이어에 막히면 Phaser 물리에 의해 멈추거나 미끄러진다.

다음 동작은 이번 범위에 넣지 않는다.

- 막힘 감지
- x축/y축 우회
- 타일 grid 경로 탐색
- 너무 멀어졌을 때 주인 근처로 재배치
- 막힘 전용 강아지 반응

이 제한은 첫 프로토타입의 의도적인 범위 축소다. 맵이 작고 첫 플레이 공간이
단순한 동안은 "강아지가 따라오려 한다"는 감각을 먼저 검증한다.

## 기존 상호작용과의 관계

기존 쓰다듬기 흐름은 유지한다.

```text
getPetInteractionEvent(...)
-> createDogReactionRequest(...)
-> applyDogMoodDelta(...)
-> DogPresenter.presentReaction(...)
```

강아지가 움직이면서 `dogPosition`이 변하므로, 키보드 쓰다듬기 가능 여부는 매
프레임 최신 강아지 위치를 사용한다. 따라오기 시스템은 쓰다듬기 이벤트를 만들지
않고, 쓰다듬기 시스템은 따라오기 목표를 바꾸지 않는다.

## 테스트

자동 테스트는 `dogFollow` 순수 로직을 중심으로 작성한다.

- 주인과 강아지가 `96px` 이상 멀면 `following` intent를 만든다.
- 강아지가 `56px` 안쪽에 있으면 `settled` intent와 zero velocity를 만든다.
- 이전 상태가 `following`이면 `56px`보다 멀 때 계속 following을 유지한다.
- 이전 상태가 `settled`이면 `96px`보다 가까울 때 settled를 유지한다.
- `following` velocity의 크기는 `90px/s`다.
- 주인이 움직이는 중에는 facing 반대 방향 목표점을 선택한다.
- 주인이 멈춰 있으면 정면을 막지 않는 후보 중 가까운 목표점을 선택한다.
- `following`일 때 `shouldCollideWithPlayer`는 `false`다.
- `settled`일 때 `shouldCollideWithPlayer`는 `true`다.
- 목표점과 강아지 위치가 같거나 매우 가까울 때 NaN velocity를 만들지 않는다.

수동 검증은 게임 실행 후 다음을 확인한다.

```text
1. 주인공이 강아지에게서 멀어지면 강아지가 천천히 따라온다.
2. 강아지는 주인공보다 조금 느리게 움직인다.
3. 따라오는 중에는 주인공 이동을 막지 않는다.
4. 멈춘 뒤에는 주인공이 강아지를 통과하지 못한다.
5. 집, 닫힌 길, 맵 경계를 통과하지 않는다.
6. 장애물에 막히면 우회하지 않고 막힌 상태로 남는다.
7. 기존 쓰다듬기 입력과 반응이 깨지지 않는다.
```

구현 단계의 기본 검증 명령은 다음이다.

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game typecheck
pnpm --filter @louis-world/game build
```

## 성공 기준

- 강아지가 멀어진 주인을 향해 부드럽게 따라온다.
- 따라오기와 정지 상태가 거리 경계에서 빠르게 흔들리지 않는다.
- 주인공 이동 중 강아지가 플레이어를 과하게 막지 않는다.
- 강아지는 멈춘 뒤 다시 물리적으로 존재하는 대상으로 남는다.
- 맵 충돌은 유지된다.
- 기존 쓰다듬기 상호작용과 반응이 유지된다.
- 따라오기 수치와 목표 선택 규칙은 Phaser 없이 테스트할 수 있다.

## 향후 확장

첫 버전이 안정되면 다음을 별도 설계로 검토할 수 있다.

- 막힘 감지 후 작은 반응 표시
- 간단한 x축/y축 우회
- 강아지 mood에 따른 따라오기 반응 속도 변화
- 호출 입력
- 밥 주기나 공놀이 이후 주인에게 먼저 다가오는 행동
- 실제 강아지 애니메이션과 걸음 방향 표현

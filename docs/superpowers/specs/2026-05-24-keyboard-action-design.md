# 키보드 액션 설계

작성일: 2026-05-24

## 목적

게임 프로토타입에 첫 키보드 기반 플레이 흐름을 추가한다.

플레이어는 방향키로 주인공을 움직이고, 강아지에게 다가가 강아지를 바라본
상태에서 `E` 키를 눌러 현재 클릭으로 구현된 쓰다듬기 반응을 실행할 수 있어야
한다.

이번 작업은 전체 조작 시스템, 강아지 AI, 최종 캐릭터 아트 작업이 아니다.
목표는 기존 강아지 반응이 맵 위의 주인공 위치와 연결되어 느껴지는 작은
플레이어블 레이어를 만드는 것이다.

## 정본 문맥

`docs/game/`은 이 게임을 낯설지만 안전한 별나라에서 주인공과 강아지가 함께
적응하는 따뜻한 생활 게임으로 정의한다. 쓰다듬기는 강아지의 안정감을 회복하는
정서적 핵심 상호작용이다.

이번 설계는 다음 방향을 따른다.

- 쓰다듬기는 추상 명령이 아니라, 강아지에게 다가가 돌보는 행동처럼 느껴져야
  한다.
- 강아지는 살아있는 동반자이므로 주인공이 강아지를 통과하면 안 된다.
- 키보드 상호작용은 첫날 플레이 흐름을 돕되, 강아지 따라오기, 밥 주기,
  공놀이, 하루 루프 같은 더 큰 시스템을 같이 추가하지 않는다.
- 현재 홈 마당 맵의 타일 크기는 바꾸지 않는다. 주인공과 강아지 임시 토큰의
  표현 크기만 작은 캐릭터 토큰에 맞춘다.

## 조사 메모

설계는 커스텀 입력/충돌 시스템을 만들지 않고 Phaser의 기본 기능을 사용한다.

- Phaser 공식 키보드 문서는 누르고 있는 방향키 입력에 `createCursorKeys()`를
  사용하고, 한 번만 발동하는 키 입력에 `Phaser.Input.Keyboard.JustDown()`을
  사용하는 흐름을 제공한다.
- Phaser Arcade Physics는 속도 기반 탑다운 이동, `setCollideWorldBounds()`,
  지속적인 `collider(...)` 검사를 지원한다.
- Phaser Tilemap 충돌은 충돌 속성이 설정된 `TilemapLayer`와 sprite 사이에
  collider를 거는 방식이 적합하다.
- Phaser Loader는 `load.svg(key, url, { width, height })`를 지원하며, SVG를
  일반 텍스처 키로 사용할 수 있는 비트맵으로 래스터화한다.
- Phaser 카메라는 `setBounds(...)`와 `startFollow(...)`를 지원한다. 현재 홈 마당
  맵이 게임 뷰포트보다 세로로 조금 더 크기 때문에 이 흐름과 잘 맞는다.

참고 문서:

- https://docs.phaser.io/api-documentation/class/input-keyboard-keyboardplugin
- https://docs.phaser.io/api-documentation/namespace/input-keyboard
- https://docs.phaser.io/phaser/concepts/physics/arcade
- https://docs.phaser.io/phaser/concepts/loader
- https://docs.phaser.io/phaser/concepts/cameras

## 확정 결정

- 이동은 우선 방향키만 지원한다. `WASD`는 범위 밖이다.
- 이동은 키를 누르고 있는 동안 부드럽게 계속되고, 키를 떼면 멈춘다.
- 주인공은 맵의 `collision_blockout` 레이어와 충돌한다.
- 주인공은 강아지와 충돌하며 강아지를 통과할 수 없다.
- 강아지는 이번 범위에서 스폰 위치에 정지한다.
- `E` 키 쓰다듬기는 주인공이 강아지 가까이에 있고 강아지를 바라볼 때만
  발동한다.
- `E` 키는 한 번 누를 때 한 번만 발동한다. 누르고 있어도 반복 발동하지 않는다.
- 기존 포인터/클릭 쓰다듬기는 유지한다.
- 키보드 쓰다듬기가 가능한 상태에서만 작은 `E` 키캡 힌트를 보여준다.
- 카메라는 맵 경계 안에서 주인공을 따라간다.
- 맵 타일 크기는 현재 값인 `32px`을 유지한다.
- 주인공과 강아지는 화면에서 약 `24x24px` 크기의 작은 SVG 토큰 sprite로
  표현한다.

## 하지 않을 것

- 홈 마당 타일 크기나 타일맵 크기를 변경하지 않는다.
- `WASD`를 지원하지 않는다.
- 모바일 가상 조작 UI를 만들지 않는다.
- 강아지 따라오기 행동을 만들지 않는다.
- 주인공 애니메이션 시트를 만들지 않는다.
- 현재 쓰다듬기 반응 경로를 넘어서는 새 강아지 mood 상태를 추가하지 않는다.
- 밥 주기, 공놀이, 문 전환, 하루 루프, 퀘스트 상호작용을 추가하지 않는다.
- 주인공과 강아지의 최종 아트 방향을 확정하지 않는다.

## 아키텍처

`GameScene`은 조립자 역할을 유지한다. 맵을 만들고, 런타임 객체를 만들고,
컨트롤러와 프레젠터를 연결하고, 물리 collider를 등록하고, 매 프레임 필요한
호출을 위임한다.

새로 만들거나 조정할 단위는 다음과 같다.

```text
PreloaderScene
-> 공유 맵 에셋과 SVG 토큰 에셋을 로드한다.

PlayerPresenter
-> 주인공 physics sprite를 만들고 소유한다.
-> 컨트롤러, 카메라, collider가 사용할 sprite/body를 노출한다.

DogPresenter
-> 강아지 physics sprite를 만들고 소유한다.
-> 클릭 가능한 강아지 객체를 노출한다.
-> 기존 presentReaction(request) API를 유지한다.
-> 강아지 반응 요청을 토큰 tint, scale, 별빛 파티클로 표현한다.

PlayerKeyboardController
-> 방향키와 E 키를 소유한다.
-> 누르고 있는 방향키에서 이동 velocity를 계산한다.
-> 마지막 바라보는 방향을 기록한다.
-> E 키가 이번 프레임에 막 눌렸는지 알려준다.

PetInteraction
-> Phaser를 모르는 순수 로직 모듈이다.
-> 포인터 입력 또는 키보드 입력을 DogInteractionEvent로 변환한다.
-> 주인공 앞쪽 상호작용 영역을 계산한다.
-> 강아지 중심이 그 영역 안에 있는지 검사한다.

InteractionPromptPresenter
-> 강아지 근처의 작은 E 키캡 힌트를 표시하거나 숨긴다.
```

이 구조는 Phaser 렌더링/물리 책임을 프레젠터와 컨트롤러 안에 두고,
상호작용 가능 여부는 Phaser Scene 없이 테스트할 수 있게 만든다.

## 런타임 흐름

```text
PreloaderScene.preload()
-> 홈 마당 타일맵과 타일셋을 로드한다.
-> player-token.svg와 dog-token.svg를 로드한다.

GameScene.create()
-> 홈 마당 맵을 만든다.
-> player_spawn 위치에 PlayerPresenter를 만든다.
-> dog_spawn 위치에 DogPresenter를 만든다.
-> PlayerKeyboardController를 만든다.
-> InteractionPromptPresenter를 만든다.
-> player와 collision_blockout 사이 collider를 등록한다.
-> player와 dog 사이 collider를 등록한다.
-> 강아지 pointerdown 상호작용을 등록한다.
-> 카메라 bounds를 맵 크기로 설정한다.
-> 카메라가 player sprite를 따라가게 한다.

GameScene.update()
-> PlayerKeyboardController가 player velocity와 바라보는 방향을 갱신한다.
-> PetInteraction이 키보드 쓰다듬기 가능 여부를 계산한다.
-> InteractionPromptPresenter가 E 키캡 표시 여부를 갱신한다.
-> E 키가 막 눌렸고 쓰다듬기가 가능하면 쓰다듬기 반응을 실행한다.
```

포인터 쓰다듬기와 키보드 쓰다듬기는 같은 scene helper를 호출해야 한다.

```text
runPetInteraction(event)
-> createDogReactionRequest(event, dogMood)
-> applyDogMoodDelta(...)
-> dogPresenter.presentReaction(...)
```

이렇게 해야 클릭 경로와 키보드 경로의 반응이 서로 달라지지 않는다.

## 에셋

다음 SVG 파일 두 개를 `apps/game/public/assets/images/` 아래에 추가한다.

```text
player-token.svg
dog-token.svg
```

`PreloaderScene`에서는 objects 영역이 소유하는 작은 헬퍼로 로드한다. 예를 들면
`preloadCharacterTokenAssets(...)`를 만들고, 이 헬퍼가 텍스처 키도 함께
소유한다.

```text
player-token
dog-token
```

각 SVG는 `24x24px` 렌더 크기에 맞는 작은 원형 토큰 실루엣을 가진다. 주인공과
강아지는 서로 다른 색을 사용한다. 주인공 토큰은 위쪽에 작은 표시를 넣고,
`PlayerPresenter`가 현재 바라보는 방향에 맞춰 토큰을 회전시킨다.

현재 `DogPresenter`의 큰 타원과 얼굴 텍스트는 강아지 SVG 토큰으로 교체한다.
강아지 반응 계약은 그대로 유지한다.

## 주인공 이동

첫 이동 구현은 Arcade Physics의 velocity 기반 이동으로 한다.

규칙은 다음과 같다.

- `left`, `right`, `up`, `down`을 매 프레임 읽는다.
- 아무 방향도 누르지 않으면 velocity는 `(0, 0)`이다.
- 한 방향을 누르면 `120px/s`로 이동한다.
- 대각선 입력은 허용하지만, 벡터를 정규화해서 대각선 이동이 더 빨라지지 않게
  한다.
- 0이 아닌 이동 입력이 있으면 마지막 바라보는 방향을 갱신한다.
- 바라보는 방향은 `up`, `down`, `left`, `right` 중 하나다.
- 대각선 이동 중에는 이전 바라보는 방향이 현재 누른 축 중 하나라면 그 방향을
  유지한다. 그렇지 않으면 가로 방향이 세로 방향보다 우선한다. 이렇게 하면 별도
  애니메이션 시스템 없이도 대각선 방향 처리가 결정적이다.

주인공 sprite는 다음 조건을 만족한다.

- `player-token` 텍스처를 사용한다.
- 화면에서 약 `24x24px`로 보인다.
- 토큰 중심에 Arcade dynamic body를 둔다.
- blockout 충돌에서 과하게 걸리지 않도록 body는 `18x18px`로 잡는다.
- `setCollideWorldBounds(true)`를 사용한다.

## 강아지 객체

강아지 sprite는 다음 조건을 만족한다.

- `dog-token` 텍스처를 사용한다.
- 화면에서 약 `24x24px`로 보인다.
- 토큰 중심에 Arcade body를 둔다.
- body는 `18x18px`로 잡는다.
- dynamic Arcade body를 사용하되 움직이지 않고 `immovable`로 둔다. 이렇게 하면
  시각 scale tween을 단순하게 유지하면서도 주인공을 막을 수 있다.
- 포인터/클릭 쓰다듬기를 위해 interactive 상태를 유지한다.
- player-vs-dog collider를 통해 주인공을 막는다.

`DogPresenter.presentReaction(request)`는 기존 `DogReactionRequest`를 계속
해석한다.

현재 `starlight_bloom` 반응은 다음처럼 표현한다.

- 강아지 토큰에 부드러운 tint 또는 밝기 변화를 준다.
- scale을 살짝 키웠다가 되돌리는 tween을 실행한다.
- 토큰 주변에 작은 별빛 파티클을 낸다.

`effect: "none"`이면 파티클은 내지 않는다.

## 키보드 쓰다듬기

키보드 쓰다듬기는 다음 세 조건이 모두 맞아야 한다.

```text
1. E 키가 이번 프레임에 막 눌렸다.
2. 주인공에게 바라보는 방향이 있다.
3. 강아지 중심이 주인공 앞쪽 24x24 상호작용 영역 안에 있다.
```

상호작용 영역은 현재 바라보는 방향의 주인공 토큰 옆에 붙은 `24x24px`
직사각형이다.

주인공 중심이 `(x, y)`일 때 영역은 다음과 같다.

```text
right: x + 12, y - 12, 24, 24
left:  x - 36, y - 12, 24, 24
down:  x - 12, y + 12, 24, 24
up:    x - 12, y - 36, 24, 24
```

강아지 중심점이 이 직사각형 안에 있으면 쓰다듬기가 가능하다.

이 방식은 중심 거리 `18px` 판정보다 덜 답답하면서도, 강아지 앞에 서서
상호작용한다는 감각을 유지한다.

## 포인터 쓰다듬기

기존 포인터/클릭 쓰다듬기는 유지한다.

이번 범위에서 포인터 입력은 주인공 거리나 바라보는 방향을 요구하지 않는다.
프로토타입 접근성과 빠른 확인을 위한 경로로 남긴다.

포인터 경로와 키보드 경로는 모두 같은 이벤트를 만든다.

```ts
{
  type: "pet_started";
}
```

## 상호작용 힌트

힌트는 시각 표현만 담당하고 상호작용 로직을 소유하지 않는다.

규칙은 다음과 같다.

- 키보드 쓰다듬기가 현재 가능한 상태에서만 작은 `E` 키캡을 보여준다.
- 가능하지 않으면 숨긴다.
- 위치는 강아지 토큰 근처이며, 중심 좌표는 `(dog.x, dog.y - 24)`로 둔다.
- 캐릭터보다 높은 depth에 둔다.
- 설명형 튜토리얼 문장은 보여주지 않는다.

이 방식은 화면을 조용하게 유지하면서, 초반 플레이어가 `E` 상호작용을 발견할 수
있게 한다.

## 카메라

`createHomeYardMap`은 이미 카메라 bounds를 맵 크기로 설정한다. 키보드 액션
구현은 이 bounds를 유지하고, `GameScene`에서 주인공 follow 동작을 추가한다.

follow 대상은 player sprite다.

```text
camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
camera.startFollow(playerSprite, true, 0.12, 0.12)
```

첫 구현에서는 위 값을 사용한다. 카메라는 맵 bounds 밖을 보여주면 안 된다.

## 에러 처리와 fallback

주인공과 강아지를 표현하려면 SVG 토큰 텍스처가 필요하므로, 필수 텍스처가
로드되지 않았으면 시작 시 명확히 실패해야 한다.

테스트 환경이나 특수 런타임에서 키보드 입력을 사용할 수 없더라도, 포인터
쓰다듬기는 계속 사용할 수 있어야 한다.

알 수 없는 강아지 반응 요청이 `DogPresenter`에 도착하면 기존 안전한 표현
방식처럼 처리한다. 런타임 오류를 던지지 않고, 지원하지 않는 effect는 표시하지
않는다.

## 테스트

자동 테스트는 순수 로직을 우선한다.

`PetInteraction` 테스트를 추가하거나 확장한다.

- 강아지 위에서 pointer down이 발생하면 `pet_started`를 반환한다.
- 포인터 입력 대상이 강아지가 아니면 `null`을 반환한다.
- 강아지 중심이 주인공 앞쪽 상호작용 영역 안에 있고 `E`가 눌렸으면
  `pet_started`를 반환한다.
- 강아지가 상호작용 영역 밖에 있으면 `null`을 반환한다.
- `E`가 막 눌린 상태가 아니면 `null`을 반환한다.
- 각 바라보는 방향이 예상한 `24x24px` 상호작용 영역을 만든다.

`PlayerKeyboardController`의 이동 의도 계산은 순수 helper로 분리하고 따로
테스트한다.

- 아무 키도 누르지 않으면 zero velocity를 반환한다.
- 한 방향 입력은 `120px/s` 벡터를 반환한다.
- 대각선 입력은 같은 속도로 정규화된다.
- 0이 아닌 입력은 바라보는 방향을 결정적으로 갱신한다.

Phaser 렌더링과 충돌은 현재 테스트 스택보다 브라우저 수동 검증에 더 잘 맞는다.

수동 확인 항목은 다음과 같다.

- 방향키를 누르고 있는 동안 주인공이 움직인다.
- 방향키를 떼면 주인공이 멈춘다.
- 대각선 이동이 한 방향 이동보다 빠르지 않다.
- 주인공이 맵 bounds 밖으로 나가지 못한다.
- 주인공이 `collision_blockout` 레이어를 통과하지 못한다.
- 주인공이 강아지를 통과하지 못한다.
- 카메라가 주인공을 따라가며 맵 밖을 보여주지 않는다.
- 주인공이 올바른 근거리 위치에서 강아지를 바라볼 때만 `E` 힌트가 보인다.
- `E`를 한 번 누르면 쓰다듬기 반응이 한 번 실행된다.
- `E`를 누르고 있어도 반응이 반복 실행되지 않는다.
- 강아지를 클릭해도 기존처럼 쓰다듬기 반응이 실행된다.
- 강아지 반응은 새 작은 SVG 토큰에서 tint/scale 변화와 별빛 feedback으로
  보인다.

## 성공 기준

- 첫 키보드 조작 흐름을 방향키와 `E`만으로 플레이할 수 있다.
- 기존 강아지 반응을 클릭과 키보드 양쪽에서 실행할 수 있다.
- 키보드 쓰다듬기는 강아지를 바라봐야 하므로 의도적인 행동처럼 느껴진다.
- 주인공과 강아지는 현재 맵 스케일에 맞는 작은 토큰 sprite로 보인다.
- `GameScene`은 큰 동작 컨테이너가 아니라 얇은 조립 레이어로 유지된다.
- 상호작용 가능 여부는 Phaser 렌더링 없이 테스트할 수 있다.
- 이후 상호작용은 앞쪽 영역 판정과 프레젠터/컨트롤러 경계를 재사용해 확장할 수
  있다.

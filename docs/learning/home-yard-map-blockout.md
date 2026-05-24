# 집과 마당 맵 Blockout 학습 노트

대상 독자: 프론트엔드 개발 경험은 충분하지만, Phaser/Tiled 기반 2D 게임 개발은
처음인 개발자.

관련 설계:
`docs/superpowers/specs/2026-05-24-home-yard-map-blockout-design.md`

## 이 문서의 목적

이번 설계에서 꼭 알고 넘어가야 할 개념을 정리한다. 목표는 게임 개발 용어와
판단 기준을 익혀서, 다음 작업에서 더 짧고 명확하게 지시할 수 있게 만드는 것이다.

프론트엔드에 비유하면 이번 작업은 화면 컴포넌트를 구현한 것이 아니라, 디자인
시스템의 spacing scale과 페이지 레이아웃 grid를 먼저 정한 것에 가깝다.

## 핵심 요약

- 타일맵은 UI 레이아웃이 아니라 월드 데이터다.
- `40 x 24`와 `32px`는 맵의 논리 좌표계와 픽셀 좌표계를 연결하는 기준이다.
- Tiled의 Tile Layer는 격자에 맞는 지형과 시각 요소를 담는다.
- Tiled의 Object Layer는 스폰, 문, 트리거처럼 게임 로직이 읽을 마커를 담는다.
- Phaser Scene은 React 컴포넌트보다 수명이 길고, 매 프레임 갱신되는 런타임
  객체를 소유한다.
- 충돌은 보이는 그림과 같은 것이 아니다. 보이는 레이어와 충돌 레이어를 분리해야
  나중에 움직임과 디버깅이 쉬워진다.
- 브라우저 확인은 아트 품질보다 좌표, 카메라, 정렬, 충돌 의도 확인을 위한 단계다.

## 1. 타일 좌표와 픽셀 좌표

이번 맵은 `40 x 24` 타일이고, 타일 하나는 `32px`이다.

```text
tileX 19, tileY 11
-> pixelX 19 * 32 = 608
-> pixelY 11 * 32 = 352
```

Tiled와 Phaser의 기본 좌표계는 웹 캔버스와 비슷하다. 왼쪽 위가 원점이고,
오른쪽으로 `x`, 아래쪽으로 `y`가 증가한다.

프론트엔드와 다른 점은 `px`만으로 배치하지 않는다는 것이다. 게임 맵에서는
`tile coordinate`가 먼저 있고, 렌더링과 물리 계산을 위해 픽셀 좌표로 변환한다.

앞으로 지시할 때 유용한 표현:

```text
집 footprint를 x 15~24, y 4~10 타일에 둬.
문은 2타일 폭으로 x 19~20, y 10에 둬.
스폰 마커는 타일 좌표로 관리하고 픽셀 변환은 로더 쪽에서 하자.
```

## 2. 왜 맵 크기를 `40 x 24`로 잡았는가

현재 게임 논리 해상도는 `1280 x 720`이다. `32px` 타일 기준으로 `40`칸은
정확히 `1280px`이다.

```text
40 tiles * 32px = 1280px
24 tiles * 32px = 768px
```

가로는 화면에 딱 맞고, 세로는 `48px` 더 크다. 이 차이는 실수라기보다 여유다.
나중에 카메라를 살짝 움직이거나, 집 위쪽 공간을 답답하지 않게 만들 수 있다.

트레이드오프:

- `24 x 16`: 배우기 쉽지만 첫 공간이 너무 작아질 수 있다.
- `40 x 24`: 한 화면 중심 설계와 좌표 학습에 적당하다.
- `64 x 36`: 카메라 이동 전제가 강해지고 첫 구현 범위가 커진다.

앞으로 지시할 때 유용한 표현:

```text
이번은 한 화면에 가까운 40 x 24 blockout으로 유지하자.
카메라 스크롤 전제 맵은 다음 설계로 분리하자.
```

## 3. Blockout은 최종 맵이 아니다

Blockout은 회색 박스 와이어프레임 같은 단계다. 아트가 없어도 공간의 크기,
관계, 이동 가능 영역, 카메라 감각을 검증한다.

이번 설계의 `house_blockout`은 예쁜 집 그림이 아니라 “여기가 집 자리”라는
좌표 약속이다. 실제 타일셋을 받은 뒤에는 이 레이어를 실제 집 레이어로 교체하거나,
별도의 `house_visual` 레이어를 추가할 수 있다.

좋은 blockout 질문:

```text
문에서 마당까지 내려오는 경로가 자연스러운가?
집이 중앙보다 살짝 위에 있어서 앞마당 공간이 충분한가?
강아지 시작 위치가 너무 멀리 떨어져 보이지 않는가?
닫힌 길이 다음 공간의 힌트로 읽히는가?
```

피해야 할 질문:

```text
지금 풀이 예쁜가?
집 타일셋 색이 최종 톤과 맞는가?
별나무 장식이 충분히 귀여운가?
```

이런 질문은 실제 에셋을 넣은 뒤에 다루는 편이 좋다.

## 4. Tile Layer와 Object Layer의 차이

Tiled에는 여러 레이어가 있지만, 이번 단계에서 중요한 것은 두 가지다.

```text
Tile Layer
- 격자에 맞는 타일 데이터를 담는다.
- 바닥, 길, 집 footprint, 장식, 충돌 blockout에 적합하다.
```

```text
Object Layer
- 픽셀 좌표 기반 오브젝트나 마커를 담는다.
- player_spawn, dog_spawn, house_door, locked_path에 적합하다.
```

프론트엔드에 비유하면 Tile Layer는 CSS Grid의 셀을 채우는 데이터에 가깝고,
Object Layer는 DOM data attribute나 CMS entry처럼 런타임이 읽는 의미 있는
메타데이터에 가깝다.

중요한 결정은 “보여야 하는가, 게임 로직이 읽어야 하는가”이다.

```text
마당 바닥 -> Tile Layer
집 그림 -> Tile Layer
플레이어 시작점 -> Object Layer
문 상호작용 영역 -> Object Layer
막힌 길의 보이는 표식 -> Tile Layer
막힌 길의 실제 충돌 영역 -> collision_blockout Tile Layer
```

앞으로 지시할 때 유용한 표현:

```text
스폰과 문은 Object Layer 마커로 두고, 시각 타일과 분리하자.
보이는 잠긴 길 타일과 실제 막힘은 별도 레이어로 두자.
```

## 5. 왜 레이어를 나누는가

한 레이어에 모든 것을 넣으면 처음에는 빠르지만, 나중에 다음 문제가 생긴다.

- 집 그림을 바꿨는데 충돌도 같이 깨진다.
- 장식 타일을 추가했는데 캐릭터가 지나가지 못한다.
- 스폰 위치를 찾기 위해 타일 인덱스를 하드코딩해야 한다.
- 디버그 때 어떤 타일이 막는지 보기 어렵다.

이번 설계는 역할별로 나눴다.

```text
ground_base
- 전체 기본 바닥

yard_and_path
- 마당과 중앙 길

house_blockout
- 집이 차지하는 자리

decor_soft_boundary
- 분위기와 자연 경계

collision_blockout
- 실제로 못 지나가는 영역

gameplay_markers
- 스폰, 문, 닫힌 길 같은 로직 마커
```

프론트엔드에서 presentation component와 domain state를 섞지 않는 것과 같은
이유다. 게임에서는 보이는 것, 부딪히는 것, 의미를 가진 것이 서로 다를 수 있다.

## 6. 충돌은 렌더링과 별개다

게임 개발 초기에 가장 헷갈리기 쉬운 점이다. 플레이어가 벽을 통과하지 못하는 것은
벽 이미지가 있어서가 아니라, 물리 시스템이 충돌 데이터를 알고 있기 때문이다.

예를 들어 집 타일이 보여도 충돌이 없으면 플레이어는 집 위를 걸어갈 수 있다.
반대로 아무것도 보이지 않아도 `collision_blockout`에 막힘이 있으면 지나갈 수
없다.

따라서 처음에는 충돌 레이어를 보이게 두거나 debug 모드에서만 보이게 하는 것이
좋다. 시각적으로 “왜 못 지나가지?”를 빠르게 확인할 수 있다.

앞으로 지시할 때 유용한 표현:

```text
collision_blockout은 debug에서는 보이고, 일반 플레이에서는 숨기자.
집 벽과 닫힌 길만 충돌 대상으로 잡자.
장식 풀은 일단 충돌 없는 시각 요소로 두자.
```

## 7. Phaser Scene을 React 컴포넌트처럼 생각하면 안 되는 부분

React 컴포넌트는 props/state 변화에 따라 렌더 결과를 다시 계산한다. Phaser Scene은
수명이 있는 런타임 컨테이너에 가깝다.

```text
preload()
- 이 Scene에서 쓸 에셋을 로드 큐에 넣는다.

create()
- 에셋 로드 후 게임 오브젝트와 레이어를 만든다.

update()
- 매 프레임 입력, 이동, AI, 충돌 후처리 등을 갱신한다.
```

현재 프로젝트는 `BootScene -> PreloaderScene -> GameScene` 흐름이다.

- `BootScene`: 아주 초기 준비.
- `PreloaderScene`: 공용 에셋 로딩.
- `GameScene`: 실제 플레이 공간 생성.

이번 맵은 공용 첫 공간이므로 `PreloaderScene`에서 타일맵 JSON과 타일셋 이미지를
로드하고, `GameScene`에서 레이어를 생성하는 방향이 맞다.

앞으로 지시할 때 유용한 표현:

```text
공용 맵 에셋은 PreloaderScene에서 로드하자.
GameScene은 로드된 key로 tilemap과 layer만 생성하게 하자.
Scene 안에 DOM 접근은 넣지 말자.
```

## 8. Phaser의 에셋 key는 import path가 아니다

프론트엔드에서는 이미지를 import하거나 URL을 직접 넘기는 방식이 익숙하다.
Phaser에서는 먼저 Loader에 key와 URL을 등록하고, 이후 key로 에셋을 참조한다.

예상 흐름:

```text
PreloaderScene
- key: home-yard-map
- url: assets/tilemaps/home-yard.json

PreloaderScene
- key: home-yard-tiles
- url: assets/tilesets/home-yard-placeholder.png

GameScene
- this.make.tilemap({ key: "home-yard-map" })
- map.addTilesetImage("tileset name from Tiled", "home-yard-tiles")
```

여기서 주의할 점은 Tiled 안의 tileset 이름과 Phaser texture key가 다르다는 것이다.
`addTilesetImage`는 둘을 연결하는 지점이다.

앞으로 지시할 때 유용한 표현:

```text
Tiled tileset 이름과 Phaser texture key를 상수로 분리하자.
맵 JSON key는 home-yard-map으로 고정하자.
타일셋 이미지 key는 home-yard-tiles로 고정하자.
```

## 9. 데이터 주도 맵과 코드 주도 맵

맵을 만드는 방법은 크게 두 가지다.

```text
데이터 주도
- Tiled에서 JSON으로 맵을 만든다.
- Phaser는 JSON을 읽어 레이어와 마커를 생성한다.
- 디자이너나 기획자가 좌표를 수정하기 쉽다.
```

```text
코드 주도
- TypeScript 배열이나 함수로 맵을 만든다.
- 작은 실험은 빠르다.
- 시각 편집과 협업이 불편해질 수 있다.
```

이번 프로젝트는 나중에 실제 생활 게임 맵으로 확장될 가능성이 있으므로 Tiled
중심 데이터 주도 방식이 낫다. 다만 첫 테스트에서는 placeholder tileset과 작은
좌표 상수를 같이 써도 된다.

트레이드오프:

- Tiled JSON은 에디터 친화적이지만, 파일 구조와 asset key 약속이 필요하다.
- TypeScript 상수는 테스트가 쉽지만, 맵을 눈으로 편집하기 어렵다.

추천 지시:

```text
맵 모양은 Tiled JSON이 source of truth가 되게 하자.
코드에는 key, layer name, object marker name만 상수로 두자.
좌표표는 문서에 남기되, 실제 렌더링은 Tiled JSON을 읽게 하자.
```

## 10. 카메라와 월드는 다르다

프론트엔드에서는 viewport가 곧 화면이고, 대부분 요소가 그 안에 배치된다.
게임에서는 월드가 viewport보다 클 수 있고, 카메라는 월드의 일부를 보여준다.

이번 맵은 `1280 x 768px`이고 화면은 `1280 x 720px`이다. 즉 월드가 화면보다
세로로 조금 크다.

처음에는 카메라를 고정해도 되지만, 다음을 알고 있어야 한다.

- 월드 좌표는 맵 전체 기준이다.
- 화면 좌표는 현재 카메라에 보이는 위치 기준이다.
- 오브젝트가 같은 월드 좌표에 있어도 카메라 위치에 따라 화면 위치는 달라진다.

앞으로 지시할 때 유용한 표현:

```text
이번 단계에서는 카메라를 고정하고 blockout 정렬만 확인하자.
카메라 follow는 플레이어 이동을 붙일 때 별도 단계로 하자.
```

## 11. 테스트 가능한 것과 눈으로 봐야 하는 것

이번 작업에서 자동 테스트와 브라우저 확인의 역할은 다르다.

Vitest로 검증하기 좋은 것:

- 맵 key, tileset key, layer name 상수가 올바른가.
- 좌표 범위가 `40 x 24` 안에 들어오는가.
- `player_spawn`, `dog_spawn` 같은 필수 marker 이름이 정의되어 있는가.

브라우저로 봐야 하는 것:

- 집이 중앙보다 살짝 위에 보이는가.
- 마당이 답답하지 않은가.
- 문과 길이 자연스럽게 이어지는가.
- 강아지 시작 위치가 감정적으로 적절한가.
- 충돌 debug 표시가 의도한 막힘과 일치하는가.

자동 테스트가 모든 것을 대체하지 않는다. 게임에서는 “느낌”과 “공간감”이 실제
품질의 일부라서 브라우저 확인이 필요하다.

## 12. 이번 설계에서 의도적으로 미룬 것

이번 설계는 작게 유지했다. 다음 항목은 일부러 제외했다.

- 집 내부
- 문을 통한 씬 전환
- 플레이어 이동
- 강아지 AI
- 공놀이, 밥주기, 쓰다듬기
- 실제 타일셋과 아트 품질
- 시간대 변화와 조명

이것을 한 번에 넣으면 “맵 좌표가 맞는지”와 “게임플레이가 재밌는지”와 “아트가
좋은지”가 섞여서 디버깅이 어려워진다.

앞으로 지시할 때 유용한 표현:

```text
이번 PR은 맵 로드와 좌표 확인까지만 하자.
이동과 충돌은 다음 PR에서 붙이자.
집 내부는 별도 맵 설계로 분리하자.
```

## 13. 다음에 알면 좋은 단어

```text
tile
- 맵을 구성하는 격자 한 칸.

tileset
- 여러 tile 이미지를 모아둔 이미지와 메타데이터.

tilemap
- 어떤 tile이 어느 좌표에 놓이는지 기록한 맵 데이터.

layer
- 같은 목적의 tile 또는 object를 모아둔 층.

object layer
- 스폰, 트리거, 문 같은 자유 배치 마커를 담는 레이어.

collision
- 물리적으로 지나갈 수 있는지 결정하는 데이터.

trigger
- 닿거나 상호작용했을 때 이벤트를 발생시키는 영역.

spawn
- 캐릭터나 오브젝트가 처음 생성되는 위치.

camera
- 월드 중 현재 화면에 보이는 영역.

world bounds
- 게임 월드의 실제 크기와 이동 가능 범위.

debug layer
- 플레이어에게 보이지 않지만 개발 중 확인하는 레이어.
```

## 14. 토큰을 아끼는 지시 템플릿

다음처럼 말하면 의도가 짧고 명확해진다.

```text
home-yard-map 설계 기준으로 Tiled blockout JSON을 만들자.
맵은 40 x 24, tile은 32px, layer 이름은 스펙 그대로 써.
실제 에셋은 placeholder tileset으로 두고, gameplay_markers를 Object Layer로 만들어.
이번 범위는 렌더링 확인까지만 하고 이동/충돌 구현은 하지 마.
```

또는:

```text
GameScene에서 home-yard-map을 로드해서 ground_base, yard_and_path,
house_blockout, decor_soft_boundary, collision_blockout 순서로 보여줘.
collision_blockout은 debug에서만 보이게 하고, gameplay_markers에서 player_spawn과
dog_spawn을 읽는 함수만 만들어줘.
```

이런 지시는 범위, 좌표계, 레이어 이름, 구현 제외 항목을 한 번에 고정하므로
불필요한 확인 질문을 줄인다.

## 다음 학습 순서

1. Tiled에서 `40 x 24`, `32px` 맵을 직접 만들어본다.
2. Tile Layer와 Object Layer를 각각 하나씩 만들어 차이를 확인한다.
3. placeholder tileset으로 집 footprint와 마당을 찍어본다.
4. Tiled JSON을 열어 layer name과 object name이 어떻게 저장되는지 본다.
5. Phaser에서 `tilemapTiledJSON`, `make.tilemap`, `createLayer` 흐름을 연결한다.

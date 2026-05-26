# Home Yard Collision Debug Tileset Design

Date: 2026-05-26

## Purpose

`home-yard` 맵의 시각 타일과 충돌 마스크를 명확히 분리한다.

현재 `collision_blockout`에는 충돌 전용 GID `6`뿐 아니라 배경/언덕 시각 타일이
섞여 있다. Phaser 런타임은 `collision_blockout.setCollisionByProperty({
collides: true })`를 사용하므로 실제 충돌은 `collides: true` 속성이 붙은 타일만
동작한다. 이 구조는 Tiled JSON을 읽거나 편집할 때 어떤 타일이 보이는 지형이고
어떤 타일이 실제 충돌인지 헷갈리기 쉽다.

이번 작업은 충돌 전용 SVG 타일셋을 추가하고, `collision_blockout`을 순수 충돌
마스크로 정리한다.

## Current State

홈마당 맵은 다음 런타임 경로를 사용한다.

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
```

현재 레이어 구성은 유지한다.

```text
ground_base
yard_and_path
house_blockout
decor_soft_boundary
collision_blockout
gameplay_markers
```

현재 충돌 속성은 Star Realms 타일셋의 GID `6`에만 붙어 있다.

```json
{
  "id": 5,
  "properties": [{ "name": "collides", "type": "bool", "value": true }]
}
```

`collision_blockout`의 7번째 줄에는 `121, 122, ..., 123` 언덕 경계 시각 타일이
들어 있다. 이 타일들은 `collides: true` 속성이 없으므로 현재 충돌로 동작하지
않는다.

최근 수동 수정으로 `homeYardTilemapJson.test.ts`가 현재 맵 JSON과 맞지 않을 수 있다.
해당 수동 수정은 의도된 구현으로 취급한다. 이 작업의 구현 단계에서는
`home-yard-blockout.json`, 생성 스크립트, 런타임 코드 같은 구현 파일을 되돌리거나
재생성하지 않고, 깨진 테스트를 현재 구현 의도에 맞게 갱신한다.

## Design

### Collision Debug Tileset

새 SVG 타일셋을 추가한다.

```text
apps/game/public/assets/tilesets/home-yard-collision-debug.svg
```

이 SVG는 `24 x 24` 크기의 1타일짜리 디버그 타일셋이다. 타일은 빨간 반투명 배경,
선명한 테두리, 대각선 X 같은 형태로 만든다. 목적은 아트 품질이 아니라 Tiled와
개발 모드에서 "이 셀은 충돌 마스크"라는 점을 즉시 알아보게 하는 것이다.

처음에는 충돌 타입을 나누지 않는다. `blocked`, `locked`, `edge` 같은 타입별 색상은
향후 실제 게임플레이 구분이 필요해질 때 추가한다.

### Tilemap Tilesets

`home-yard-blockout.json`은 두 개의 tileset을 사용한다.

```text
StarRealmsCozyForestPack24x24.png
home-yard-collision-debug.svg
```

Star Realms 타일셋은 시각 타일만 담당한다. 새 SVG 타일셋의 첫 번째 타일에
`collides: true` 속성을 부여한다.

새 SVG tileset의 `firstgid`는 Star Realms tilecount 뒤에 이어진다. 현재
Star Realms 타일셋은 `tilecount: 480`이므로 collision debug GID는 `481`이 된다.

SVG tileset 메타데이터는 다음 값을 사용한다.

```text
columns: 1
imagewidth: 24
imageheight: 24
tilecount: 1
tilewidth: 24
tileheight: 24
```

### Layer Responsibilities

레이어 책임을 다음처럼 정리한다.

```text
ground_base
- 기본 배경과 언덕 경계처럼 바닥/지형으로 보이는 시각 타일

collision_blockout
- 실제로 막히는 셀만 담는 충돌 마스크
- empty GID 또는 collision debug GID만 사용
```

위쪽 배경/언덕 사례는 다음 구조가 된다.

```text
ground_base
- 1~6번째 줄: 우주/상단 배경 시각 타일
- 7번째 줄: 121, 122, ..., 123 언덕 경계 시각 타일

collision_blockout
- 7번째 줄: collision debug GID
- 1~6번째 줄: 비움
```

집, 맵 외곽, 잠긴 길처럼 이미 막혀야 하는 영역도 같은 collision debug GID를
사용한다.

### Phaser Runtime

`homeYardMap.ts`에는 collision debug tileset 상수를 추가한다.

```text
HOME_YARD_COLLISION_TILESET_KEY
HOME_YARD_COLLISION_TILESET_NAME
HOME_YARD_COLLISION_TILESET_URL
HOME_YARD_COLLISION_TILESET_IMAGE_WIDTH
HOME_YARD_COLLISION_TILESET_IMAGE_HEIGHT
```

에셋 로더는 Star Realms PNG와 collision debug SVG를 모두 로드한다. PNG는 기존처럼
`loader.image`를 사용하고, SVG는 명시적으로 `loader.svg`를 사용한다.

맵 생성 시 `map.addTilesetImage`로 두 tileset을 모두 추가하고, 모든 tile layer 생성에
tileset 배열을 전달한다.

```text
createLayer(layerName, [starRealmsTileset, collisionDebugTileset])
```

`collisionBlockout.setCollisionByProperty({ collides: true })`는 유지한다.
`collisionBlockout.setVisible(import.meta.env.DEV)`도 유지해서 개발 모드에서는
충돌 마스크가 보이고, 프로덕션에서는 보이지 않게 한다.

### Implementation Source Of Truth

`apps/game/scripts/createHomeYardStarRealmsMap.mjs`는 맵 JSON을 재생성할 때 두
tileset 메타데이터를 출력한다.

스크립트 안에서는 collision debug GID를 명명된 값으로 계산한다.

```text
collisionDebugFirstGid = 481
collisionDebugBlocked = collisionDebugFirstGid
```

시각 타일을 collision data에 넣지 않도록 `createCollisionBlockoutData`는 empty GID와
collision debug GID만 출력한다.

수동으로 수정된 구현 파일이 현재 테스트와 다르다면, 구현 파일이 우선이다. 구현
단계에서는 `homeYardTilemapJson.test.ts`를 현재 `home-yard-blockout.json`과 새 레이어
책임에 맞게 수정한다. 생성 스크립트와 JSON fixture의 불일치가 발견되더라도 이
작업에서는 스크립트를 실행해 JSON을 덮어쓰지 않는다. 필요한 경우 불일치는 별도
후속 작업으로 기록한다.

## Tests

`homeYardAssets.test.ts`는 Star Realms PNG와 collision debug SVG가 모두 로드 큐에
들어가는지 확인한다.

`homeYardTilemapJson.test.ts`는 다음을 검증한다.

- tilemap tilesets에 Star Realms PNG와 collision debug SVG가 모두 있다.
- collision debug tile에 `collides: true` 속성이 있다.
- `collision_blockout`에는 empty GID 또는 collision debug GID만 있다.
- `collision_blockout`에는 Star Realms 시각 GID가 없다.
- `ground_base`의 7번째 줄에는 언덕 경계 GID `121, 122, ..., 123`이 있다.
- `collision_blockout`의 7번째 줄에는 collision debug GID가 있다.
- 기존 집, 마당, 문, 길, 스폰, 잠긴 길 구조는 유지된다.
- 현재 수동 수정으로 깨진 fixture 기대값은 현재 구현 의도에 맞게 복구된다.

`createHomeYardMap` 관련 테스트가 있다면 multi-tileset layer 생성 전제를 반영한다.

## Non-Goals

- 충돌 타입별 디버그 타일 추가
- Tiled object layer 기반 폴리곤 충돌로 전환
- Phaser 물리 시스템 또는 플레이어 이동 구현
- 집, 마당, 스폰, 잠긴 길 좌표 변경
- Star Realms PNG 자체 수정
- 수동으로 수정된 맵 JSON, 생성 스크립트, 런타임 코드 되돌리기
- 생성 스크립트를 실행해서 현재 맵 JSON을 덮어쓰기
- 최종 게임 아트 품질의 충돌 표시 제작

## Verification

구현 후 저장소 루트에서 다음을 실행한다.

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
```

`pnpm --filter @louis-world/game test`에는 `homeYardTilemapJson.test.ts` 복구가
포함되어야 한다. 이 테스트가 실패하면 작업은 완료된 것으로 보지 않는다.

가능하면 개발 서버에서 화면도 확인한다.

```text
개발 모드: collision_blockout의 SVG 마스크가 보인다.
프로덕션 빌드: collision_blockout이 보이지 않는다.
언덕 7번째 줄 너머로 넘어가지 못하는 충돌 의도가 JSON에서 명확하다.
```

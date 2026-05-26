# Home Yard 24px Tileset Wiring Design

Date: 2026-05-24

## Purpose

`home-yard` 맵이 사용자가 추가한 `StarRealmsCozyForestPack24x24.png`를
Phaser 런타임에서 실제 타일셋 이미지로 로드하도록 최소 변경한다.

이번 범위는 24x24 타일셋 배선 전환이다. 실제로 예쁜 집과 마당을 그리기 위한
타일 ID 재배치, 새 맵 디자인, 카메라 연출, 캐릭터 스케일 조정은 포함하지 않는다.

## Current State

현재 프로젝트는 `home-yard-blockout.json`을 Tiled JSON으로 로드하고,
`home-yard-placeholder.svg`를 SVG 타일셋으로 로드한다.

사용자가 추가한 새 에셋은 다음 파일이다.

```text
apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
```

확인된 이미지 크기는 `480 x 576`이고, 원본 타일 크기는 `24 x 24`다.
따라서 타일셋 메타데이터는 다음 기준을 따른다.

```text
tilewidth: 24
tileheight: 24
columns: 20
tilecount: 480
imagewidth: 480
imageheight: 576
```

## Canon Context

`docs/game/world.md`는 첫 공간을 별나라의 외딴 작은 집과 마당으로 정의한다.
이번 변경은 세계관이나 공간 디자인을 확정하지 않고, 이후 실제 마당 아트 적용을
위한 기술적 배선만 정리한다.

기존 `ground_base`, `yard_and_path`, `house_blockout`, `decor_soft_boundary`,
`collision_blockout`, `gameplay_markers` 레이어 구조는 유지한다.

## Design

### Map Metadata

`apps/game/src/game/maps/homeYardMap.ts`의 타일셋 관련 상수를 24x24 PNG 기준으로
바꾼다.

```text
HOME_YARD_TILESET_URL: tilesets/StarRealmsCozyForestPack24x24.png
HOME_YARD_TILESET_IMAGE_WIDTH: 480
HOME_YARD_TILESET_IMAGE_HEIGHT: 576
HOME_YARD_TILE_SIZE: 24
```

`HOME_YARD_MAP_WIDTH_IN_TILES`와 `HOME_YARD_MAP_HEIGHT_IN_TILES`는 기존
`40 x 24`를 유지한다. 이번 작업은 맵 좌표계를 다시 설계하지 않는다.

`HOME_YARD_TILESET_NAME`은 Tiled JSON의 tileset `name`과 정확히 일치시킨다.
Phaser의 `map.addTilesetImage()`는 첫 번째 인자로 Tiled tileset name을 요구하고,
두 번째 인자로 Phaser texture key를 사용하기 때문이다.

### Asset Loading

`apps/game/src/game/maps/homeYardAssets.ts`는 SVG 로더 대신 PNG 이미지 로더를
사용한다.

```text
before: loader.svg(key, url, { width, height })
after: loader.image(key, url)
```

타일셋 이미지의 width와 height는 PNG 로딩에 넘기지 않는다. 크기 정보는 Tiled JSON
tileset metadata와 TypeScript 상수 테스트에서 검증한다.

### Tilemap JSON Metadata

`apps/game/public/assets/tilemaps/home-yard-blockout.json`의 tileset metadata를
24x24 PNG 기준으로 바꾼다.

```text
tilewidth: 24
tileheight: 24
tilesets[0].image: ../tilesets/StarRealmsCozyForestPack24x24.png
tilesets[0].imagewidth: 480
tilesets[0].imageheight: 576
tilesets[0].columns: 20
tilesets[0].tilecount: 480
tilesets[0].tilewidth: 24
tilesets[0].tileheight: 24
```

기존 타일 레이어의 GID 값은 이번 변경에서 재배치하지 않는다. 그 결과 화면은
placeholder 의도와 다르게 보일 수 있다. 이 상태는 의도된 중간 단계이며, 다음
작업에서 실제 Star Realms 타일 ID로 맵을 다시 배치한다.

`collision_blockout`이 현재 `gid 6`을 사용하므로, 기존 충돌 테스트와 런타임 흐름을
보존하기 위해 tileset property의 `id: 5`는 유지한다. Tiled의 tile property id는
0-based이고, map data의 gid는 1-based이기 때문이다.

### Tests

`homeYardAssets.test.ts`는 다음을 검증한다.

- Tiled JSON은 기존 URL로 로드된다.
- 타일셋은 `image` 로더로 로드된다.
- 타일셋 URL은 `tilesets/StarRealmsCozyForestPack24x24.png`다.
- SVG config는 더 이상 기대하지 않는다.

`homeYardMap.test.ts`는 다음 기대값을 24px 기준으로 갱신한다.

```text
HOME_YARD_TILE_SIZE: 24
player_spawn pixel center: { x: 468, y: 276 }
dog_spawn pixel center: { x: 492, y: 324 }
```

## Non-Goals

- Star Realms 타일셋에 맞춘 실제 타일 ID 재배치
- 새 Tiled 맵 작성
- 기존 blockout script 재작성
- 카메라 스케일, 줌, 팔로우 동작 변경
- 강아지나 플레이어 시각 스케일 조정
- 집 내부 또는 마당 상호작용 구현

## Verification

구현 후 다음을 확인한다.

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts homeYardAssets.test.ts
pnpm --filter @louis-world/game build
```

브라우저 확인은 별도 작업으로 둔다. 이번 작업은 실제 예쁜 맵 배치가 아니라
로더와 메타데이터 전환이므로, 테스트와 빌드가 주 검증이다.

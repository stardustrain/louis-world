# Home Yard Background Auto Decor Design

Date: 2026-05-25

## Purpose

`home-yard` 맵의 집 배치, 마당, 문, 스폰, 잠긴 길 구조는 유지하면서 주변 배경을
`StarRealmsCozyForestPack24x24.png` 타일셋으로 자동 장식한다.

이번 작업의 목표는 Tiled에서 배경을 전부 손으로 찍는 부담을 줄이고, 이후 수동
보정이 가능한 1차 배경 결과물을 만드는 것이다.

## Current State

현재 홈마당 맵은 `apps/game/public/assets/tilemaps/home-yard-blockout.json`으로
관리된다. 런타임은 다음 레이어 이름을 기대한다.

```text
ground_base
yard_and_path
house_blockout
decor_soft_boundary
collision_blockout
gameplay_markers
```

최근 작업트리에는 홈마당을 `54 x 30`, `24 x 24` 타일 기준으로 확장한 변경이 있다.
이 설계는 그 좌표계와 기존 중앙 집/마당 클러스터를 유지한다.

기존 `apps/game/scripts/createHomeYardBlockoutAssets.mjs`는 32px placeholder
타일셋 기준으로 남아 있다. 이제 실제 24px Star Realms 타일셋을 대상으로 하는
자동 생성 경로가 필요하다.

## Canon Context

`docs/game/world.md`는 첫 공간을 별나라의 외딴 작은 집과 마당으로 정의한다.
마당에는 공놀이 공간, 반짝이는 풀, 작은 별나무, 아직 갈 수 없는 길이 있다.

이번 작업은 정본 방향을 바꾸지 않는다. 배경은 넓은 모험지보다 둘이 함께 적응하는
첫 보금자리처럼 느껴져야 한다. 공포, 생존 압박, 어두운 세계관 표현은 넣지 않는다.

## Design

### Scope

1차 자동 장식은 집과 마당 바깥의 배경 영역을 대상으로 한다.

유지할 구조는 다음과 같다.

```text
house_blockout
yard_and_path
gameplay_markers
HOME_YARD_HOUSE_AREA
HOME_YARD_YARD_AREA
HOME_YARD_DOOR_AREA
HOME_YARD_PATH_AREA
HOME_YARD_LOCKED_PATH_AREA
HOME_YARD_PLAYER_SPAWN
HOME_YARD_DOG_SPAWN
```

자동화가 수정할 주요 대상은 다음이다.

```text
ground_base
decor_soft_boundary
collision_blockout
```

`yard_and_path`와 `house_blockout`은 구조 보존을 위해 같은 좌표와 같은 면적을
유지한다. 단, 구현 과정에서 현재 JSON을 생성 스크립트로 다시 출력하면서 동일한
값으로 재생성될 수 있다.

### Tile Palette

타일셋 전체를 사람이 매번 숫자로 다루지 않도록, 생성 스크립트 안에 의미 있는
팔레트를 둔다.

팔레트는 최소한 다음 범주를 가진다.

```text
base grass
grass variants
small flowers
small stones
small shrubs
large tree stamps
collision marker tile
```

타일 번호는 `StarRealmsCozyForestPack24x24.png`의 `20` columns, 1-based GID
기준으로 정의한다.

```text
gid = row * 20 + column + 1
```

구현 중 선택한 타일 번호는 스크립트에 이름으로 고정한다. 이후 Tiled에서 수동
보정하더라도 어떤 타일이 어떤 의도로 쓰였는지 추적할 수 있어야 한다.

### Placement Rules

배경 장식은 deterministic하게 생성한다. 같은 입력과 같은 seed는 항상 같은 JSON을
만든다.

구역은 다음처럼 나눈다.

```text
map edge band
behind house
yard left side
yard right side
lower background
locked path surroundings
```

각 구역은 장식 밀도를 다르게 가진다.

- 맵 가장자리는 약간 더 밀도 있게 꾸며 빈 경계를 줄인다.
- 집과 마당 주변은 통행성과 시야를 위해 낮은 밀도로 둔다.
- 잠긴 길 주변은 장식으로 닫힌 느낌을 주되, 잠긴 길 마커 자체는 유지한다.
- 큰 나무는 집/마당/문/길/스폰을 침범하지 않는 배경 영역에만 찍는다.

장식 배치는 occupancy map을 사용해 기존 구조와 겹치지 않게 한다.

### Collision

`collision_blockout`은 기존 의미를 유지한다.

- 맵 외곽 경계는 막는다.
- 집 영역은 막고 문 영역은 열어 둔다.
- 잠긴 길은 막는다.
- 큰 나무처럼 명확히 지나갈 수 없는 자동 장식만 충돌에 추가한다.
- 꽃, 작은 돌, 작은 풀은 충돌을 만들지 않는다.

작은 장식에 충돌을 넣으면 24x24 전체 칸이 막히므로 1차 범위에서는 피한다.

### Output

자동 생성 결과는 기존 런타임 경로를 유지한다.

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
```

새 스크립트는 기존 placeholder 스크립트를 직접 확장하기보다 24px 홈마당 전용으로
분리한다. 기존 파일명을 재사용하면 32px placeholder 전제와 24px Star Realms 전제가
섞이기 쉽다.

예상 경로는 다음이다.

```text
apps/game/scripts/createHomeYardStarRealmsMap.mjs
```

`apps/game/package.json`에는 수동 실행용 script를 추가한다. 자동 생성은 반복 작업에
사용될 가능성이 있으므로 명령 이름은 맵 범위를 드러내야 한다.

```text
generate:home-yard-map
```

### Visual Review

시각 보조는 구현 직후 1차 결과를 확인할 때 사용한다.

처음부터 별도 브라우저 도구로 설계를 진행하지 않는다. 먼저 스크립트와 테스트로
재현 가능한 맵을 만든 뒤, 필요하면 브라우저에서 전후 비교와 화면 검수를 한다.

## Tests

테스트는 자동 장식이 기존 플레이 구조를 깨지 않는지 확인한다.

`homeYardMap.test.ts`는 기존 상수와 영역 좌표를 계속 검증한다.

`homeYardTilemapJson.test.ts`는 다음 검증을 추가하거나 유지한다.

- 맵 크기는 `54 x 30`이다.
- 각 tile layer의 data 길이는 `1620`이다.
- 필수 레이어 이름이 유지된다.
- gameplay marker 위치가 유지된다.
- tileset metadata는 24px Star Realms 기준이다.
- `collision_blockout`에는 충돌용 GID만 사용된다.
- 집/마당/문/길/잠긴 길 영역의 구조적 타일 배치가 유지된다.
- 배경 장식은 집/마당/길/스폰 중심 좌표를 침범하지 않는다.

생성 스크립트는 1차 범위에서 별도 단위 테스트를 만들지 않는다. 대신 생성된 JSON
fixture 검증을 주 검증으로 삼고, 스크립트는 deterministic output을 만드는 작은
순수 helper들 위주로 작성한다.

## Non-Goals

- 집 배치 변경
- 마당 크기나 형태 변경
- gameplay marker 재설계
- 집 내부 구현
- 플레이어 이동, 카메라, 강아지 스케일 변경
- 새 타일셋 생성
- PixelLab 또는 외부 에셋 생성 도입
- 모든 배경을 최종 아트 수준으로 완성

## Verification

구현 후 다음을 확인한다.

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
```

그 다음 로컬 게임 화면에서 다음을 확인한다.

- 집과 마당 위치가 유지된다.
- 문, 스폰, 잠긴 길이 기존 위치에 있다.
- 배경이 이전보다 덜 비어 보인다.
- 큰 장식이 통행 영역을 막지 않는다.
- 충돌 표시가 개발 모드에서 의도한 영역에만 보인다.

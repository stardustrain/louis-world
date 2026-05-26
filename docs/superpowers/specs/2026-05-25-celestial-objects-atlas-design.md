# Celestial Objects Atlas Design

Date: 2026-05-25

## Purpose

`CelestialObjects.png`를 홈마당 장식용 Texture Atlas로 사용할 수 있게 준비한다.

이번 작업은 화면에 실제 오브젝트를 배치하지 않는다. 목표는 원본 PNG를 프로젝트
정적 에셋 경로에 넣고, Phaser가 frame 이름으로 장식 후보를 꺼낼 수 있는 설정을
완성하는 것이다.

## Current State

원본 에셋은 로컬 다운로드 경로에 있다.

```text
/Users/lucashan/Downloads/CelestialObjects/CelestialObjects.png
```

이미지는 `384 x 256` RGBA PNG이며, readme 기준 다음 오브젝트를 포함한다.

```text
12 planets
4 moons
4 dwarf stars
4 asteroids
3 star clusters
2 nebulae
black hole
```

현재 게임은 `PreloaderScene`에서 `this.load.setPath("assets")`를 사용한다. 따라서
`apps/game/public/assets` 아래 파일은 런타임에서 `assets/...` 기준 경로로 로드된다.

홈마당 맵과 타일셋은 다음 경로를 사용한다.

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
```

## Canon Context

`docs/game/world.md`는 첫 공간을 별빛이 스며드는 작은 집과 마당으로 정의한다.
하늘에는 달과 별구름이 있고, 공간은 낯설지만 안전하고 포근해야 한다.

이번 작업은 정본 방향을 바꾸지 않는다. 행성, 블랙홀, 성운처럼 장면의 의미를 크게
바꿀 수 있는 큰 오브젝트는 1차 atlas 대상에서 제외한다. 작은 달, 왜성, 소행성,
별무리만 장식 후보로 준비한다.

## Design

### Asset Paths

PNG는 여러 파일로 분리하지 않고 하나의 이미지로 유지한다.

예상 경로는 다음이다.

```text
apps/game/public/assets/images/celestial-objects.png
apps/game/public/assets/images/celestial-objects.json
```

`celestial-objects.json`은 Phaser atlas JSON으로 작성한다. PNG는 원본을 복사하되,
파일명은 프로젝트의 kebab-case 에셋 이름에 맞춘다.

### Atlas Scope

1차 atlas frame은 장식에 바로 쓰기 좋은 작은 오브젝트만 포함한다.

```text
moon_01
moon_02
moon_03
moon_04
dwarf_star_01
dwarf_star_02
dwarf_star_03
dwarf_star_04
asteroid_01
asteroid_02
asteroid_03
asteroid_04
star_cluster_01
star_cluster_02
star_cluster_03
```

Frame 이름은 색상이나 주관적 모양보다 그룹과 번호를 우선한다. 나중에 실제 배치
단계에서 화면 분위기에 맞는 frame을 골라 쓰기 쉽고, 이름이 이미지 해석에 과하게
묶이지 않는다.

### Atlas Format

Atlas JSON은 Phaser가 `load.atlas`로 읽을 수 있는 JSON Hash 형식을 사용한다.

각 frame은 최소한 다음 정보를 가진다.

```json
{
  "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
  "rotated": false,
  "trimmed": false,
  "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
  "sourceSize": { "w": 32, "h": 32 }
}
```

Moon과 dwarf star는 readme 기준 `32 x 32` 오브젝트이므로 32px frame으로 등록한다.
Asteroid와 star cluster는 원본 시트에서 알파 채널이 있는 픽셀들의 bounding box를
기준으로 사각 frame을 잡는다. 픽셀아트 가장자리가 잘리지 않도록 bounding box 바깥에
최대 1px 여유를 둘 수 있지만, frame은 반드시 `384 x 256` 원본 이미지 경계 안에 있어야
한다.

### Loader Integration

에셋 로드는 홈마당 맵 로더와 같은 경계에서 처리한다. 새 atlas를 다른 씬에서
당장 공유할 필요가 없으므로 `preloadHomeYardMapAssets`에 atlas 로드 호출을 추가한다.

필요한 상수는 기존 홈마당 맵 상수와 같은 파일인 `homeYardMap.ts`에 둔다.

```text
HOME_YARD_CELESTIAL_ATLAS_KEY
HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL
HOME_YARD_CELESTIAL_ATLAS_JSON_URL
```

`HomeYardAssetLoader` 타입에는 `atlas` 메서드를 추가한다. 기존 `tilemapTiledJSON`과
`image` 호출은 유지한다.

### Runtime Usage Boundary

이번 작업은 atlas를 로드 가능한 상태로만 만든다.

`GameScene`에는 장식 배치를 추가하지 않는다. 실제 사용은 다음 단계에서 사용자가
주도하고, 필요한 좌표와 depth 배치만 함께 조정한다.

나중에 사용할 때의 형태는 다음과 같다.

```ts
scene.add.image(x, y, HOME_YARD_CELESTIAL_ATLAS_KEY, "moon_01");
```

## Tests

설정 단계에서 확인할 테스트는 다음이다.

- `homeYardAssets.test.ts`는 atlas image URL과 atlas JSON URL이 preload 큐에 들어가는지 검증한다.
- `homeYardMap.test.ts`는 새 atlas key와 URL 상수를 검증한다.
- atlas JSON은 raw import로 파싱해 필수 frame 이름이 모두 있고, frame 사각형이 원본 이미지 크기 안에 들어가는지 검증한다.

화면 배치를 하지 않으므로 스크린샷 검증은 이번 범위에 넣지 않는다.

## Non-Goals

- `GameScene`에 천체 오브젝트 배치
- 타일맵 JSON 수정
- 기존 타일셋 수정
- 행성, 블랙홀, 성운 frame 등록
- PNG를 여러 개의 개별 파일로 분리
- Tiled object layer나 image layer 통합
- 게임 세계관 문서 수정

## Verification

구현 후 다음을 확인한다.

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
```

추가로 atlas JSON이 `celestial-objects.png`의 `384 x 256` 범위를 벗어나지 않는지
테스트로 확인한다.

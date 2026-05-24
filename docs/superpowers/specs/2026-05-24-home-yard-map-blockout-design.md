# Home Yard Map Blockout Design

Date: 2026-05-24

## Purpose

첫 플레이 공간의 집과 마당을 Tiled와 Phaser로 옮기기 쉬운 타일 좌표로 정의한다.
이번 설계는 완성형 아트나 상호작용 구현이 아니라, 맵 한가운데의 집, 마당, 문,
중앙 길, 닫힌 길, 시작 위치를 안정적으로 잡는 blockout 기준이다.

이 작업은 사용자가 게임 제작을 처음 배우는 상황을 전제로 한다. 따라서 구현을
한 번에 끝내기보다 좌표표, 레이어 구조, Phaser 연결 방식, 확인 순서로 나누어
천천히 검증한다.

## Canon Context

`docs/game/world.md`는 첫 공간을 별나라의 외딴 작은 집과 마당으로 정의한다.
집 안에는 침대, 강아지 방석, 밥그릇, 창문, 문이 있고, 마당에는 공놀이 공간,
반짝이는 풀, 작은 별나무, 아직 갈 수 없는 길이 있다.

이번 범위는 집 내부를 만들지 않는다. 외부에서 보이는 작은 집의 footprint와
집 앞 마당의 좌표만 정의한다. 톤은 낯설지만 안전하고, 포근한 첫 보금자리처럼
느껴져야 한다.

## Research Notes

- Phaser 4.1의 Tilemap은 Tiled JSON, CSV, 2D 배열에서 생성할 수 있고,
  실제 렌더링은 TilemapLayer가 담당한다.
- Phaser Loader는 `tilemapTiledJSON`으로 Tiled JSON 맵을 로드하고, 이후
  Scene에서 `make.tilemap`으로 사용할 수 있다.
- Phaser Tilemap은 `addTilesetImage`, `createLayer`, `getObjectLayer`를
  통해 타일셋, 타일 레이어, 오브젝트 레이어를 연결할 수 있다.
- Tiled의 Tile Layer는 바닥, 길, 집 blockout처럼 격자에 맞는 정보를 담기에
  좋다.
- Tiled의 Object Layer는 스폰 위치, 문, 잠긴 길 같은 게임플레이 마커를
  코드에 하드코딩하지 않고 보관하기에 적합하다.

References:

- https://docs.phaser.io/api-documentation/class/tilemaps-tilemap
- https://docs.phaser.io/phaser/concepts/loader
- https://doc.mapeditor.org/manual/layers/
- https://doc.mapeditor.org/en/stable/manual/objects/

## Map Basis

좌표계는 Tiled와 Phaser 기준을 따른다. 왼쪽 위가 `(0, 0)`이고, 오른쪽으로
`x`가 증가하며 아래쪽으로 `y`가 증가한다.

```text
Map size: 40 x 24 tiles
Tile size: 32px
Pixel size: 1280 x 768px
Game viewport: 1280 x 720px
Center axis: x 19~20
```

가로는 현재 게임 논리 해상도와 같고, 세로는 48px 더 크다. 이 여유는 첫 화면에서
카메라 위치를 조정하거나 위쪽 공간에 하늘감과 장식을 남기는 데 사용할 수 있다.

## Coordinate Plan

```text
House
- Area: x 15~24, y 4~10
- Size: 10 x 7 tiles
- Role: visible exterior footprint for the first small home
```

```text
Door and central path
- Door: x 19~20, y 10
- Yard path: x 19~20, y 11~18
- Locked path start: x 19~20, y 19
```

```text
Yard
- Area: x 13~26, y 11~18
- Size: 14 x 8 tiles
- Boundary style: half-open natural boundary
- Left, right, and upper edges: sparkling grass and soft natural boundary
- Lower center: locked path hint for a future area
```

```text
Gameplay markers
- player_spawn: x 19, y 11
- dog_spawn: x 20, y 13
- house_door: x 19~20, y 10
- locked_path: x 19~20, y 19
```

The house and yard are treated as one centered cluster. The house sits slightly
above center, while the yard sits directly below it. Door, yard path, and locked
path all share the `x 19~20` center axis.

## Tiled Layer Structure

Use a small set of layers first. The goal is to separate visible tiles, temporary
blockout tiles, collision intent, and gameplay markers.

```text
Tile Layers
1. ground_base
   - Base ground for the full 40 x 24 map.
   - Example use: night grass or empty starland ground.

2. yard_and_path
   - Yard and central path tiles.
   - Yard: x 13~26, y 11~18.
   - Path: x 19~20, y 11~18.
   - Locked path hint: x 19~20, y 19.

3. house_blockout
   - Exterior house footprint.
   - House: x 15~24, y 4~10.
   - This can later become a visual house layer or be replaced by real assets.

4. decor_soft_boundary
   - Sparkling grass, small star tree candidates, and natural edge hints.
   - Primarily visual; not the source of gameplay collision.

5. collision_blockout
   - Non-visual or debug-only blocking layer.
   - Covers house walls, temporary map edges, and the locked path.
```

```text
Object Layers
1. gameplay_markers
   - player_spawn
   - dog_spawn
   - house_door
   - locked_path
```

`house_blockout`, `collision_blockout`, and `gameplay_markers` must stay separate.
This keeps visible layout, movement blocking, and game logic coordinates from
being confused with each other.

## Phaser Connection

Shared map assets should be loaded in `PreloaderScene`. `GameScene` should create
the tilemap and layers.

Expected future flow:

```text
PreloaderScene
- Load tilemap JSON with tilemapTiledJSON.
- Load the tileset image.
```

```text
GameScene
1. Create the map with this.make.tilemap({ key: "home-yard-map" }).
2. Connect the tileset with map.addTilesetImage(...).
3. Create ground_base.
4. Create yard_and_path.
5. Create house_blockout.
6. Create decor_soft_boundary.
7. Create collision_blockout.
8. Hide collision_blockout outside debug views.
9. Read gameplay_markers with getObjectLayer("gameplay_markers").
```

For the first implementation, prefer reading `gameplay_markers` with
`getObjectLayer` rather than converting objects directly into sprites. These
markers are logic coordinates, not visible game objects.

## Learning And Build Order

```text
1. Paper design
   - Document the coordinate table and confirm the map blockout.

2. Tiled blockout
   - Create a 40 x 24 map with 32px tiles.
   - Use a placeholder tileset.
   - Create the five tile layers and one object layer.

3. Phaser loading
   - Load tilemap JSON and tileset image in PreloaderScene.
   - Create layers in GameScene.
   - Read player_spawn and dog_spawn.

4. Browser check
   - Confirm that the house sits slightly above center.
   - Confirm that the yard attaches below the house.
   - Confirm that door, path, and locked path align on x 19~20.
   - Confirm that player_spawn and dog_spawn feel natural.

5. Tests
   - Use Vitest for pure coordinate constants or map metadata.
   - Use browser verification for Phaser rendering.
   - Add movement and collision tests later when player movement exists.
```

## Success Criteria

- The first map blockout has a clear `40 x 24` tile coordinate basis.
- The house, yard, door, central path, locked path, player spawn, and dog spawn
  all have explicit tile coordinates.
- The Tiled layer structure separates visuals, collision intent, and gameplay
  markers.
- The planned Phaser flow matches the repository's current `BootScene ->
PreloaderScene -> GameScene` structure.
- The plan can be followed with placeholder assets before real tilesets are
  downloaded.

## Non-Goals

- No real tileset download or final art selection.
- No house interior.
- No player movement.
- No dog AI.
- No door transition.
- No ball play, feeding, petting, or day loop implementation.
- No finished visual polish.

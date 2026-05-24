# Home Yard Map Blockout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Tiled/Phaser blockout for the home-and-yard map using the approved `40 x 24`, `32px` coordinate design.

**Architecture:** Keep the Tiled JSON map as the runtime source of truth for visible layers and object markers. Keep map keys, layer names, object names, and approved coordinate metadata in focused TypeScript modules so they are testable without Phaser rendering. Load shared map assets in `PreloaderScene`, create the map in `GameScene`, and use browser verification for visual alignment.

**Tech Stack:** Phaser 4.1, Vite, TypeScript, Vitest, Tiled JSON, SVG placeholder tileset.

---

## File Map

- Create `docs/learning/home-yard-map-blockout.md`: learning notes for game-map concepts, already written before this implementation plan.
- Create `apps/game/src/game/maps/homeYardMap.ts`: approved map keys, layer names, object names, dimensions, tile areas, and small coordinate helpers.
- Create `apps/game/src/game/maps/homeYardMap.test.ts`: verifies the approved dimensions, coordinates, center axis, and pixel conversion.
- Create `apps/game/scripts/createHomeYardBlockoutAssets.mjs`: deterministic generator for the placeholder SVG tileset and Tiled JSON map.
- Create `apps/game/public/assets/tilesets/home-yard-placeholder.svg`: generated text-based placeholder tileset.
- Create `apps/game/public/assets/tilemaps/home-yard-blockout.json`: generated Tiled JSON map with the approved layers and markers.
- Create `apps/game/src/game/maps/homeYardAssets.ts`: small loader adapter for the home-yard map assets.
- Create `apps/game/src/game/maps/homeYardAssets.test.ts`: verifies the asset keys and URLs sent to the loader.
- Modify `apps/game/src/game/scenes/PreloaderScene.ts`: load the home-yard map assets after setting the `assets` path.
- Create `apps/game/src/game/maps/homeYardMarkers.ts`: pure parser for required Tiled object markers.
- Create `apps/game/src/game/maps/homeYardMarkers.test.ts`: verifies marker parsing and missing-marker errors.
- Create `apps/game/src/game/maps/createHomeYardMap.ts`: creates Phaser tilemap layers, configures collision blockout visibility, reads gameplay markers, and sets camera bounds.
- Modify `apps/game/src/game/scenes/GameScene.ts`: replace placeholder text with the home-yard map and development-only spawn markers.
- Modify `apps/game/src/game/scenes/scenes.test.ts`: keep scene construction expectations stable if imports change.

---

### Task 1: Map Metadata And Coordinate Tests

**Files:**

- Create: `apps/game/src/game/maps/homeYardMap.test.ts`
- Create: `apps/game/src/game/maps/homeYardMap.ts`

- [ ] **Step 1: Write the failing metadata tests**

Create `apps/game/src/game/maps/homeYardMap.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  HOME_YARD_DOG_SPAWN,
  HOME_YARD_DOOR_AREA,
  HOME_YARD_HOUSE_AREA,
  HOME_YARD_LAYER_COLLISION_BLOCKOUT,
  HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY,
  HOME_YARD_LAYER_GROUND_BASE,
  HOME_YARD_LAYER_HOUSE_BLOCKOUT,
  HOME_YARD_LAYER_YARD_AND_PATH,
  HOME_YARD_LOCKED_PATH_AREA,
  HOME_YARD_MAP_HEIGHT_IN_TILES,
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_WIDTH_IN_TILES,
  HOME_YARD_OBJECT_DOG_SPAWN,
  HOME_YARD_OBJECT_HOUSE_DOOR,
  HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS,
  HOME_YARD_OBJECT_LOCKED_PATH,
  HOME_YARD_OBJECT_PLAYER_SPAWN,
  HOME_YARD_PATH_AREA,
  HOME_YARD_PLAYER_SPAWN,
  HOME_YARD_TILE_SIZE,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
  HOME_YARD_YARD_AREA,
  isHomeYardTileAreaInsideMap,
  tileToPixelCenter,
} from "./homeYardMap";

describe("home yard map metadata", () => {
  it("uses the approved map keys and dimensions", () => {
    expect(HOME_YARD_MAP_KEY).toBe("home-yard-map");
    expect(HOME_YARD_TILESET_KEY).toBe("home-yard-tiles");
    expect(HOME_YARD_TILESET_NAME).toBe("home-yard-placeholder");
    expect(HOME_YARD_MAP_WIDTH_IN_TILES).toBe(40);
    expect(HOME_YARD_MAP_HEIGHT_IN_TILES).toBe(24);
    expect(HOME_YARD_TILE_SIZE).toBe(32);
  });

  it("uses stable Tiled layer and object names", () => {
    expect(HOME_YARD_LAYER_GROUND_BASE).toBe("ground_base");
    expect(HOME_YARD_LAYER_YARD_AND_PATH).toBe("yard_and_path");
    expect(HOME_YARD_LAYER_HOUSE_BLOCKOUT).toBe("house_blockout");
    expect(HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY).toBe("decor_soft_boundary");
    expect(HOME_YARD_LAYER_COLLISION_BLOCKOUT).toBe("collision_blockout");
    expect(HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS).toBe("gameplay_markers");
    expect(HOME_YARD_OBJECT_PLAYER_SPAWN).toBe("player_spawn");
    expect(HOME_YARD_OBJECT_DOG_SPAWN).toBe("dog_spawn");
    expect(HOME_YARD_OBJECT_HOUSE_DOOR).toBe("house_door");
    expect(HOME_YARD_OBJECT_LOCKED_PATH).toBe("locked_path");
  });

  it("keeps approved areas inside the 40 x 24 map", () => {
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_HOUSE_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_YARD_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_DOOR_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_PATH_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_LOCKED_PATH_AREA)).toBe(true);
  });

  it("aligns the door, yard path, and locked path on the same 2-tile center axis", () => {
    expect(HOME_YARD_DOOR_AREA).toEqual({ x: 19, y: 10, width: 2, height: 1 });
    expect(HOME_YARD_PATH_AREA).toEqual({ x: 19, y: 11, width: 2, height: 8 });
    expect(HOME_YARD_LOCKED_PATH_AREA).toEqual({ x: 19, y: 19, width: 2, height: 1 });
  });

  it("keeps the house above the yard as one centered cluster", () => {
    expect(HOME_YARD_HOUSE_AREA).toEqual({ x: 15, y: 4, width: 10, height: 7 });
    expect(HOME_YARD_YARD_AREA).toEqual({ x: 13, y: 11, width: 14, height: 8 });
  });

  it("converts approved spawn tile coordinates to pixel centers", () => {
    expect(tileToPixelCenter(HOME_YARD_PLAYER_SPAWN)).toEqual({ x: 624, y: 368 });
    expect(tileToPixelCenter(HOME_YARD_DOG_SPAWN)).toEqual({ x: 656, y: 432 });
  });
});
```

- [ ] **Step 2: Run the focused failing test**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts
```

Expected: fail because `apps/game/src/game/maps/homeYardMap.ts` does not exist.

- [ ] **Step 3: Add the map metadata module**

Create `apps/game/src/game/maps/homeYardMap.ts`:

```ts
export type TileArea = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type TilePoint = {
  readonly tileX: number;
  readonly tileY: number;
};

export type PixelPoint = {
  readonly x: number;
  readonly y: number;
};

export const HOME_YARD_MAP_KEY = "home-yard-map";
export const HOME_YARD_MAP_URL = "tilemaps/home-yard-blockout.json";
export const HOME_YARD_TILESET_KEY = "home-yard-tiles";
export const HOME_YARD_TILESET_NAME = "home-yard-placeholder";
export const HOME_YARD_TILESET_URL = "tilesets/home-yard-placeholder.svg";
export const HOME_YARD_TILESET_IMAGE_WIDTH = 224;
export const HOME_YARD_TILESET_IMAGE_HEIGHT = 32;

export const HOME_YARD_MAP_WIDTH_IN_TILES = 40;
export const HOME_YARD_MAP_HEIGHT_IN_TILES = 24;
export const HOME_YARD_TILE_SIZE = 32;

export const HOME_YARD_LAYER_GROUND_BASE = "ground_base";
export const HOME_YARD_LAYER_YARD_AND_PATH = "yard_and_path";
export const HOME_YARD_LAYER_HOUSE_BLOCKOUT = "house_blockout";
export const HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY = "decor_soft_boundary";
export const HOME_YARD_LAYER_COLLISION_BLOCKOUT = "collision_blockout";

export const HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS = "gameplay_markers";
export const HOME_YARD_OBJECT_PLAYER_SPAWN = "player_spawn";
export const HOME_YARD_OBJECT_DOG_SPAWN = "dog_spawn";
export const HOME_YARD_OBJECT_HOUSE_DOOR = "house_door";
export const HOME_YARD_OBJECT_LOCKED_PATH = "locked_path";

export const HOME_YARD_HOUSE_AREA: TileArea = { x: 15, y: 4, width: 10, height: 7 };
export const HOME_YARD_YARD_AREA: TileArea = { x: 13, y: 11, width: 14, height: 8 };
export const HOME_YARD_DOOR_AREA: TileArea = { x: 19, y: 10, width: 2, height: 1 };
export const HOME_YARD_PATH_AREA: TileArea = { x: 19, y: 11, width: 2, height: 8 };
export const HOME_YARD_LOCKED_PATH_AREA: TileArea = { x: 19, y: 19, width: 2, height: 1 };

export const HOME_YARD_PLAYER_SPAWN: TilePoint = { tileX: 19, tileY: 11 };
export const HOME_YARD_DOG_SPAWN: TilePoint = { tileX: 20, tileY: 13 };

export function isHomeYardTileAreaInsideMap(area: TileArea): boolean {
  const areaRightEdge = area.x + area.width;
  const areaBottomEdge = area.y + area.height;

  return (
    area.x >= 0 &&
    area.y >= 0 &&
    areaRightEdge <= HOME_YARD_MAP_WIDTH_IN_TILES &&
    areaBottomEdge <= HOME_YARD_MAP_HEIGHT_IN_TILES
  );
}

export function tileToPixelCenter(point: TilePoint): PixelPoint {
  return {
    x: point.tileX * HOME_YARD_TILE_SIZE + HOME_YARD_TILE_SIZE / 2,
    y: point.tileY * HOME_YARD_TILE_SIZE + HOME_YARD_TILE_SIZE / 2,
  };
}
```

- [ ] **Step 4: Verify the metadata test passes**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit metadata**

Run:

```bash
git add apps/game/src/game/maps/homeYardMap.ts apps/game/src/game/maps/homeYardMap.test.ts
git commit -m "feat: add home yard map metadata"
```

---

### Task 2: Placeholder Tileset And Tiled JSON Assets

**Files:**

- Create: `apps/game/scripts/createHomeYardBlockoutAssets.mjs`
- Create: `apps/game/public/assets/tilesets/home-yard-placeholder.svg`
- Create: `apps/game/public/assets/tilemaps/home-yard-blockout.json`

- [ ] **Step 1: Add the deterministic asset generator**

Create `apps/game/scripts/createHomeYardBlockoutAssets.mjs`:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const gameDirectory = resolve(scriptDirectory, "..");

const tileSize = 32;
const mapWidth = 40;
const mapHeight = 24;
const tileCount = 7;

const paths = {
  tileset: resolve(gameDirectory, "public/assets/tilesets/home-yard-placeholder.svg"),
  tilemap: resolve(gameDirectory, "public/assets/tilemaps/home-yard-blockout.json"),
};

const gid = {
  empty: 0,
  ground: 1,
  yard: 2,
  path: 3,
  house: 4,
  decor: 5,
  collision: 6,
  lockedPathHint: 7,
};

const areas = {
  house: { x: 15, y: 4, width: 10, height: 7 },
  yard: { x: 13, y: 11, width: 14, height: 8 },
  door: { x: 19, y: 10, width: 2, height: 1 },
  path: { x: 19, y: 11, width: 2, height: 8 },
  lockedPath: { x: 19, y: 19, width: 2, height: 1 },
};

const objects = {
  playerSpawn: { name: "player_spawn", tileX: 19, tileY: 11 },
  dogSpawn: { name: "dog_spawn", tileX: 20, tileY: 13 },
};

await mkdir(dirname(paths.tileset), { recursive: true });
await mkdir(dirname(paths.tilemap), { recursive: true });
await writeFile(paths.tileset, createTilesetSvg(), "utf8");
await writeFile(paths.tilemap, `${JSON.stringify(createTilemapJson(), null, 2)}\n`, "utf8");

function createTilesetSvg() {
  const tileColors = ["#233647", "#3d6f5d", "#b9a56b", "#7c5a4a", "#89c6a3", "#ef4444", "#8b5cf6"];
  const tileLabels = ["ground", "yard", "path", "house", "decor", "block", "locked"];
  const rects = tileColors
    .map((color, index) => {
      const x = index * tileSize;
      const label = tileLabels[index];

      return [
        `<rect x="${x}" y="0" width="${tileSize}" height="${tileSize}" fill="${color}" />`,
        `<rect x="${x + 1}" y="1" width="${tileSize - 2}" height="${tileSize - 2}" fill="none" stroke="#f8fafc" stroke-opacity="0.35" />`,
        `<text x="${x + 16}" y="19" text-anchor="middle" font-family="monospace" font-size="5" fill="#f8fafc">${label}</text>`,
      ].join("\n  ");
    })
    .join("\n  ");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize * tileCount}" height="${tileSize}" viewBox="0 0 ${tileSize * tileCount} ${tileSize}">`,
    '  <rect width="100%" height="100%" fill="#111827" />',
    `  ${rects}`,
    "</svg>",
    "",
  ].join("\n");
}

function createTilemapJson() {
  return {
    compressionlevel: -1,
    height: mapHeight,
    infinite: false,
    layers: [
      createTileLayer(1, "ground_base", createGroundBaseData()),
      createTileLayer(2, "yard_and_path", createYardAndPathData()),
      createTileLayer(3, "house_blockout", createHouseBlockoutData()),
      createTileLayer(4, "decor_soft_boundary", createDecorSoftBoundaryData()),
      createTileLayer(5, "collision_blockout", createCollisionBlockoutData(), false),
      createObjectLayer(6),
    ],
    nextlayerid: 7,
    nextobjectid: 5,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.12.1",
    tileheight: tileSize,
    tilesets: [
      {
        columns: tileCount,
        firstgid: 1,
        image: "../tilesets/home-yard-placeholder.svg",
        imageheight: tileSize,
        imagewidth: tileSize * tileCount,
        margin: 0,
        name: "home-yard-placeholder",
        spacing: 0,
        tilecount: tileCount,
        tileheight: tileSize,
        tiles: [
          {
            id: gid.collision - 1,
            properties: [{ name: "collides", type: "bool", value: true }],
          },
        ],
        tilewidth: tileSize,
      },
    ],
    tilewidth: tileSize,
    type: "map",
    version: "1.10",
    width: mapWidth,
  };
}

function createGroundBaseData() {
  return Array.from({ length: mapWidth * mapHeight }, () => gid.ground);
}

function createYardAndPathData() {
  const data = createEmptyData();
  fillArea(data, areas.yard, gid.yard);
  fillArea(data, areas.path, gid.path);
  fillArea(data, areas.lockedPath, gid.lockedPathHint);
  return data;
}

function createHouseBlockoutData() {
  const data = createEmptyData();
  fillArea(data, areas.house, gid.house);
  return data;
}

function createDecorSoftBoundaryData() {
  const data = createEmptyData();

  for (let tileY = areas.yard.y; tileY < areas.yard.y + areas.yard.height; tileY += 1) {
    setTile(data, areas.yard.x - 1, tileY, gid.decor);
    setTile(data, areas.yard.x + areas.yard.width, tileY, gid.decor);
  }

  for (let tileX = areas.yard.x; tileX < areas.yard.x + areas.yard.width; tileX += 1) {
    const overlapsDoor = tileX >= areas.door.x && tileX < areas.door.x + areas.door.width;

    if (!overlapsDoor) {
      setTile(data, tileX, areas.yard.y, gid.decor);
    }
  }

  setTile(data, 11, 14, gid.decor);
  setTile(data, 28, 15, gid.decor);

  return data;
}

function createCollisionBlockoutData() {
  const data = createEmptyData();

  fillArea(data, areas.house, gid.collision);
  fillArea(data, areas.door, gid.empty);
  fillArea(data, areas.lockedPath, gid.collision);

  for (let tileX = 0; tileX < mapWidth; tileX += 1) {
    setTile(data, tileX, 0, gid.collision);
    setTile(data, tileX, mapHeight - 1, gid.collision);
  }

  for (let tileY = 0; tileY < mapHeight; tileY += 1) {
    setTile(data, 0, tileY, gid.collision);
    setTile(data, mapWidth - 1, tileY, gid.collision);
  }

  return data;
}

function createObjectLayer(id) {
  return {
    draworder: "topdown",
    id,
    name: "gameplay_markers",
    objects: [
      createPointObject(
        1,
        objects.playerSpawn.name,
        objects.playerSpawn.tileX,
        objects.playerSpawn.tileY,
      ),
      createPointObject(2, objects.dogSpawn.name, objects.dogSpawn.tileX, objects.dogSpawn.tileY),
      createAreaObject(3, "house_door", areas.door),
      createAreaObject(4, "locked_path", areas.lockedPath),
    ],
    opacity: 1,
    type: "objectgroup",
    visible: true,
    x: 0,
    y: 0,
  };
}

function createPointObject(id, name, tileX, tileY) {
  return {
    height: 0,
    id,
    name,
    point: true,
    properties: [
      { name: "tileX", type: "int", value: tileX },
      { name: "tileY", type: "int", value: tileY },
    ],
    rotation: 0,
    type: "marker",
    visible: true,
    width: 0,
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2,
  };
}

function createAreaObject(id, name, area) {
  return {
    height: area.height * tileSize,
    id,
    name,
    properties: [
      { name: "tileX", type: "int", value: area.x },
      { name: "tileY", type: "int", value: area.y },
      { name: "tileWidth", type: "int", value: area.width },
      { name: "tileHeight", type: "int", value: area.height },
    ],
    rotation: 0,
    type: "trigger",
    visible: true,
    width: area.width * tileSize,
    x: area.x * tileSize,
    y: area.y * tileSize,
  };
}

function createTileLayer(id, name, data, visible = true) {
  return {
    data,
    height: mapHeight,
    id,
    name,
    opacity: 1,
    type: "tilelayer",
    visible,
    width: mapWidth,
    x: 0,
    y: 0,
  };
}

function createEmptyData() {
  return Array.from({ length: mapWidth * mapHeight }, () => gid.empty);
}

function fillArea(data, area, tileGid) {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      setTile(data, tileX, tileY, tileGid);
    }
  }
}

function setTile(data, tileX, tileY, tileGid) {
  const tileIndex = tileY * mapWidth + tileX;
  data[tileIndex] = tileGid;
}
```

- [ ] **Step 2: Generate the placeholder assets**

Run:

```bash
node apps/game/scripts/createHomeYardBlockoutAssets.mjs
```

Expected:

```text
apps/game/public/assets/tilesets/home-yard-placeholder.svg exists
apps/game/public/assets/tilemaps/home-yard-blockout.json exists
```

- [ ] **Step 3: Inspect the generated Tiled JSON**

Run:

```bash
node -e "const fs=require('node:fs'); const map=JSON.parse(fs.readFileSync('apps/game/public/assets/tilemaps/home-yard-blockout.json','utf8')); console.log(map.width, map.height, map.tilewidth, map.layers.map((layer)=>layer.name).join(','));"
```

Expected output:

```text
40 24 32 ground_base,yard_and_path,house_blockout,decor_soft_boundary,collision_blockout,gameplay_markers
```

- [ ] **Step 4: Commit generated blockout assets**

Run:

```bash
git add apps/game/scripts/createHomeYardBlockoutAssets.mjs apps/game/public/assets/tilesets/home-yard-placeholder.svg apps/game/public/assets/tilemaps/home-yard-blockout.json
git commit -m "feat: add home yard blockout assets"
```

---

### Task 3: Asset Loading Adapter

**Files:**

- Create: `apps/game/src/game/maps/homeYardAssets.test.ts`
- Create: `apps/game/src/game/maps/homeYardAssets.ts`
- Modify: `apps/game/src/game/scenes/PreloaderScene.ts`

- [ ] **Step 1: Write the failing loader adapter test**

Create `apps/game/src/game/maps/homeYardAssets.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { preloadHomeYardMapAssets } from "./homeYardAssets";

type LoaderCall = {
  readonly method: string;
  readonly key: string;
  readonly url: string;
  readonly width?: number;
  readonly height?: number;
};

describe("preloadHomeYardMapAssets", () => {
  it("queues the approved Tiled map and placeholder tileset", () => {
    const calls: LoaderCall[] = [];
    const loader = {
      tilemapTiledJSON(key: string, url: string): void {
        calls.push({ method: "tilemapTiledJSON", key, url });
      },
      svg(key: string, url: string, svgConfig: { width: number; height: number }): void {
        calls.push({
          height: svgConfig.height,
          key,
          method: "svg",
          url,
          width: svgConfig.width,
        });
      },
    };

    preloadHomeYardMapAssets(loader);

    expect(calls).toEqual([
      {
        key: "home-yard-map",
        method: "tilemapTiledJSON",
        url: "tilemaps/home-yard-blockout.json",
      },
      {
        height: 32,
        key: "home-yard-tiles",
        method: "svg",
        url: "tilesets/home-yard-placeholder.svg",
        width: 224,
      },
    ]);
  });
});
```

- [ ] **Step 2: Run the focused failing test**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardAssets.test.ts
```

Expected: fail because `homeYardAssets.ts` does not exist.

- [ ] **Step 3: Add the loader adapter**

Create `apps/game/src/game/maps/homeYardAssets.ts`:

```ts
import {
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_URL,
  HOME_YARD_TILESET_IMAGE_HEIGHT,
  HOME_YARD_TILESET_IMAGE_WIDTH,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_URL,
} from "./homeYardMap";

export type HomeYardAssetLoader = {
  tilemapTiledJSON: (key: string, url: string) => void;
  svg: (key: string, url: string, svgConfig: { width: number; height: number }) => void;
};

export function preloadHomeYardMapAssets(loader: HomeYardAssetLoader): void {
  loader.tilemapTiledJSON(HOME_YARD_MAP_KEY, HOME_YARD_MAP_URL);
  loader.svg(HOME_YARD_TILESET_KEY, HOME_YARD_TILESET_URL, {
    height: HOME_YARD_TILESET_IMAGE_HEIGHT,
    width: HOME_YARD_TILESET_IMAGE_WIDTH,
  });
}
```

- [ ] **Step 4: Load home-yard assets from PreloaderScene**

Modify `apps/game/src/game/scenes/PreloaderScene.ts`:

```ts
import Phaser from "phaser";

import { preloadHomeYardMapAssets } from "../maps/homeYardAssets";
import { GameScene } from "./GameScene";

export class PreloaderScene extends Phaser.Scene {
  static readonly KEY = "preloader";

  constructor() {
    super(PreloaderScene.KEY);
  }

  preload(): void {
    this.load.setPath("assets");
    preloadHomeYardMapAssets(this.load);
  }

  create(): void {
    this.scene.start(GameScene.KEY);
  }
}
```

- [ ] **Step 5: Verify loader tests and scene tests pass**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardAssets.test.ts scenes.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit asset loading**

Run:

```bash
git add apps/game/src/game/maps/homeYardAssets.ts apps/game/src/game/maps/homeYardAssets.test.ts apps/game/src/game/scenes/PreloaderScene.ts
git commit -m "feat: load home yard map assets"
```

---

### Task 4: Gameplay Marker Parser

**Files:**

- Create: `apps/game/src/game/maps/homeYardMarkers.test.ts`
- Create: `apps/game/src/game/maps/homeYardMarkers.ts`

- [ ] **Step 1: Write the failing marker parser tests**

Create `apps/game/src/game/maps/homeYardMarkers.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { readHomeYardMarkers } from "./homeYardMarkers";

describe("readHomeYardMarkers", () => {
  it("reads required point and area markers from a Tiled object layer", () => {
    const markers = readHomeYardMarkers({
      objects: [
        { name: "player_spawn", point: true, x: 624, y: 368 },
        { name: "dog_spawn", point: true, x: 656, y: 432 },
        { height: 32, name: "house_door", width: 64, x: 608, y: 320 },
        { height: 32, name: "locked_path", width: 64, x: 608, y: 608 },
      ],
    });

    expect(markers).toEqual({
      dogSpawn: { x: 656, y: 432 },
      houseDoor: { height: 32, width: 64, x: 608, y: 320 },
      lockedPath: { height: 32, width: 64, x: 608, y: 608 },
      playerSpawn: { x: 624, y: 368 },
    });
  });

  it("throws a clear error when a required marker is missing", () => {
    expect(() =>
      readHomeYardMarkers({
        objects: [
          { name: "player_spawn", point: true, x: 624, y: 368 },
          { name: "dog_spawn", point: true, x: 656, y: 432 },
          { height: 32, name: "house_door", width: 64, x: 608, y: 320 },
        ],
      }),
    ).toThrow("Missing home yard marker: locked_path");
  });
});
```

- [ ] **Step 2: Run the focused failing test**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMarkers.test.ts
```

Expected: fail because `homeYardMarkers.ts` does not exist.

- [ ] **Step 3: Add the marker parser**

Create `apps/game/src/game/maps/homeYardMarkers.ts`:

```ts
import {
  HOME_YARD_OBJECT_DOG_SPAWN,
  HOME_YARD_OBJECT_HOUSE_DOOR,
  HOME_YARD_OBJECT_LOCKED_PATH,
  HOME_YARD_OBJECT_PLAYER_SPAWN,
} from "./homeYardMap";

export type HomeYardTiledObject = {
  readonly name?: string;
  readonly point?: boolean;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
};

export type HomeYardObjectLayer = {
  readonly objects: readonly HomeYardTiledObject[];
};

export type HomeYardPointMarker = {
  readonly x: number;
  readonly y: number;
};

export type HomeYardAreaMarker = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type HomeYardMarkers = {
  readonly playerSpawn: HomeYardPointMarker;
  readonly dogSpawn: HomeYardPointMarker;
  readonly houseDoor: HomeYardAreaMarker;
  readonly lockedPath: HomeYardAreaMarker;
};

export function readHomeYardMarkers(objectLayer: HomeYardObjectLayer): HomeYardMarkers {
  return {
    dogSpawn: readPointMarker(objectLayer, HOME_YARD_OBJECT_DOG_SPAWN),
    houseDoor: readAreaMarker(objectLayer, HOME_YARD_OBJECT_HOUSE_DOOR),
    lockedPath: readAreaMarker(objectLayer, HOME_YARD_OBJECT_LOCKED_PATH),
    playerSpawn: readPointMarker(objectLayer, HOME_YARD_OBJECT_PLAYER_SPAWN),
  };
}

function readPointMarker(
  objectLayer: HomeYardObjectLayer,
  markerName: string,
): HomeYardPointMarker {
  const object = findRequiredMarker(objectLayer, markerName);
  const x = readRequiredNumber(object, markerName, "x");
  const y = readRequiredNumber(object, markerName, "y");

  return { x, y };
}

function readAreaMarker(objectLayer: HomeYardObjectLayer, markerName: string): HomeYardAreaMarker {
  const object = findRequiredMarker(objectLayer, markerName);
  const x = readRequiredNumber(object, markerName, "x");
  const y = readRequiredNumber(object, markerName, "y");
  const width = readRequiredNumber(object, markerName, "width");
  const height = readRequiredNumber(object, markerName, "height");

  return { height, width, x, y };
}

function findRequiredMarker(
  objectLayer: HomeYardObjectLayer,
  markerName: string,
): HomeYardTiledObject {
  const object = objectLayer.objects.find((candidate) => candidate.name === markerName);

  if (object === undefined) {
    throw new Error(`Missing home yard marker: ${markerName}`);
  }

  return object;
}

function readRequiredNumber(
  object: HomeYardTiledObject,
  markerName: string,
  propertyName: "x" | "y" | "width" | "height",
): number {
  const value = object[propertyName];

  if (typeof value !== "number") {
    throw new Error(`Home yard marker ${markerName} is missing numeric ${propertyName}`);
  }

  return value;
}
```

- [ ] **Step 4: Verify marker parser tests pass**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMarkers.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit marker parser**

Run:

```bash
git add apps/game/src/game/maps/homeYardMarkers.ts apps/game/src/game/maps/homeYardMarkers.test.ts
git commit -m "feat: read home yard map markers"
```

---

### Task 5: Phaser Map Creation In GameScene

**Files:**

- Create: `apps/game/src/game/maps/createHomeYardMap.ts`
- Modify: `apps/game/src/game/scenes/GameScene.ts`
- Modify: `apps/game/src/game/scenes/scenes.test.ts`

- [ ] **Step 1: Add the Phaser map factory**

Create `apps/game/src/game/maps/createHomeYardMap.ts`:

```ts
import Phaser from "phaser";

import {
  HOME_YARD_LAYER_COLLISION_BLOCKOUT,
  HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY,
  HOME_YARD_LAYER_GROUND_BASE,
  HOME_YARD_LAYER_HOUSE_BLOCKOUT,
  HOME_YARD_LAYER_YARD_AND_PATH,
  HOME_YARD_MAP_KEY,
  HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
} from "./homeYardMap";
import { type HomeYardMarkers, readHomeYardMarkers } from "./homeYardMarkers";

export type HomeYardMapRuntime = {
  readonly map: Phaser.Tilemaps.Tilemap;
  readonly layers: {
    readonly groundBase: Phaser.Tilemaps.TilemapLayer;
    readonly yardAndPath: Phaser.Tilemaps.TilemapLayer;
    readonly houseBlockout: Phaser.Tilemaps.TilemapLayer;
    readonly decorSoftBoundary: Phaser.Tilemaps.TilemapLayer;
    readonly collisionBlockout: Phaser.Tilemaps.TilemapLayer;
  };
  readonly markers: HomeYardMarkers;
};

export function createHomeYardMap(scene: Phaser.Scene): HomeYardMapRuntime {
  const map = scene.make.tilemap({ key: HOME_YARD_MAP_KEY });
  const tileset = map.addTilesetImage(HOME_YARD_TILESET_NAME, HOME_YARD_TILESET_KEY);

  if (tileset === null) {
    throw new Error(`Missing home yard tileset: ${HOME_YARD_TILESET_NAME}`);
  }

  const groundBase = createRequiredLayer(map, HOME_YARD_LAYER_GROUND_BASE, tileset);
  const yardAndPath = createRequiredLayer(map, HOME_YARD_LAYER_YARD_AND_PATH, tileset);
  const houseBlockout = createRequiredLayer(map, HOME_YARD_LAYER_HOUSE_BLOCKOUT, tileset);
  const decorSoftBoundary = createRequiredLayer(map, HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY, tileset);
  const collisionBlockout = createRequiredLayer(map, HOME_YARD_LAYER_COLLISION_BLOCKOUT, tileset);
  const objectLayer = map.getObjectLayer(HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS);

  if (objectLayer === null) {
    throw new Error(`Missing home yard object layer: ${HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS}`);
  }

  collisionBlockout.setCollisionByProperty({ collides: true });
  collisionBlockout.setAlpha(0.35);
  collisionBlockout.setVisible(import.meta.env.DEV);

  scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  return {
    layers: {
      collisionBlockout,
      decorSoftBoundary,
      groundBase,
      houseBlockout,
      yardAndPath,
    },
    map,
    markers: readHomeYardMarkers(objectLayer),
  };
}

function createRequiredLayer(
  map: Phaser.Tilemaps.Tilemap,
  layerName: string,
  tileset: Phaser.Tilemaps.Tileset,
): Phaser.Tilemaps.TilemapLayer {
  const layer = map.createLayer(layerName, tileset);

  if (layer === null) {
    throw new Error(`Missing home yard tile layer: ${layerName}`);
  }

  return layer;
}
```

- [ ] **Step 2: Replace placeholder text in GameScene with the home-yard map**

Modify `apps/game/src/game/scenes/GameScene.ts`:

```ts
import Phaser from "phaser";

import { createHomeYardMap } from "../maps/createHomeYardMap";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    const homeYardMap = createHomeYardMap(this);

    if (import.meta.env.DEV) {
      addDebugMarker(
        this,
        homeYardMap.markers.playerSpawn.x,
        homeYardMap.markers.playerSpawn.y,
        0x38bdf8,
      );
      addDebugMarker(
        this,
        homeYardMap.markers.dogSpawn.x,
        homeYardMap.markers.dogSpawn.y,
        0xfacc15,
      );
    }
  }
}

function addDebugMarker(scene: Phaser.Scene, x: number, y: number, color: number): void {
  scene.add.circle(x, y, 8, color, 0.9).setDepth(100);
}
```

- [ ] **Step 3: Keep scene construction tests passing**

Run:

```bash
pnpm --filter @louis-world/game test -- scenes.test.ts
```

Expected: pass.

- [ ] **Step 4: Verify focused map-related tests pass**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts homeYardAssets.test.ts homeYardMarkers.test.ts scenes.test.ts
```

Expected: pass.

- [ ] **Step 5: Verify typecheck**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

Expected: pass.

- [ ] **Step 6: Commit Phaser map creation**

Run:

```bash
git add apps/game/src/game/maps/createHomeYardMap.ts apps/game/src/game/scenes/GameScene.ts apps/game/src/game/scenes/scenes.test.ts
git commit -m "feat: render home yard map blockout"
```

---

### Task 6: Browser Verification And Final Checks

**Files:**

- No source files expected.
- Use the local Vite dev server for visual verification.

- [ ] **Step 1: Run full game package tests**

Run:

```bash
pnpm --filter @louis-world/game test
```

Expected: pass.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm --filter @louis-world/game build
```

Expected: pass.

- [ ] **Step 3: Start the dev server**

Run:

```bash
pnpm dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 4: Verify the blockout in the browser**

Open the local URL and confirm:

```text
- The map fills the canvas width.
- The house blockout sits slightly above center.
- The yard sits directly below the house.
- Door, yard path, and locked path align on the x 19~20 center axis.
- The blue debug marker appears at player_spawn.
- The yellow debug marker appears at dog_spawn.
- The red collision blockout is visible in development and marks house walls, map edges, and the locked path.
```

- [ ] **Step 5: Stop the dev server**

Stop the running dev server with `Ctrl+C`.

- [ ] **Step 6: Run repository-level lightweight checks**

Run:

```bash
pnpm --filter @louis-world/game typecheck
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
git diff --check
```

Expected: all commands pass and `git diff --check` prints no whitespace errors.

- [ ] **Step 7: Commit final verification note if docs changed during execution**

If execution adds or changes documentation while verifying, commit those docs:

```bash
git add docs/learning/home-yard-map-blockout.md docs/superpowers/plans/2026-05-24-home-yard-map-blockout.md
git commit -m "docs: document home yard map learning notes"
```

If no docs changed during execution, do not create a commit for this step.

---

## Self-Review Notes

- Spec coverage: map dimensions, tile size, coordinate plan, Tiled layer structure, Phaser loading direction, marker parsing, browser verification, and testing are each covered by a task.
- Scope check: this plan does not add player movement, dog AI, door transitions, house interior, real art, feeding, petting, ball play, or day loop behavior.
- Type consistency: map keys, tileset keys, layer names, object names, and marker names are defined once in `homeYardMap.ts` and imported by loader, parser, and map factory modules.

# Home Yard 24px Tileset Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing home-yard blockout to load `StarRealmsCozyForestPack24x24.png` as a 24px PNG tileset.

**Architecture:** Keep the existing map module boundaries. `homeYardMap.ts` remains the source for Phaser asset keys and coordinate constants, `homeYardAssets.ts` remains the loader adapter, and `home-yard-blockout.json` remains the runtime Tiled JSON source for layer and marker data. This plan changes metadata and loading only; it does not remap visual tile IDs to create final art.

**Tech Stack:** Phaser 4.1, Vite, TypeScript, Vitest, Tiled JSON, PNG tileset assets.

---

## File Map

- Modify `apps/game/src/game/maps/homeYardMap.ts`: change tileset name, URL, image dimensions, and tile size constants to the 24px Star Realms tileset.
- Modify `apps/game/src/game/maps/homeYardMap.test.ts`: verify the 24px constants and updated pixel-center conversions.
- Modify `apps/game/src/game/maps/homeYardAssets.ts`: load the tileset with `loader.image` instead of `loader.svg`.
- Modify `apps/game/src/game/maps/homeYardAssets.test.ts`: verify PNG image loading instead of SVG loading.
- Create `apps/game/src/game/maps/homeYardTilemapJson.test.ts`: verify the actual Tiled JSON references the 24px PNG tileset and that gameplay markers are on the 24px coordinate grid.
- Modify `apps/game/public/assets/tilemaps/home-yard-blockout.json`: update map/tile metadata, tileset metadata, and object marker pixel coordinates to 24px.
- Add `apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png`: include the user-provided tileset asset in the implementation commit.

Do not remove `apps/game/public/assets/tilesets/home-yard-placeholder.svg` in this plan. It is unused after the wiring change, but deleting it is separate cleanup.

---

### Task 1: Map Constants And PNG Loader

**Files:**

- Modify: `apps/game/src/game/maps/homeYardMap.test.ts`
- Modify: `apps/game/src/game/maps/homeYardAssets.test.ts`
- Modify: `apps/game/src/game/maps/homeYardMap.ts`
- Modify: `apps/game/src/game/maps/homeYardAssets.ts`
- Add: `apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png`

- [ ] **Step 1: Update the map metadata test first**

Replace `apps/game/src/game/maps/homeYardMap.test.ts` with:

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
  HOME_YARD_TILESET_IMAGE_HEIGHT,
  HOME_YARD_TILESET_IMAGE_WIDTH,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
  HOME_YARD_TILESET_URL,
  HOME_YARD_YARD_AREA,
  isHomeYardTileAreaInsideMap,
  tileToPixelCenter,
} from "./homeYardMap";

describe("home yard map metadata", () => {
  it("uses the approved map keys and 24px Star Realms tileset dimensions", () => {
    expect(HOME_YARD_MAP_KEY).toBe("home-yard-map");
    expect(HOME_YARD_TILESET_KEY).toBe("home-yard-tiles");
    expect(HOME_YARD_TILESET_NAME).toBe("StarRealmsCozyForestPack24x24");
    expect(HOME_YARD_TILESET_URL).toBe("tilesets/StarRealmsCozyForestPack24x24.png");
    expect(HOME_YARD_TILESET_IMAGE_WIDTH).toBe(480);
    expect(HOME_YARD_TILESET_IMAGE_HEIGHT).toBe(576);
    expect(HOME_YARD_MAP_WIDTH_IN_TILES).toBe(40);
    expect(HOME_YARD_MAP_HEIGHT_IN_TILES).toBe(24);
    expect(HOME_YARD_TILE_SIZE).toBe(24);
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

  it("converts approved spawn tile coordinates to 24px pixel centers", () => {
    expect(tileToPixelCenter(HOME_YARD_PLAYER_SPAWN)).toEqual({ x: 468, y: 276 });
    expect(tileToPixelCenter(HOME_YARD_DOG_SPAWN)).toEqual({ x: 492, y: 324 });
  });
});
```

- [ ] **Step 2: Update the asset loader test first**

Replace `apps/game/src/game/maps/homeYardAssets.test.ts` with:

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
  it("queues the approved Tiled map and Star Realms PNG tileset", () => {
    const calls: LoaderCall[] = [];
    const loader = {
      tilemapTiledJSON(key: string, url: string): void {
        calls.push({ method: "tilemapTiledJSON", key, url });
      },
      image(key: string, url: string): void {
        calls.push({ method: "image", key, url });
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
        key: "home-yard-tiles",
        method: "image",
        url: "tilesets/StarRealmsCozyForestPack24x24.png",
      },
    ]);
  });
});
```

- [ ] **Step 3: Run the focused tests and verify they fail**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts homeYardAssets.test.ts
```

Expected: FAIL. `homeYardMap.test.ts` should still see `home-yard-placeholder`, SVG URL, `224 x 32`, and `32` tile size. `homeYardAssets.test.ts` should still see an `svg` loader call instead of an `image` loader call.

- [ ] **Step 4: Update the map constants**

Replace `apps/game/src/game/maps/homeYardMap.ts` with:

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
export const HOME_YARD_TILESET_NAME = "StarRealmsCozyForestPack24x24";
export const HOME_YARD_TILESET_URL = "tilesets/StarRealmsCozyForestPack24x24.png";
export const HOME_YARD_TILESET_IMAGE_WIDTH = 480;
export const HOME_YARD_TILESET_IMAGE_HEIGHT = 576;

export const HOME_YARD_MAP_WIDTH_IN_TILES = 40;
export const HOME_YARD_MAP_HEIGHT_IN_TILES = 24;
export const HOME_YARD_TILE_SIZE = 24;

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

- [ ] **Step 5: Update the asset loader implementation**

Replace `apps/game/src/game/maps/homeYardAssets.ts` with:

```ts
import {
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_URL,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_URL,
} from "./homeYardMap";

export type HomeYardAssetLoader = {
  tilemapTiledJSON: (key: string, url: string) => void;
  image: (key: string, url: string) => void;
};

export function preloadHomeYardMapAssets(loader: HomeYardAssetLoader): void {
  loader.tilemapTiledJSON(HOME_YARD_MAP_KEY, HOME_YARD_MAP_URL);
  loader.image(HOME_YARD_TILESET_KEY, HOME_YARD_TILESET_URL);
}
```

- [ ] **Step 6: Run the focused tests and verify they pass**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts homeYardAssets.test.ts
```

Expected: PASS for `homeYardMap.test.ts` and `homeYardAssets.test.ts`.

- [ ] **Step 7: Commit the constants, loader, tests, and PNG asset**

Run:

```bash
git add apps/game/src/game/maps/homeYardMap.ts apps/game/src/game/maps/homeYardMap.test.ts apps/game/src/game/maps/homeYardAssets.ts apps/game/src/game/maps/homeYardAssets.test.ts apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
git commit -m "feat: load home yard 24px tileset"
```

---

### Task 2: Tilemap JSON Metadata

**Files:**

- Create: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`
- Modify: `apps/game/public/assets/tilemaps/home-yard-blockout.json`

- [ ] **Step 1: Add the failing tilemap JSON test**

Create `apps/game/src/game/maps/homeYardTilemapJson.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import tilemapJsonText from "../../../public/assets/tilemaps/home-yard-blockout.json?raw";

type TiledTileProperty = {
  readonly name: string;
  readonly type: string;
  readonly value: boolean;
};

type TiledTile = {
  readonly id: number;
  readonly properties: readonly TiledTileProperty[];
};

type TiledTileset = {
  readonly columns: number;
  readonly firstgid: number;
  readonly image: string;
  readonly imageheight: number;
  readonly imagewidth: number;
  readonly margin: number;
  readonly name: string;
  readonly spacing: number;
  readonly tilecount: number;
  readonly tileheight: number;
  readonly tiles: readonly TiledTile[];
  readonly tilewidth: number;
};

type TiledObject = {
  readonly height: number;
  readonly name: string;
  readonly width: number;
  readonly x: number;
  readonly y: number;
};

type TiledLayer = {
  readonly name: string;
  readonly objects?: readonly TiledObject[];
};

type TiledMap = {
  readonly layers: readonly TiledLayer[];
  readonly tileheight: number;
  readonly tilesets: readonly TiledTileset[];
  readonly tilewidth: number;
};

const tilemap: TiledMap = JSON.parse(tilemapJsonText);

describe("home yard tilemap JSON", () => {
  it("uses the Star Realms 24px tileset metadata", () => {
    expect(tilemap.tilewidth).toBe(24);
    expect(tilemap.tileheight).toBe(24);
    expect(tilemap.tilesets).toEqual([
      {
        columns: 20,
        firstgid: 1,
        image: "../tilesets/StarRealmsCozyForestPack24x24.png",
        imageheight: 576,
        imagewidth: 480,
        margin: 0,
        name: "StarRealmsCozyForestPack24x24",
        spacing: 0,
        tilecount: 480,
        tileheight: 24,
        tiles: [
          {
            id: 5,
            properties: [{ name: "collides", type: "bool", value: true }],
          },
        ],
        tilewidth: 24,
      },
    ]);
  });

  it("keeps gameplay markers aligned to the 24px tile grid", () => {
    const objectLayer = findRequiredLayer(tilemap, "gameplay_markers");

    expect(findRequiredObject(objectLayer, "player_spawn")).toMatchObject({
      height: 0,
      width: 0,
      x: 468,
      y: 276,
    });
    expect(findRequiredObject(objectLayer, "dog_spawn")).toMatchObject({
      height: 0,
      width: 0,
      x: 492,
      y: 324,
    });
    expect(findRequiredObject(objectLayer, "house_door")).toMatchObject({
      height: 24,
      width: 48,
      x: 456,
      y: 240,
    });
    expect(findRequiredObject(objectLayer, "locked_path")).toMatchObject({
      height: 24,
      width: 48,
      x: 456,
      y: 456,
    });
  });
});

function findRequiredLayer(tilemap: TiledMap, layerName: string): TiledLayer {
  const layer = tilemap.layers.find((candidate) => candidate.name === layerName);

  if (layer === undefined) {
    throw new Error(`Missing tilemap layer in test fixture: ${layerName}`);
  }

  return layer;
}

function findRequiredObject(layer: TiledLayer, objectName: string): TiledObject {
  const object = layer.objects?.find((candidate) => candidate.name === objectName);

  if (object === undefined) {
    throw new Error(`Missing tilemap object in test fixture: ${objectName}`);
  }

  return object;
}
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected: FAIL because the JSON still uses `tilewidth: 32`, `tileheight: 32`, `home-yard-placeholder.svg`, `224 x 32`, and 32px object coordinates.

- [ ] **Step 3: Patch the Tiled JSON metadata and marker coordinates**

Apply this patch to `apps/game/public/assets/tilemaps/home-yard-blockout.json`:

```diff
*** Begin Patch
*** Update File: apps/game/public/assets/tilemaps/home-yard-blockout.json
@@
-          "x": 624,
-          "y": 368
+          "x": 468,
+          "y": 276
@@
-          "x": 656,
-          "y": 432
+          "x": 492,
+          "y": 324
@@
-          "height": 32,
+          "height": 24,
@@
-          "width": 64,
-          "x": 608,
-          "y": 320
+          "width": 48,
+          "x": 456,
+          "y": 240
@@
-          "height": 32,
+          "height": 24,
@@
-          "width": 64,
-          "x": 608,
-          "y": 608
+          "width": 48,
+          "x": 456,
+          "y": 456
@@
-  "tileheight": 32,
+  "tileheight": 24,
@@
-      "columns": 7,
+      "columns": 20,
@@
-      "image": "../tilesets/home-yard-placeholder.svg",
-      "imageheight": 32,
-      "imagewidth": 224,
+      "image": "../tilesets/StarRealmsCozyForestPack24x24.png",
+      "imageheight": 576,
+      "imagewidth": 480,
@@
-      "name": "home-yard-placeholder",
+      "name": "StarRealmsCozyForestPack24x24",
@@
-      "tilecount": 7,
-      "tileheight": 32,
+      "tilecount": 480,
+      "tileheight": 24,
@@
-      "tilewidth": 32
+      "tilewidth": 24
@@
-  "tilewidth": 32,
+  "tilewidth": 24,
*** End Patch
```

- [ ] **Step 4: Run the new test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the tilemap JSON metadata test and JSON update**

Run:

```bash
git add apps/game/src/game/maps/homeYardTilemapJson.test.ts apps/game/public/assets/tilemaps/home-yard-blockout.json
git commit -m "test: verify home yard 24px tilemap metadata"
```

---

### Task 3: Full Verification

**Files:**

- No file edits.

- [ ] **Step 1: Run the focused map and loader tests**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts homeYardAssets.test.ts homeYardTilemapJson.test.ts
```

Expected: PASS for all focused tests.

- [ ] **Step 2: Run the full game test suite**

Run:

```bash
pnpm --filter @louis-world/game test
```

Expected: PASS for the full `@louis-world/game` test suite.

- [ ] **Step 3: Run the production build**

Run:

```bash
pnpm --filter @louis-world/game build
```

Expected: exit code `0`. TypeScript should pass and Vite should build the game.

- [ ] **Step 4: Check the final diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: no unstaged source changes from the implementation tasks. If generated or formatted changes remain, inspect them before committing or reporting completion.

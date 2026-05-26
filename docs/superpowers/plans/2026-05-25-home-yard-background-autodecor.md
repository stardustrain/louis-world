# Home Yard Background Autodecor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a deterministic first-pass decorated background for the existing 54x30 home-yard map while preserving the house, yard, markers, and locked path.

**Architecture:** Keep runtime Phaser code unchanged. Add a Node ESM generator script that owns the Star Realms tile palette, placement rules, and Tiled JSON output, then verify the generated fixture through Vitest. The generator writes the existing runtime map path so Tiled and Phaser continue to load the same JSON file.

**Tech Stack:** Node 24 ESM scripts, Tiled JSON, Phaser 4.1, Vite, TypeScript, Vitest, PNG tileset assets.

---

## File Map

- Create `apps/game/scripts/createHomeYardStarRealmsMap.mjs`: deterministic 24px Star Realms home-yard map generator.
- Modify `apps/game/package.json`: add `generate:home-yard-map` script.
- Modify `apps/game/public/assets/tilemaps/home-yard-blockout.json`: generated output from the new script.
- Modify `apps/game/src/game/maps/homeYardTilemapJson.test.ts`: add fixture tests that protect structural areas and verify background decoration.
- Do not modify `apps/game/src/game/maps/createHomeYardMap.ts`: runtime layer creation already works with Tiled JSON.
- Do not modify `apps/game/src/game/maps/homeYardMap.ts` except if local state is missing the already approved 54x30 constants.

## Existing Dirty State

The worktree already contains uncommitted changes for the 54x30 map expansion:

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
apps/game/src/game/maps/homeYardMap.test.ts
apps/game/src/game/maps/homeYardMap.ts
apps/game/src/game/maps/homeYardTilemapJson.test.ts
```

Do not revert these changes. This plan assumes the implementation starts from that 54x30 state.

---

### Task 1: Add Fixture Guard Tests

**Files:**

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Add explicit tile fixture constants near `const tilemap`**

Add this block after `const tilemap: TiledMap = JSON.parse(tilemapJsonText);`:

```ts
const mapWidth = 54;
const emptyGid = 0;
const yardGid = 2;
const pathGid = 3;
const houseGid = 4;
const collisionGid = 6;
const lockedPathHintGid = 7;

const houseArea = { x: 22, y: 7, width: 10, height: 7 };
const yardArea = { x: 20, y: 14, width: 14, height: 8 };
const doorArea = { x: 26, y: 13, width: 2, height: 1 };
const pathArea = { x: 26, y: 14, width: 2, height: 8 };
const lockedPathArea = { x: 26, y: 22, width: 2, height: 1 };
const playerSpawnTile = { x: 26, y: 14 };
const dogSpawnTile = { x: 27, y: 16 };
```

- [ ] **Step 2: Add structural preservation tests**

Add these tests inside `describe("homeYardTilemapJson", () => { ... })`:

```ts
it("집, 마당, 문, 길, 잠긴 길의 구조적 타일 배치를 유지합니다.", () => {
  const yardAndPath = findRequiredTileLayer(tilemap, "yard_and_path");
  const houseBlockout = findRequiredTileLayer(tilemap, "house_blockout");
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

  expectAreaToUseTile(houseBlockout, houseArea, houseGid);
  expectYardAndPathStructure(yardAndPath);
  expectAreaToUseTile(yardAndPath, lockedPathArea, lockedPathHintGid);
  expectCollisionHouseStructure(collisionBlockout);
  expectAreaToUseTile(collisionBlockout, lockedPathArea, collisionGid);
});

it("배경 장식이 집, 마당, 길, 스폰 타일을 침범하지 않습니다.", () => {
  const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

  expectAreaToUseTile(decorSoftBoundary, houseArea, emptyGid);
  expectAreaToUseTile(decorSoftBoundary, yardArea, emptyGid);
  expectAreaToUseTile(decorSoftBoundary, pathArea, emptyGid);
  expectTileToBe(decorSoftBoundary, playerSpawnTile.x, playerSpawnTile.y, emptyGid);
  expectTileToBe(decorSoftBoundary, dogSpawnTile.x, dogSpawnTile.y, emptyGid);
  expectAreaToUseTile(collisionBlockout, pathArea, emptyGid);
  expectTileToBe(collisionBlockout, playerSpawnTile.x, playerSpawnTile.y, emptyGid);
  expectTileToBe(collisionBlockout, dogSpawnTile.x, dogSpawnTile.y, emptyGid);
});

it("배경에는 자동 생성된 바닥 변형과 여러 장식 타일이 있습니다.", () => {
  const groundBase = findRequiredTileLayer(tilemap, "ground_base");
  const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");

  expect(countUniqueNonEmptyTiles(groundBase)).toBeGreaterThanOrEqual(3);
  expect(countNonEmptyTiles(decorSoftBoundary)).toBeGreaterThanOrEqual(48);
  expect(countUniqueNonEmptyTiles(decorSoftBoundary)).toBeGreaterThanOrEqual(6);
});

it("충돌 레이어는 승인된 충돌 GID만 사용합니다.", () => {
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");
  const nonEmptyCollisionGids = new Set(collisionBlockout.data.filter((gid) => gid !== emptyGid));

  expect([...nonEmptyCollisionGids]).toEqual([collisionGid]);
});
```

- [ ] **Step 3: Add helper functions at the bottom of the test file**

Keep existing helper functions and add these below them:

```ts
function findRequiredTileLayer(tilemap: TiledMap, layerName: string): TiledTileLayer {
  const layer = findRequiredLayer(tilemap, layerName);

  if (!isTileLayer(layer)) {
    throw new Error(`Expected layer "${layerName}" to be a tile layer.`);
  }

  return layer;
}

function expectYardAndPathStructure(layer: TiledTileLayer): void {
  forEachTileInArea(yardArea, (tileX, tileY) => {
    const expectedGid = isTileInsideArea({ x: tileX, y: tileY }, pathArea) ? pathGid : yardGid;
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectCollisionHouseStructure(layer: TiledTileLayer): void {
  forEachTileInArea(houseArea, (tileX, tileY) => {
    const expectedGid = isTileInsideArea({ x: tileX, y: tileY }, doorArea)
      ? emptyGid
      : collisionGid;
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectAreaToUseTile(
  layer: TiledTileLayer,
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  expectedGid: number,
): void {
  forEachTileInArea(area, (tileX, tileY) => {
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectTileToBe(
  layer: TiledTileLayer,
  tileX: number,
  tileY: number,
  expectedGid: number,
): void {
  expect(readTile(layer, tileX, tileY)).toBe(expectedGid);
}

function readTile(layer: TiledTileLayer, tileX: number, tileY: number): number {
  return layer.data[tileY * mapWidth + tileX] ?? emptyGid;
}

function countNonEmptyTiles(layer: TiledTileLayer): number {
  return layer.data.filter((gid) => gid !== emptyGid).length;
}

function countUniqueNonEmptyTiles(layer: TiledTileLayer): number {
  return new Set(layer.data.filter((gid) => gid !== emptyGid)).size;
}

function forEachTileInArea(
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  callback: (tileX: number, tileY: number) => void,
): void {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      callback(tileX, tileY);
    }
  }
}

function isTileInsideArea(
  tile: { readonly x: number; readonly y: number },
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
): boolean {
  return (
    tile.x >= area.x &&
    tile.y >= area.y &&
    tile.x < area.x + area.width &&
    tile.y < area.y + area.height
  );
}
```

- [ ] **Step 4: Run the focused fixture test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected: FAIL because the current map uses a single ground GID and too few unique decoration GIDs.

---

### Task 2: Add The Star Realms Generator

**Files:**

- Create: `apps/game/scripts/createHomeYardStarRealmsMap.mjs`
- Modify: `apps/game/package.json`
- Modify: `apps/game/public/assets/tilemaps/home-yard-blockout.json`

- [ ] **Step 1: Add the package script**

In `apps/game/package.json`, add the script entry after `build`:

```json
"generate:home-yard-map": "node scripts/createHomeYardStarRealmsMap.mjs",
```

The scripts block should include:

```json
{
  "dev": "vite --host 0.0.0.0",
  "build": "tsc --noEmit && vite build",
  "generate:home-yard-map": "node scripts/createHomeYardStarRealmsMap.mjs",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 2: Create the generator file**

Create `apps/game/scripts/createHomeYardStarRealmsMap.mjs` with this structure:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const gameDirectory = resolve(scriptDirectory, "..");

const tileSize = 24;
const mapWidth = 54;
const mapHeight = 30;
const tilesetColumns = 20;
const tilesetTileCount = 480;
const seed = 1701;

const paths = {
  tilemap: resolve(gameDirectory, "public/assets/tilemaps/home-yard-blockout.json"),
};

const gid = {
  empty: 0,
  yard: 2,
  path: 3,
  house: 4,
  collision: 6,
  lockedPathHint: 7,
};

const palette = {
  grassBase: tile(2, 0),
  grassVariants: [tile(2, 1), tile(2, 2), tile(3, 0), tile(3, 1)],
  flowers: [tile(3, 8), tile(3, 9), tile(3, 10), tile(3, 11), tile(3, 12), tile(3, 13)],
  stones: [tile(3, 14), tile(4, 14)],
  shrubs: [tile(8, 10), tile(8, 11), tile(9, 10), tile(10, 10)],
};

const areas = {
  house: { x: 22, y: 7, width: 10, height: 7 },
  yard: { x: 20, y: 14, width: 14, height: 8 },
  door: { x: 26, y: 13, width: 2, height: 1 },
  path: { x: 26, y: 14, width: 2, height: 8 },
  lockedPath: { x: 26, y: 22, width: 2, height: 1 },
};

const objects = {
  playerSpawn: { name: "player_spawn", tileX: 26, tileY: 14 },
  dogSpawn: { name: "dog_spawn", tileX: 27, tileY: 16 },
};

const treeStamps = [
  createRectangleStamp("small_tree", 5, 10, 4, 5, [
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
  ]),
  createRectangleStamp("large_tree", 5, 14, 5, 7, [
    { x: 2, y: 5 },
    { x: 2, y: 6 },
  ]),
];

await mkdir(dirname(paths.tilemap), { recursive: true });
await writeFile(paths.tilemap, `${JSON.stringify(createTilemapJson(), null, 2)}\n`, "utf8");

function createTilemapJson() {
  const collisionData = createCollisionBlockoutData();
  const decorData = createDecorSoftBoundaryData(collisionData);

  return {
    compressionlevel: -1,
    height: mapHeight,
    infinite: false,
    layers: [
      createTileLayer(1, "ground_base", createGroundBaseData()),
      createTileLayer(2, "yard_and_path", createYardAndPathData()),
      createTileLayer(3, "house_blockout", createHouseBlockoutData()),
      createTileLayer(4, "decor_soft_boundary", decorData),
      createTileLayer(5, "collision_blockout", collisionData, false),
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
        columns: tilesetColumns,
        firstgid: 1,
        image: "../tilesets/StarRealmsCozyForestPack24x24.png",
        imageheight: 576,
        imagewidth: 480,
        margin: 0,
        name: "StarRealmsCozyForestPack24x24",
        spacing: 0,
        tilecount: tilesetTileCount,
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
```

- [ ] **Step 3: Add the generator helper functions**

Continue the same file with these helpers:

```js
function createGroundBaseData() {
  const random = createSeededRandom(seed);
  const data = createFilledData(palette.grassBase);

  for (let tileY = 0; tileY < mapHeight; tileY += 1) {
    for (let tileX = 0; tileX < mapWidth; tileX += 1) {
      if (isProtectedGroundTile(tileX, tileY)) {
        continue;
      }

      const zone = resolveZone(tileX, tileY);
      const variationChance = zone === "edge" ? 0.35 : 0.16;

      if (random() < variationChance) {
        setTile(data, tileX, tileY, pick(random, palette.grassVariants));
      }
    }
  }

  return data;
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

function createDecorSoftBoundaryData(collisionData) {
  const random = createSeededRandom(seed + 11);
  const data = createEmptyData();

  placeTreeStamps(data, collisionData);
  scatterSmallDecor(data, random);

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

function placeTreeStamps(decorData, collisionData) {
  const placements = [
    { x: 4, y: 4, stamp: treeStamps[0] },
    { x: 42, y: 5, stamp: treeStamps[1] },
    { x: 5, y: 21, stamp: treeStamps[0] },
    { x: 41, y: 19, stamp: treeStamps[0] },
  ];

  for (const placement of placements) {
    placeStampIfOpen(decorData, collisionData, placement.stamp, placement.x, placement.y);
  }
}

function scatterSmallDecor(data, random) {
  for (let tileY = 1; tileY < mapHeight - 1; tileY += 1) {
    for (let tileX = 1; tileX < mapWidth - 1; tileX += 1) {
      if (readTile(data, tileX, tileY) !== gid.empty || isProtectedDecorTile(tileX, tileY)) {
        continue;
      }

      const zone = resolveZone(tileX, tileY);
      const roll = random();
      const density = zone === "edge" ? 0.12 : zone === "near_yard" ? 0.035 : 0.075;

      if (roll >= density) {
        continue;
      }

      if (roll < density * 0.45) {
        setTile(data, tileX, tileY, pick(random, palette.flowers));
      } else if (roll < density * 0.72) {
        setTile(data, tileX, tileY, pick(random, palette.shrubs));
      } else {
        setTile(data, tileX, tileY, pick(random, palette.stones));
      }
    }
  }
}
```

- [ ] **Step 4: Add shared helpers and Tiled object output**

Finish the same file with these helpers:

```js
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

function createRectangleStamp(name, startRow, startColumn, width, height, collisionTiles) {
  return {
    collisionTiles,
    height,
    name,
    rows: Array.from({ length: height }, (_, rowOffset) =>
      Array.from({ length: width }, (_, columnOffset) =>
        tile(startRow + rowOffset, startColumn + columnOffset),
      ),
    ),
    width,
  };
}

function placeStampIfOpen(decorData, collisionData, stamp, originX, originY) {
  if (!canPlaceStamp(stamp, originX, originY)) {
    return;
  }

  for (let localY = 0; localY < stamp.height; localY += 1) {
    for (let localX = 0; localX < stamp.width; localX += 1) {
      setTile(decorData, originX + localX, originY + localY, stamp.rows[localY][localX]);
    }
  }

  for (const collisionTile of stamp.collisionTiles) {
    setTile(collisionData, originX + collisionTile.x, originY + collisionTile.y, gid.collision);
  }
}

function canPlaceStamp(stamp, originX, originY) {
  for (let localY = 0; localY < stamp.height; localY += 1) {
    for (let localX = 0; localX < stamp.width; localX += 1) {
      const tileX = originX + localX;
      const tileY = originY + localY;

      if (!isInsideMap(tileX, tileY) || isProtectedDecorTile(tileX, tileY)) {
        return false;
      }
    }
  }

  return true;
}

function resolveZone(tileX, tileY) {
  if (tileX <= 4 || tileY <= 4 || tileX >= mapWidth - 5 || tileY >= mapHeight - 5) {
    return "edge";
  }

  if (tileY < areas.house.y || tileY > areas.lockedPath.y) {
    return "background";
  }

  if (
    Math.abs(tileX - areas.yard.x) <= 5 ||
    Math.abs(tileX - (areas.yard.x + areas.yard.width)) <= 5
  ) {
    return "near_yard";
  }

  return "background";
}

function isProtectedGroundTile(tileX, tileY) {
  return isInsideArea(tileX, tileY, areas.house) || isInsideArea(tileX, tileY, areas.yard);
}

function isProtectedDecorTile(tileX, tileY) {
  return (
    isInsideArea(tileX, tileY, areas.house) ||
    isInsideArea(tileX, tileY, areas.yard) ||
    isInsideArea(tileX, tileY, areas.path) ||
    isInsideArea(tileX, tileY, areas.door) ||
    isInsideArea(tileX, tileY, areas.lockedPath) ||
    isSpawnTile(tileX, tileY)
  );
}

function isSpawnTile(tileX, tileY) {
  return (
    (tileX === objects.playerSpawn.tileX && tileY === objects.playerSpawn.tileY) ||
    (tileX === objects.dogSpawn.tileX && tileY === objects.dogSpawn.tileY)
  );
}

function isInsideArea(tileX, tileY, area) {
  return (
    tileX >= area.x &&
    tileY >= area.y &&
    tileX < area.x + area.width &&
    tileY < area.y + area.height
  );
}

function isInsideMap(tileX, tileY) {
  return tileX >= 0 && tileY >= 0 && tileX < mapWidth && tileY < mapHeight;
}

function createEmptyData() {
  return createFilledData(gid.empty);
}

function createFilledData(value) {
  return Array.from({ length: mapWidth * mapHeight }, () => value);
}

function fillArea(data, area, value) {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      setTile(data, tileX, tileY, value);
    }
  }
}

function setTile(data, tileX, tileY, value) {
  data[tileY * mapWidth + tileX] = value;
}

function readTile(data, tileX, tileY) {
  return data[tileY * mapWidth + tileX] ?? gid.empty;
}

function tile(row, column) {
  return row * tilesetColumns + column + 1;
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function createSeededRandom(initialSeed) {
  let state = initialSeed >>> 0;

  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
```

- [ ] **Step 5: Run the generator**

Run:

```bash
pnpm --filter @louis-world/game generate:home-yard-map
```

Expected: `apps/game/public/assets/tilemaps/home-yard-blockout.json` is rewritten deterministically.

- [ ] **Step 6: Run the focused fixture test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the generator and fixture output**

Run:

```bash
git add apps/game/package.json apps/game/scripts/createHomeYardStarRealmsMap.mjs apps/game/public/assets/tilemaps/home-yard-blockout.json apps/game/src/game/maps/homeYardTilemapJson.test.ts
git commit -m "feat: generate home yard background decor"
```

---

### Task 3: Full Game Verification

**Files:**

- No new files.
- Verify all modified files from Task 2.

- [ ] **Step 1: Run all game tests**

Run:

```bash
pnpm --filter @louis-world/game test
```

Expected: PASS.

- [ ] **Step 2: Run the game build**

Run:

```bash
pnpm --filter @louis-world/game build
```

Expected: PASS.

- [ ] **Step 3: Commit verification-only fixes if needed**

If Task 3 reveals formatting, type, or test issues caused by Task 2, fix only those issues and commit:

```bash
git add apps/game/package.json apps/game/scripts/createHomeYardStarRealmsMap.mjs apps/game/public/assets/tilemaps/home-yard-blockout.json apps/game/src/game/maps/homeYardTilemapJson.test.ts
git commit -m "fix: stabilize home yard generated map"
```

If Task 3 passes without changes, do not create an empty commit.

---

### Task 4: Visual Review

**Files:**

- No planned file edits.
- Only edit files if visual review exposes a concrete issue with generated placement.

- [ ] **Step 1: Start the local dev server**

Run:

```bash
pnpm --filter @louis-world/game dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 2: Open the game in a browser**

Use the browser tool on the local URL. Confirm:

```text
house remains centered
yard remains below the house
player and dog debug markers remain at the approved spawn positions in dev
background has visible grass variation and decoration
large tree or shrub collisions do not block the yard, path, door, or spawn tiles
```

- [ ] **Step 3: Adjust palette or placement only if the first result is visibly broken**

If the result is visibly broken, adjust only these constants in `apps/game/scripts/createHomeYardStarRealmsMap.mjs`:

```js
const palette = {
  grassBase: tile(2, 0),
  grassVariants: [tile(2, 1), tile(2, 2), tile(3, 0), tile(3, 1)],
  flowers: [tile(3, 8), tile(3, 9), tile(3, 10), tile(3, 11), tile(3, 12), tile(3, 13)],
  stones: [tile(3, 14), tile(4, 14)],
  shrubs: [tile(8, 10), tile(8, 11), tile(9, 10), tile(10, 10)],
};

const placements = [
  { x: 4, y: 4, stamp: treeStamps[0] },
  { x: 42, y: 5, stamp: treeStamps[1] },
  { x: 5, y: 21, stamp: treeStamps[0] },
  { x: 41, y: 19, stamp: treeStamps[0] },
];
```

Then rerun:

```bash
pnpm --filter @louis-world/game generate:home-yard-map
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
```

Expected: PASS.

- [ ] **Step 4: Commit visual review adjustments if any**

If Step 3 changed files, commit:

```bash
git add apps/game/scripts/createHomeYardStarRealmsMap.mjs apps/game/public/assets/tilemaps/home-yard-blockout.json
git commit -m "fix: tune home yard background decor"
```

---

## Final Verification

Run these before claiming completion:

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game build
```

If the dev server was started for visual review, stop it before the final response unless the user asks to keep it running.

# Home Yard Tilemap JSON Test Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `homeYardTilemapJson.test.ts` so it verifies the current manually edited home yard tilemap instead of rejecting intentional map-layer changes.

**Architecture:** Treat the current implementation files as the source of truth. Do not edit or regenerate `home-yard-blockout.json`, `createHomeYardStarRealmsMap.mjs`, `homeYardMap.ts`, `homeYardAssets.ts`, or Phaser runtime code in this plan. Only update the JSON fixture test to assert the current layer responsibilities and approved GID sets.

**Tech Stack:** Vitest, TypeScript, Vite raw JSON import, Tiled JSON tile layer data.

---

## File Structure

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`
  - Responsibility: validates the checked-in `home-yard-blockout.json` fixture.
  - This is the only editable implementation file for this plan.
- Read-only reference: `apps/game/public/assets/tilemaps/home-yard-blockout.json`
  - Responsibility: current manually edited tilemap fixture and implementation source of truth.
- Read-only reference: `docs/superpowers/specs/2026-05-26-home-yard-collision-debug-tileset-design.md`
  - Responsibility: states that manual implementation should not be reverted and broken tests should be aligned to current intent.

## Current Failure

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Current expected result before this plan is implemented:

```text
FAIL src/game/maps/homeYardTilemapJson.test.ts
3 failed:
- 배경 장식이 집, 마당, 길, 스폰 타일을 침범하지 않습니다.
- 배경에는 승인된 바닥 GID와 여러 장식 타일이 있습니다.
- 충돌 레이어는 승인된 충돌 GID만 사용합니다.
```

The current tilemap has these intentional facts:

```text
ground_base unique non-empty GIDs: 82, 142
decor_soft_boundary unique non-empty GIDs: 2, 3, 7
decor_soft_boundary non-empty tile count: 114
collision_blockout unique non-empty GIDs:
6, 121, 122, 123, 369, 370, 372, 373, 389, 390, 392, 393, 429, 430, 432, 453
collision_blockout row 7:
121, 122 x 52, 123
```

## Task 1: Capture Current Test Failure

**Files:**

- Test: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Run the focused failing test**

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected: FAIL with the same 3 failing test cases listed in "Current Failure".

- [ ] **Step 2: Confirm no implementation file is staged**

```bash
git status --short
```

Expected: existing user changes may appear, but this plan must not stage or edit these files:

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
apps/game/scripts/createHomeYardStarRealmsMap.mjs
apps/game/src/game/maps/homeYardMap.ts
apps/game/src/game/maps/homeYardAssets.ts
apps/game/src/game/maps/createHomeYardMap.ts
```

## Task 2: Update Test Constants To Match Current Fixture Intent

**Files:**

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Add explicit approved GID constants**

In `apps/game/src/game/maps/homeYardTilemapJson.test.ts`, replace the current constants near the top:

```typescript
const collisionGid = 6;
const lockedPathHintGid = 7;
const approvedGroundBaseGids = [82, 142];
```

with:

```typescript
const collisionGid = 6;
const hillBoundaryLeftGid = 121;
const hillBoundaryMiddleGid = 122;
const hillBoundaryRightGid = 123;
const lockedPathHintGid = 7;
const approvedGroundBaseGids = [82, 142];
const approvedDecorSoftBoundaryGids = [yardGid, pathGid, lockedPathHintGid];
const approvedCollisionBlockoutGids = [
  collisionGid,
  hillBoundaryLeftGid,
  hillBoundaryMiddleGid,
  hillBoundaryRightGid,
  369,
  370,
  372,
  373,
  389,
  390,
  392,
  393,
  429,
  430,
  432,
  453,
];
const hillBoundaryRowTileY = 6;
```

- [ ] **Step 2: Add an explicit expected hill boundary row**

Directly below `const dogSpawnTile = { x: 27, y: 16 };`, add:

```typescript
const hillBoundaryRow = [
  hillBoundaryLeftGid,
  ...Array(52).fill(hillBoundaryMiddleGid),
  hillBoundaryRightGid,
];
```

- [ ] **Step 3: Verify TypeScript accepts the constants**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

Expected: this may still fail later if unrelated dirty worktree files are incomplete, but it must not report a syntax error from `homeYardTilemapJson.test.ts`.

## Task 3: Align Decor And Collision Assertions

**Files:**

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Replace the decor intrusion test**

Replace the current test:

```typescript
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
```

with:

```typescript
it("시각 보조 레이어가 집을 침범하지 않고 마당, 길, 잠긴 길 표시를 유지합니다.", () => {
  const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

  expectAreaToUseTile(decorSoftBoundary, houseArea, emptyGid);
  expectYardAndPathStructure(decorSoftBoundary);
  expectAreaToUseTile(decorSoftBoundary, lockedPathArea, lockedPathHintGid);
  expectAreaToUseTile(collisionBlockout, pathArea, emptyGid);
  expectTileToBe(collisionBlockout, playerSpawnTile.x, playerSpawnTile.y, emptyGid);
  expectTileToBe(collisionBlockout, dogSpawnTile.x, dogSpawnTile.y, emptyGid);
});
```

Failure condition: this test fails if `decor_soft_boundary` stops carrying the current manual yard/path/locked-path visual data, if it covers the house, or if collision blocks the playable path/spawn cells.

- [ ] **Step 2: Replace the background GID summary test**

Replace the current test:

```typescript
it("배경에는 승인된 바닥 GID와 여러 장식 타일이 있습니다.", () => {
  const groundBase = findRequiredTileLayer(tilemap, "ground_base");
  const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");
  const groundBaseGids = new Set(groundBase.data.filter((gid) => gid !== emptyGid));

  expect([...groundBaseGids].sort((leftGid, rightGid) => leftGid - rightGid)).toEqual(
    approvedGroundBaseGids,
  );
  expect(countNonEmptyTiles(decorSoftBoundary)).toBeGreaterThanOrEqual(48);
  expect(countUniqueNonEmptyTiles(decorSoftBoundary)).toBeGreaterThanOrEqual(6);
});
```

with:

```typescript
it("시각 레이어가 현재 승인된 GID 집합만 사용합니다.", () => {
  const groundBase = findRequiredTileLayer(tilemap, "ground_base");
  const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");

  expect(readUniqueNonEmptyGids(groundBase)).toEqual(approvedGroundBaseGids);
  expect(readUniqueNonEmptyGids(decorSoftBoundary)).toEqual(approvedDecorSoftBoundaryGids);
  expect(countNonEmptyTiles(decorSoftBoundary)).toBe(114);
});
```

Failure condition: this test fails if the checked-in fixture introduces an unapproved visual GID into `ground_base` or `decor_soft_boundary`, or if the current manual decor coverage changes.

- [ ] **Step 3: Replace the collision GID test**

Replace the current test:

```typescript
it("충돌 레이어는 승인된 충돌 GID만 사용합니다.", () => {
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");
  const nonEmptyCollisionGids = new Set(collisionBlockout.data.filter((gid) => gid !== emptyGid));

  expect([...nonEmptyCollisionGids]).toEqual([collisionGid]);
});
```

with:

```typescript
it("충돌 레이어는 현재 승인된 경계와 충돌 GID만 사용합니다.", () => {
  const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

  expect(readUniqueNonEmptyGids(collisionBlockout)).toEqual(approvedCollisionBlockoutGids);
  expect(readRow(collisionBlockout, hillBoundaryRowTileY)).toEqual(hillBoundaryRow);
});
```

Failure condition: this test fails if `collision_blockout` loses the manually placed hill boundary row or introduces any GID outside the currently approved boundary/collision set.

## Task 4: Replace Duplicated GID Helper Logic

**Files:**

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Add row and unique-GID helpers**

Replace the helper:

```typescript
function countUniqueNonEmptyTiles(layer: TiledTileLayer): number {
  return new Set(layer.data.filter((gid) => gid !== emptyGid)).size;
}
```

with:

```typescript
function readUniqueNonEmptyGids(layer: TiledTileLayer): readonly number[] {
  return [...new Set(layer.data.filter((gid) => gid !== emptyGid))].sort(
    (leftGid, rightGid) => leftGid - rightGid,
  );
}

function readRow(layer: TiledTileLayer, tileY: number): readonly number[] {
  return layer.data.slice(tileY * mapWidth, (tileY + 1) * mapWidth);
}
```

- [ ] **Step 2: Confirm there are no references to the removed helper**

Run:

```bash
rg -n "countUniqueNonEmptyTiles" apps/game/src/game/maps/homeYardTilemapJson.test.ts
```

Expected: no matches.

## Task 5: Verify Focused Test And Full Game Test

**Files:**

- Test: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Run the focused tilemap JSON test**

```bash
pnpm --filter @louis-world/game test -- homeYardTilemapJson.test.ts
```

Expected:

```text
PASS src/game/maps/homeYardTilemapJson.test.ts
7 passed
```

- [ ] **Step 2: Run all game tests**

```bash
pnpm --filter @louis-world/game test
```

Expected: PASS. If another test fails due to existing dirty implementation files, do not modify implementation files in this plan. Record the failing test name and stop for user direction.

- [ ] **Step 3: Run build**

```bash
pnpm --filter @louis-world/game build
```

Expected: PASS. If build fails due to existing dirty implementation files outside `homeYardTilemapJson.test.ts`, do not modify implementation files in this plan. Record the error and stop for user direction.

## Task 6: Commit Test Alignment

**Files:**

- Modify: `apps/game/src/game/maps/homeYardTilemapJson.test.ts`

- [ ] **Step 1: Confirm only the test file is staged for this plan**

```bash
git status --short
```

Expected: `apps/game/src/game/maps/homeYardTilemapJson.test.ts` is modified. Other user-modified files may remain modified but must not be staged by this plan.

- [ ] **Step 2: Stage only the test file**

```bash
git add apps/game/src/game/maps/homeYardTilemapJson.test.ts
```

- [ ] **Step 3: Confirm staged files**

```bash
git diff --cached --name-only
```

Expected:

```text
apps/game/src/game/maps/homeYardTilemapJson.test.ts
```

- [ ] **Step 4: Commit**

```bash
git commit -m "test: align home yard tilemap fixture expectations"
```

Expected: commit succeeds and includes only `apps/game/src/game/maps/homeYardTilemapJson.test.ts`.

## Self-Review

- Spec coverage: The plan preserves manual implementation files, updates `homeYardTilemapJson.test.ts`, verifies the focused fixture test, and runs full game test/build.
- Placeholder scan: No red-flag placeholders or unspecified implementation steps remain.
- Type consistency: All helper names used by test replacements are defined in Task 4. All constants used by test replacements are defined in Task 2.

# Celestial Objects Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare `CelestialObjects.png` as a Phaser Texture Atlas for home-yard celestial decor without placing any objects on screen.

**Architecture:** Keep the source PNG as one file under `public/assets/images`, add a Phaser JSON Hash atlas beside it, then expose the atlas through the existing home-yard asset loading boundary. Runtime placement stays out of scope; this plan only makes named frames loadable for future user-led decoration work.

**Tech Stack:** Phaser 4.1 loader, Vite public assets, TypeScript constants, Vitest raw asset fixture tests, PNG and JSON static assets.

---

## File Map

- Create `apps/game/public/assets/images/celestial-objects.png`: copied source PNG from `/Users/lucashan/Downloads/CelestialObjects/CelestialObjects.png`.
- Create `apps/game/public/assets/images/celestial-objects.json`: Phaser JSON Hash atlas containing moons, dwarf stars, asteroids, and star clusters.
- Create `apps/game/src/game/maps/celestialObjectsAtlasJson.test.ts`: verifies atlas metadata, frame names, and frame bounds.
- Modify `apps/game/src/game/maps/homeYardMap.ts`: add atlas key and asset URL constants.
- Modify `apps/game/src/game/maps/homeYardMap.test.ts`: verify new atlas constants.
- Modify `apps/game/src/game/maps/homeYardAssets.ts`: extend the loader interface and queue the atlas.
- Modify `apps/game/src/game/maps/homeYardAssets.test.ts`: verify preload queues the atlas.
- Do not modify `apps/game/src/game/scenes/GameScene.ts`.
- Do not modify `apps/game/public/assets/tilemaps/home-yard-blockout.json`.
- Do not modify `apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png`.

## Existing Dirty State

The worktree currently has unrelated uncommitted map asset changes:

```text
apps/game/public/assets/tilemaps/home-yard-blockout.json
apps/game/public/assets/tilesets/StarRealmsCozyForestPack24x24.png
apps/game/scripts/createHomeYardStarRealmsMap.mjs
apps/game/src/game/maps/homeYardMap.test.ts
apps/game/src/game/maps/homeYardMap.ts
apps/game/src/game/maps/homeYardTilemapJson.test.ts
```

Do not revert or overwrite those changes. When committing implementation tasks, stage only the files listed in that task.

---

### Task 1: Add Atlas Fixture Guard

**Files:**

- Create: `apps/game/src/game/maps/celestialObjectsAtlasJson.test.ts`
- Create: `apps/game/public/assets/images/celestial-objects.png`
- Create: `apps/game/public/assets/images/celestial-objects.json`

- [ ] **Step 1: Write the failing atlas JSON test**

Create `apps/game/src/game/maps/celestialObjectsAtlasJson.test.ts` with this content:

```ts
import atlasJsonText from "../../../public/assets/images/celestial-objects.json?raw";

type AtlasFrameRect = {
  readonly h: number;
  readonly w: number;
  readonly x: number;
  readonly y: number;
};

type AtlasFrame = {
  readonly frame: AtlasFrameRect;
  readonly rotated: boolean;
  readonly sourceSize: {
    readonly h: number;
    readonly w: number;
  };
  readonly spriteSourceSize: AtlasFrameRect;
  readonly trimmed: boolean;
};

type AtlasJson = {
  readonly frames: Record<string, AtlasFrame>;
  readonly meta: {
    readonly image: string;
    readonly size: {
      readonly h: number;
      readonly w: number;
    };
  };
};

const atlas: AtlasJson = JSON.parse(atlasJsonText);
const sourceImageSize = { w: 384, h: 256 };
const expectedFrames: Record<string, AtlasFrameRect> = {
  asteroid_01: { x: 0, y: 224, w: 32, h: 32 },
  asteroid_02: { x: 34, y: 226, w: 60, h: 30 },
  asteroid_03: { x: 100, y: 232, w: 25, h: 18 },
  asteroid_04: { x: 137, y: 235, w: 13, h: 11 },
  dwarf_star_01: { x: 128, y: 192, w: 32, h: 32 },
  dwarf_star_02: { x: 160, y: 192, w: 32, h: 32 },
  dwarf_star_03: { x: 192, y: 192, w: 32, h: 32 },
  dwarf_star_04: { x: 224, y: 192, w: 32, h: 32 },
  moon_01: { x: 0, y: 192, w: 32, h: 32 },
  moon_02: { x: 32, y: 192, w: 32, h: 32 },
  moon_03: { x: 64, y: 192, w: 32, h: 32 },
  moon_04: { x: 96, y: 192, w: 32, h: 32 },
  star_cluster_01: { x: 160, y: 225, w: 32, h: 31 },
  star_cluster_02: { x: 196, y: 229, w: 27, h: 25 },
  star_cluster_03: { x: 224, y: 224, w: 32, h: 30 },
};

describe("celestialObjectsAtlasJson", () => {
  it("uses the copied celestial objects PNG as its source image", () => {
    expect(atlas.meta.image).toBe("celestial-objects.png");
    expect(atlas.meta.size).toEqual(sourceImageSize);
  });

  it("defines only the approved home-yard decor frames", () => {
    expect(Object.keys(atlas.frames).sort()).toEqual(Object.keys(expectedFrames).sort());
  });

  it("keeps every approved frame at its source sprite rectangle", () => {
    for (const [frameName, expectedFrame] of Object.entries(expectedFrames)) {
      expect(atlas.frames[frameName]?.frame).toEqual(expectedFrame);
    }
  });

  it("keeps all frame rectangles inside the source image bounds", () => {
    for (const frame of Object.values(atlas.frames)) {
      const frameRightEdge = frame.frame.x + frame.frame.w;
      const frameBottomEdge = frame.frame.y + frame.frame.h;

      expect(frame.frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.frame.y).toBeGreaterThanOrEqual(0);
      expect(frameRightEdge).toBeLessThanOrEqual(sourceImageSize.w);
      expect(frameBottomEdge).toBeLessThanOrEqual(sourceImageSize.h);
    }
  });

  it("uses untrimmed frame metadata matching each frame rectangle", () => {
    for (const frame of Object.values(atlas.frames)) {
      expect(frame.rotated).toBe(false);
      expect(frame.trimmed).toBe(false);
      expect(frame.spriteSourceSize).toEqual({
        x: 0,
        y: 0,
        w: frame.frame.w,
        h: frame.frame.h,
      });
      expect(frame.sourceSize).toEqual({
        w: frame.frame.w,
        h: frame.frame.h,
      });
    }
  });
});
```

- [ ] **Step 2: Run the focused atlas fixture test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- celestialObjectsAtlasJson.test.ts
```

Expected: FAIL because `../../../public/assets/images/celestial-objects.json?raw` does not exist yet.

- [ ] **Step 3: Copy the source PNG into the public image assets folder**

Run:

```bash
cp /Users/lucashan/Downloads/CelestialObjects/CelestialObjects.png apps/game/public/assets/images/celestial-objects.png
```

- [ ] **Step 4: Create the atlas JSON**

Create `apps/game/public/assets/images/celestial-objects.json` with this exact content:

```json
{
  "frames": {
    "asteroid_01": {
      "frame": { "x": 0, "y": 224, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "asteroid_02": {
      "frame": { "x": 34, "y": 226, "w": 60, "h": 30 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 60, "h": 30 },
      "sourceSize": { "w": 60, "h": 30 }
    },
    "asteroid_03": {
      "frame": { "x": 100, "y": 232, "w": 25, "h": 18 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 25, "h": 18 },
      "sourceSize": { "w": 25, "h": 18 }
    },
    "asteroid_04": {
      "frame": { "x": 137, "y": 235, "w": 13, "h": 11 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 13, "h": 11 },
      "sourceSize": { "w": 13, "h": 11 }
    },
    "dwarf_star_01": {
      "frame": { "x": 128, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "dwarf_star_02": {
      "frame": { "x": 160, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "dwarf_star_03": {
      "frame": { "x": 192, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "dwarf_star_04": {
      "frame": { "x": 224, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "moon_01": {
      "frame": { "x": 0, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "moon_02": {
      "frame": { "x": 32, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "moon_03": {
      "frame": { "x": 64, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "moon_04": {
      "frame": { "x": 96, "y": 192, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "star_cluster_01": {
      "frame": { "x": 160, "y": 225, "w": 32, "h": 31 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 31 },
      "sourceSize": { "w": 32, "h": 31 }
    },
    "star_cluster_02": {
      "frame": { "x": 196, "y": 229, "w": 27, "h": 25 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 27, "h": 25 },
      "sourceSize": { "w": 27, "h": 25 }
    },
    "star_cluster_03": {
      "frame": { "x": 224, "y": 224, "w": 32, "h": 30 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 30 },
      "sourceSize": { "w": 32, "h": 30 }
    }
  },
  "meta": {
    "app": "louis-world",
    "format": "RGBA8888",
    "image": "celestial-objects.png",
    "scale": "1",
    "size": { "w": 384, "h": 256 }
  }
}
```

- [ ] **Step 5: Run the focused atlas fixture test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- celestialObjectsAtlasJson.test.ts
```

Expected: PASS for `celestialObjectsAtlasJson`.

- [ ] **Step 6: Commit the atlas fixture**

Run:

```bash
git add apps/game/public/assets/images/celestial-objects.png apps/game/public/assets/images/celestial-objects.json apps/game/src/game/maps/celestialObjectsAtlasJson.test.ts
git commit -m "feat: add celestial objects atlas asset"
```

---

### Task 2: Add Home-Yard Atlas Constants

**Files:**

- Modify: `apps/game/src/game/maps/homeYardMap.test.ts`
- Modify: `apps/game/src/game/maps/homeYardMap.ts`

- [ ] **Step 1: Write the failing constants test**

In `apps/game/src/game/maps/homeYardMap.test.ts`, add these imports to the existing import block:

```ts
  HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
  HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
  HOME_YARD_CELESTIAL_ATLAS_KEY,
```

Then add this assertion block inside the existing `"승인된 맵 키와 24px Star Realms 타일셋 치수를 사용합니다."` test, after the tileset URL assertion:

```ts
expect(HOME_YARD_CELESTIAL_ATLAS_KEY).toBe("home-yard-celestial-objects");
expect(HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL).toBe("images/celestial-objects.png");
expect(HOME_YARD_CELESTIAL_ATLAS_JSON_URL).toBe("images/celestial-objects.json");
```

- [ ] **Step 2: Run the focused constants test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts
```

Expected: FAIL because `HOME_YARD_CELESTIAL_ATLAS_KEY`, `HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL`, and `HOME_YARD_CELESTIAL_ATLAS_JSON_URL` are not exported yet.

- [ ] **Step 3: Add the atlas constants**

In `apps/game/src/game/maps/homeYardMap.ts`, add these constants after `HOME_YARD_TILESET_URL`:

```ts
export const HOME_YARD_CELESTIAL_ATLAS_KEY = "home-yard-celestial-objects";
export const HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL = "images/celestial-objects.png";
export const HOME_YARD_CELESTIAL_ATLAS_JSON_URL = "images/celestial-objects.json";
```

- [ ] **Step 4: Run the focused constants test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardMap.test.ts
```

Expected: PASS for `homeYardMap`.

- [ ] **Step 5: Commit the atlas constants**

Run:

```bash
git add apps/game/src/game/maps/homeYardMap.ts apps/game/src/game/maps/homeYardMap.test.ts
git commit -m "feat: add home yard celestial atlas constants"
```

---

### Task 3: Queue The Atlas In The Home-Yard Preload

**Files:**

- Modify: `apps/game/src/game/maps/homeYardAssets.test.ts`
- Modify: `apps/game/src/game/maps/homeYardAssets.ts`

- [ ] **Step 1: Write the failing preload test**

Replace the `LoaderCall` type in `apps/game/src/game/maps/homeYardAssets.test.ts` with this union:

```ts
type LoaderCall =
  | {
      readonly key: string;
      readonly method: "tilemapTiledJSON" | "image";
      readonly url: string;
    }
  | {
      readonly atlasURL: string;
      readonly key: string;
      readonly method: "atlas";
      readonly textureURL: string;
    };
```

Add this method to the `loader` test double, after `image`:

```ts
      atlas(key: string, textureURL: string, atlasURL: string): void {
        calls.push({ atlasURL, key, method: "atlas", textureURL });
      },
```

Then add this expected call after the existing `"home-yard-tiles"` image call:

```ts
      {
        atlasURL: "images/celestial-objects.json",
        key: "home-yard-celestial-objects",
        method: "atlas",
        textureURL: "images/celestial-objects.png",
      },
```

- [ ] **Step 2: Run the focused preload test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardAssets.test.ts
```

Expected: FAIL because `preloadHomeYardMapAssets` does not queue the celestial atlas yet.

- [ ] **Step 3: Add atlas loading to the home-yard asset loader**

In `apps/game/src/game/maps/homeYardAssets.ts`, add these imports to the import block:

```ts
  HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
  HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
  HOME_YARD_CELESTIAL_ATLAS_KEY,
```

Update `HomeYardAssetLoader` to include:

```ts
  atlas: (key: string, textureURL: string, atlasURL: string) => void;
```

Then add this line at the end of `preloadHomeYardMapAssets`:

```ts
loader.atlas(
  HOME_YARD_CELESTIAL_ATLAS_KEY,
  HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
  HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
);
```

- [ ] **Step 4: Run the focused preload test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- homeYardAssets.test.ts
```

Expected: PASS for `preloadHomeYardMapAssets`.

- [ ] **Step 5: Commit the preload wiring**

Run:

```bash
git add apps/game/src/game/maps/homeYardAssets.ts apps/game/src/game/maps/homeYardAssets.test.ts
git commit -m "feat: preload celestial objects atlas"
```

---

### Task 4: Final Verification

**Files:**

- Verify only; no expected file edits.

- [ ] **Step 1: Run the game test suite**

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

- [ ] **Step 3: Inspect staged and unstaged changes**

Run:

```bash
git status --short
```

Expected: only pre-existing unrelated map changes remain unstaged, or the working tree is clean if those changes were committed separately outside this plan. There should be no uncommitted files from the celestial atlas implementation.

---

## Notes For Future Placement Work

Once this plan is implemented, runtime placement can use:

```ts
scene.add.image(x, y, HOME_YARD_CELESTIAL_ATLAS_KEY, "moon_01");
```

Depth, camera behavior, and exact map placement are intentionally left for the next user-led step.

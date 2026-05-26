# Player Dog Movement Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise player movement speed to `140px/s` and tune dog follow speed and start distance so the dog keeps the same relative pace while reacting sooner.

**Architecture:** This is a narrow tuning change in two Phaser-free logic modules. Keep the existing player movement vector calculation and dog follow state machine intact; only update constants and tests that encode the approved movement numbers.

**Tech Stack:** TypeScript, Vitest, Phaser Arcade Physics integration through existing presenters and scene wiring.

---

## Scope Check

The approved spec covers one cohesive movement-tuning task. It does not introduce new AI, pathfinding, collision behavior, input handling, or interaction-distance changes.

## File Structure

- Modify: `apps/game/src/game/systems/playerMovement/playerMovement.ts`
  - Owns the exported player movement speed constant and movement intent resolution.
- Modify: `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`
  - Verifies the player movement speed, facing behavior, and diagonal normalization.
- Modify: `apps/game/src/game/systems/playerMovement/PlayerKeyboardController.test.ts`
  - Verifies the keyboard controller applies the exported player movement speed to the player target.
- Modify: `apps/game/src/game/systems/dogFollow/dogFollow.ts`
  - Owns the exported dog follow start distance, stop distance, speed, target offset, and follow intent resolution.
- Modify: `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`
  - Verifies dog follow state transitions, target selection, speed, and zero-velocity protection.

No new files are required.

## Task 1: Tune Player Movement Speed

**Files:**

- Modify: `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`
- Modify: `apps/game/src/game/systems/playerMovement/PlayerKeyboardController.test.ts`
- Modify: `apps/game/src/game/systems/playerMovement/playerMovement.ts`

- [ ] **Step 1: Update the player movement diagonal expectation**

In `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`, update only the numeric diagonal axis expectations in the diagonal normalization test. Keep the rest of the file unchanged.

```ts
test("대각선 입력은 한 방향 이동과 같은 속도로 정규화합니다.", () => {
  const intent = resolvePlayerMovementIntent({
    down: false,
    left: false,
    right: true,
    up: true,
  });

  expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(PLAYER_MOVEMENT_SPEED);
  expect(intent.velocity.x).toBeCloseTo(98.9949, 4);
  expect(intent.velocity.y).toBeCloseTo(-98.9949, 4);
});
```

- [ ] **Step 2: Add an explicit player speed constant test**

In `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`, add this test near the top of `describe("resolvePlayerMovementIntent", ...)`, before the no-input behavior test.

```ts
test("플레이어 기본 이동 속도는 140px/s입니다.", () => {
  expect(PLAYER_MOVEMENT_SPEED).toBe(140);
});
```

- [ ] **Step 3: Run player movement tests and verify the expected failure**

Run:

```bash
pnpm --filter @louis-world/game test -- playerMovement
```

Expected: FAIL. The new constant test should show `expected 120 to be 140`, and the diagonal axis expectation should fail because the implementation still uses speed `120`.

- [ ] **Step 4: Update the player movement implementation constant**

In `apps/game/src/game/systems/playerMovement/playerMovement.ts`, change the exported speed constant to `140`.

```ts
export const PLAYER_MOVEMENT_SPEED = 140;
export const DEFAULT_PLAYER_FACING: FacingDirection = "down";
```

- [ ] **Step 5: Run player movement and keyboard controller tests**

Run:

```bash
pnpm --filter @louis-world/game test -- playerMovement PlayerKeyboardController
```

Expected: PASS. The player movement tests should use the `140px/s` constant, and `PlayerKeyboardController.test.ts` should continue passing because it imports `PLAYER_MOVEMENT_SPEED` rather than hardcoding `120`.

- [ ] **Step 6: Commit the player speed tuning**

Run:

```bash
git add apps/game/src/game/systems/playerMovement/playerMovement.ts apps/game/src/game/systems/playerMovement/playerMovement.test.ts apps/game/src/game/systems/playerMovement/PlayerKeyboardController.test.ts
git commit -m "feat: tune player movement speed"
```

Expected: commit succeeds. If `git status --short` shows `PlayerKeyboardController.test.ts` unchanged, omit that path from `git add`.

## Task 2: Tune Dog Follow Speed And Start Distance

**Files:**

- Modify: `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`
- Modify: `apps/game/src/game/systems/dogFollow/dogFollow.ts`

- [ ] **Step 1: Update moving-player target test velocities**

In `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`, change the `movingPlayerTargetTestCases` player velocity fixtures from `120` to `140`. These fixtures only need to be non-zero to mark the player as moving, but matching the new player speed keeps the test data coherent.

```ts
const movingPlayerTargetTestCases: readonly MovingPlayerTargetTestCase[] = [
  ["up", { x: 0, y: -140 }, { x: 100, y: 148 }],
  ["down", { x: 0, y: 140 }, { x: 100, y: 52 }],
  ["left", { x: -140, y: 0 }, { x: 148, y: 100 }],
  ["right", { x: 140, y: 0 }, { x: 52, y: 100 }],
];
```

- [ ] **Step 2: Update dog follow start-distance tests**

In `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`, replace the current `96px` start-distance tests with `80px` expectations.

```ts
test("안정 상태에서 주인과 80px 이상 멀어지면 따라오기 시작합니다.", () => {
  const intent = resolveDogFollowIntent({
    dogPosition: { x: 0, y: 0 },
    playerFacing: "right",
    playerPosition: { x: 80, y: 0 },
    playerVelocity: { x: 140, y: 0 },
    previousState: { mode: "settled" },
  });

  expect(intent.mode).toBe("following");
  expect(intent.shouldCollideWithPlayer).toBe(false);
});
```

```ts
test("안정 상태에서 주인과 80px보다 가까우면 안정 상태를 유지합니다.", () => {
  const intent = resolveDogFollowIntent({
    dogPosition: { x: 0, y: 0 },
    playerFacing: "right",
    playerPosition: { x: 79, y: 0 },
    playerVelocity: { x: 0, y: 0 },
    previousState: { mode: "settled" },
  });

  expect(intent.mode).toBe("settled");
});
```

- [ ] **Step 3: Update dog follow speed test data and label**

In `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`, update the dog speed test to expect the exported constant after the implementation changes to `105`.

```ts
test("따라오는 velocity 크기는 105px/s입니다.", () => {
  const intent = resolveDogFollowIntent({
    dogPosition: { x: 0, y: 0 },
    playerFacing: "right",
    playerPosition: { x: 120, y: 0 },
    playerVelocity: { x: 140, y: 0 },
    previousState: { mode: "settled" },
  });

  expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(DOG_FOLLOW_SPEED);
});
```

- [ ] **Step 4: Add explicit dog tuning constant tests**

In `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`, update the import to include `DOG_FOLLOW_START_DISTANCE`.

```ts
import {
  createInitialDogFollowState,
  DOG_FOLLOW_SPEED,
  DOG_FOLLOW_START_DISTANCE,
  resolveDogFollowIntent,
} from "./dogFollow";
```

Then add this test near the top of `describe("resolveDogFollowIntent", ...)`, before the start-distance behavior test.

```ts
test("강아지 따라오기 시작 거리는 80px이고 속도는 105px/s입니다.", () => {
  expect(DOG_FOLLOW_START_DISTANCE).toBe(80);
  expect(DOG_FOLLOW_SPEED).toBe(105);
});
```

- [ ] **Step 5: Run dog follow tests and verify the expected failure**

Run:

```bash
pnpm --filter @louis-world/game test -- dogFollow
```

Expected: FAIL. The explicit constant test should show the old start distance `96` and speed `90`, and the `80px` start-distance behavior should remain settled until the implementation changes.

- [ ] **Step 6: Update dog follow implementation constants**

In `apps/game/src/game/systems/dogFollow/dogFollow.ts`, change only these exported constants.

```ts
export const DOG_FOLLOW_START_DISTANCE = 80;
export const DOG_FOLLOW_STOP_DISTANCE = 56;
export const DOG_FOLLOW_SPEED = 105;
export const DOG_FOLLOW_TARGET_OFFSET = 48;
```

- [ ] **Step 7: Run dog follow tests**

Run:

```bash
pnpm --filter @louis-world/game test -- dogFollow
```

Expected: PASS. Existing stop-distance, target selection, and zero-velocity tests should still pass.

- [ ] **Step 8: Commit the dog follow tuning**

Run:

```bash
git add apps/game/src/game/systems/dogFollow/dogFollow.ts apps/game/src/game/systems/dogFollow/dogFollow.test.ts
git commit -m "feat: tune dog follow movement"
```

Expected: commit succeeds.

## Task 3: Full Verification

**Files:**

- Verify only; no planned code changes.

- [ ] **Step 1: Run the game package test suite**

Run:

```bash
pnpm --filter @louis-world/game test
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm --filter @louis-world/game build
```

Expected: PASS. Vite should produce a production build after `tsc --noEmit`.

- [ ] **Step 4: Inspect working tree**

Run:

```bash
git status --short
```

Expected: no uncommitted changes from the implementation tasks. If a formatter changed files during commit hooks, review the diff and commit only relevant formatting changes.

## Self-Review

- Spec coverage: Task 1 covers `PLAYER_MOVEMENT_SPEED = 140`; Task 2 covers `DOG_FOLLOW_SPEED = 105` and `DOG_FOLLOW_START_DISTANCE = 80`; Task 3 covers test, typecheck, and build verification.
- Scope check: The plan does not add AI, pathfinding, collision policy changes, interaction-distance changes, or new files.
- Placeholder scan: No unresolved placeholder wording or vague implementation steps remain.
- Type consistency: All referenced exports already exist except `DOG_FOLLOW_START_DISTANCE` in the test import, and that export already exists in `dogFollow.ts`.

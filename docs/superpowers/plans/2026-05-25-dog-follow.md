# Dog Follow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first dog follow behavior so the dog gently follows the player back into a
comfortable distance while preserving map collision and existing petting reactions.

**Architecture:** Add a Phaser-free `dogFollow` system that calculates follow mode, target position,
velocity, and player collision policy. Keep Phaser-specific sprite movement in `DogPresenter`, and
keep `GameScene` as the composition layer that passes player and dog runtime data between systems.

**Tech Stack:** TypeScript, Phaser 4 Arcade Physics, Vitest, Vite, pnpm workspace scripts.

---

## Scope Check

This plan implements one subsystem: the dog follow behavior for the first home yard prototype.

It does not implement pathfinding, obstacle recovery, teleporting, mood-based speed changes, call
input, feeding, ball play, day loop integration, or final dog animation.

## File Structure

- Create: `apps/game/src/game/systems/dogFollow/dogFollow.ts`
  - Pure follow rules: state transition, target selection, velocity, and player collision policy.
- Create: `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`
  - Contract tests for distances, target selection, speed, collision policy, and finite velocity.
- Modify: `apps/game/src/game/objects/DogPresenter.ts`
  - Let the dog physics sprite move by follow intent and keep the visual ring aligned with the dog.
- Modify: `apps/game/src/game/scenes/GameScene.ts`
  - Store dog follow state, add dog-vs-map collision, store player-vs-dog collider, and apply follow
    intent every frame.

## Task 1: Pure Dog Follow System

**Files:**

- Create: `apps/game/src/game/systems/dogFollow/dogFollow.ts`
- Create: `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/game/src/game/systems/dogFollow/dogFollow.test.ts`:

```ts
import { createInitialDogFollowState, DOG_FOLLOW_SPEED, resolveDogFollowIntent } from "./dogFollow";

describe("dogFollow", () => {
  describe("createInitialDogFollowState", () => {
    test("강아지는 안정된 상태로 시작합니다.", () => {
      expect(createInitialDogFollowState()).toEqual({ mode: "settled" });
    });
  });

  describe("resolveDogFollowIntent", () => {
    test("안정 상태에서 주인과 96px 이상 멀어지면 따라오기 시작합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 96, y: 0 },
        playerVelocity: { x: 120, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(intent.mode).toBe("following");
      expect(intent.shouldCollideWithPlayer).toBe(false);
    });

    test("따라오는 중 주인과 56px 안쪽에 들어오면 안정 상태가 됩니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 60, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 100, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent).toMatchObject({
        mode: "settled",
        shouldCollideWithPlayer: true,
        velocity: { x: 0, y: 0 },
      });
    });

    test("따라오는 중 주인과 56px보다 멀면 따라오기를 유지합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 72, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent.mode).toBe("following");
    });

    test("안정 상태에서 주인과 96px보다 가까우면 안정 상태를 유지합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 80, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(intent.mode).toBe("settled");
    });

    test("따라오는 velocity 크기는 90px/s입니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 120, y: 0 },
        playerVelocity: { x: 120, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(DOG_FOLLOW_SPEED);
    });

    test("주인이 움직이는 중에는 facing 반대 방향 목표를 선택합니다.", () => {
      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 100, y: 260 },
          playerFacing: "up",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: -120 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 100, y: 148 });

      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 260, y: 100 },
          playerFacing: "left",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: -120, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 148, y: 100 });
    });

    test("주인이 멈춰 있고 위나 아래를 보면 더 가까운 좌우 목표를 선택합니다.", () => {
      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 0, y: 100 },
          playerFacing: "down",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 52, y: 100 });

      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 220, y: 100 },
          playerFacing: "up",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 148, y: 100 });
    });

    test("주인이 멈춰 있고 왼쪽이나 오른쪽을 보면 더 가까운 위아래 목표를 선택합니다.", () => {
      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 100, y: 0 },
          playerFacing: "right",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 100, y: 52 });

      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 100, y: 220 },
          playerFacing: "left",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 100, y: 148 });
    });

    test("목표 위치에 이미 도달한 상태에서도 유한한 zero velocity를 반환합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 52, y: 100 },
        playerFacing: "up",
        playerPosition: { x: 100, y: 100 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent.velocity).toEqual({ x: 0, y: 0 });
      expect(Number.isFinite(intent.velocity.x)).toBe(true);
      expect(Number.isFinite(intent.velocity.y)).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- dogFollow.test.ts
```

Expected: FAIL because `./dogFollow` does not exist.

- [ ] **Step 3: Add the dog follow implementation**

Create `apps/game/src/game/systems/dogFollow/dogFollow.ts`:

```ts
import type { FacingDirection, MovementVector } from "../playerMovement/playerMovement";

export type DogFollowMode = "following" | "settled";

export type DogFollowPoint = {
  readonly x: number;
  readonly y: number;
};

export type DogFollowState = {
  readonly mode: DogFollowMode;
};

export type DogFollowInput = {
  readonly dogPosition: DogFollowPoint;
  readonly playerFacing: FacingDirection;
  readonly playerPosition: DogFollowPoint;
  readonly playerVelocity: MovementVector;
  readonly previousState: DogFollowState;
};

export type DogFollowIntent = {
  readonly mode: DogFollowMode;
  readonly shouldCollideWithPlayer: boolean;
  readonly targetPosition: DogFollowPoint;
  readonly velocity: MovementVector;
};

export const DOG_FOLLOW_START_DISTANCE = 96;
export const DOG_FOLLOW_STOP_DISTANCE = 56;
export const DOG_FOLLOW_SPEED = 90;
export const DOG_FOLLOW_TARGET_OFFSET = 48;

export function createInitialDogFollowState(): DogFollowState {
  return { mode: "settled" };
}

export function resolveDogFollowIntent(input: DogFollowInput): DogFollowIntent {
  const mode = resolveDogFollowMode(
    getDistance(input.dogPosition, input.playerPosition),
    input.previousState.mode,
  );
  const targetPosition = resolveDogFollowTarget(input);

  if (mode === "settled") {
    return {
      mode,
      shouldCollideWithPlayer: true,
      targetPosition,
      velocity: { x: 0, y: 0 },
    };
  }

  return {
    mode,
    shouldCollideWithPlayer: false,
    targetPosition,
    velocity: resolveVelocity(input.dogPosition, targetPosition),
  };
}

function resolveDogFollowMode(playerDistance: number, previousMode: DogFollowMode): DogFollowMode {
  if (previousMode === "following") {
    if (playerDistance <= DOG_FOLLOW_STOP_DISTANCE) {
      return "settled";
    }

    return "following";
  }

  if (playerDistance >= DOG_FOLLOW_START_DISTANCE) {
    return "following";
  }

  return "settled";
}

function resolveDogFollowTarget(input: DogFollowInput): DogFollowPoint {
  if (isMoving(input.playerVelocity)) {
    return resolveMovingPlayerTarget(input.playerPosition, input.playerFacing);
  }

  return resolveSettledPlayerTarget(input.dogPosition, input.playerPosition, input.playerFacing);
}

function resolveMovingPlayerTarget(
  playerPosition: DogFollowPoint,
  playerFacing: FacingDirection,
): DogFollowPoint {
  if (playerFacing === "up") {
    return offsetPoint(playerPosition, 0, DOG_FOLLOW_TARGET_OFFSET);
  }

  if (playerFacing === "down") {
    return offsetPoint(playerPosition, 0, -DOG_FOLLOW_TARGET_OFFSET);
  }

  if (playerFacing === "left") {
    return offsetPoint(playerPosition, DOG_FOLLOW_TARGET_OFFSET, 0);
  }

  return offsetPoint(playerPosition, -DOG_FOLLOW_TARGET_OFFSET, 0);
}

function resolveSettledPlayerTarget(
  dogPosition: DogFollowPoint,
  playerPosition: DogFollowPoint,
  playerFacing: FacingDirection,
): DogFollowPoint {
  if (playerFacing === "up" || playerFacing === "down") {
    return chooseCloserPoint(dogPosition, [
      offsetPoint(playerPosition, -DOG_FOLLOW_TARGET_OFFSET, 0),
      offsetPoint(playerPosition, DOG_FOLLOW_TARGET_OFFSET, 0),
    ]);
  }

  return chooseCloserPoint(dogPosition, [
    offsetPoint(playerPosition, 0, -DOG_FOLLOW_TARGET_OFFSET),
    offsetPoint(playerPosition, 0, DOG_FOLLOW_TARGET_OFFSET),
  ]);
}

function chooseCloserPoint(
  origin: DogFollowPoint,
  candidates: readonly [DogFollowPoint, DogFollowPoint],
): DogFollowPoint {
  const firstDistance = getDistance(origin, candidates[0]);
  const secondDistance = getDistance(origin, candidates[1]);

  if (firstDistance <= secondDistance) {
    return candidates[0];
  }

  return candidates[1];
}

function resolveVelocity(currentPosition: DogFollowPoint, targetPosition: DogFollowPoint) {
  const deltaX = targetPosition.x - currentPosition.x;
  const deltaY = targetPosition.y - currentPosition.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= 0.0001) {
    return { x: 0, y: 0 };
  }

  return {
    x: (deltaX / distance) * DOG_FOLLOW_SPEED,
    y: (deltaY / distance) * DOG_FOLLOW_SPEED,
  };
}

function offsetPoint(point: DogFollowPoint, x: number, y: number): DogFollowPoint {
  return {
    x: point.x + x,
    y: point.y + y,
  };
}

function getDistance(firstPoint: DogFollowPoint, secondPoint: DogFollowPoint): number {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function isMoving(velocity: MovementVector): boolean {
  return Math.hypot(velocity.x, velocity.y) > 0;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- dogFollow.test.ts
```

Expected: PASS for `dogFollow.test.ts`.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add apps/game/src/game/systems/dogFollow
git commit -m "feat: add dog follow intent"
```

## Task 2: Dog Presenter Follow Application

**Files:**

- Modify: `apps/game/src/game/objects/DogPresenter.ts`

- [ ] **Step 1: Update `DogPresenter` to accept follow intent**

Replace `apps/game/src/game/objects/DogPresenter.ts` with:

```ts
import Phaser from "phaser";

import {
  CHARACTER_BODY_SIZE,
  CHARACTER_TOKEN_SIZE,
  DOG_TOKEN_TEXTURE_KEY,
} from "./characterTokenAssets";
import type { DogFollowIntent } from "../systems/dogFollow/dogFollow";
import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";
import { resolveDogPresentationStyle } from "./dogPresentationStyle";

export class DogPresenter {
  private readonly scene: Phaser.Scene;
  private readonly ring: Phaser.GameObjects.Ellipse;
  private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private clearTintTimer: Phaser.Time.TimerEvent | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.ring = scene.add.ellipse(x, y, CHARACTER_TOKEN_SIZE + 6, CHARACTER_TOKEN_SIZE + 6);
    this.ring.setDepth(29);
    this.ring.setStrokeStyle(2, 0x94a3b8);
    this.sprite = scene.physics.add.sprite(x, y, DOG_TOKEN_TEXTURE_KEY);
    this.sprite.setDisplaySize(CHARACTER_TOKEN_SIZE, CHARACTER_TOKEN_SIZE);
    this.sprite.setDepth(30);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setPushable(false);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(CHARACTER_BODY_SIZE, CHARACTER_BODY_SIZE, true);
    this.sprite.setInteractive();
  }

  getInteractiveObject(): Phaser.GameObjects.GameObject {
    return this.sprite;
  }

  getPhysicsObject(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return this.sprite;
  }

  getPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }

  applyFollowIntent(intent: DogFollowIntent): void {
    this.syncRingPosition();
    this.sprite.setVelocity(intent.velocity.x, intent.velocity.y);
  }

  presentReaction(request: DogReactionRequest): void {
    const style = resolveDogPresentationStyle(request);

    this.syncRingPosition();
    this.sprite.setTint(style.tokenTintColor);
    this.ring.setStrokeStyle(2, style.ringStrokeColor);
    this.scene.tweens.add({
      duration: 180,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.sprite.setScale(1);
      },
      scaleX: 1.15,
      scaleY: 1.15,
      targets: this.sprite,
      yoyo: true,
    });
    this.clearTintTimer?.remove(false);
    this.clearTintTimer = this.scene.time.delayedCall(450, () => {
      this.sprite.clearTint();
      this.clearTintTimer = undefined;
    });

    if (style.effectEnabled) {
      this.showStarlightBloom(style.effectColor, style.effectParticleCount);
    }
  }

  private showStarlightBloom(effectColor: number, particleCount: number): void {
    for (let index = 0; index < particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / particleCount;
      const startX = this.sprite.x + Math.cos(angle) * 12;
      const startY = this.sprite.y + Math.sin(angle) * 12;
      const endX = this.sprite.x + Math.cos(angle) * 22;
      const endY = this.sprite.y + Math.sin(angle) * 22;
      const particle = this.scene.add.circle(startX, startY, 2, effectColor, 0.9);

      particle.setDepth(35);
      this.scene.tweens.add({
        alpha: 0,
        duration: 600,
        ease: "Sine.easeOut",
        onComplete: () => {
          particle.destroy();
        },
        scale: 0.3,
        targets: particle,
        x: endX,
        y: endY,
      });
    }
  }

  private syncRingPosition(): void {
    this.ring.setPosition(this.sprite.x, this.sprite.y);
  }
}
```

- [ ] **Step 2: Run focused checks**

Run:

```bash
pnpm --filter @louis-world/game typecheck
pnpm --filter @louis-world/game test -- dogPresentationStyle.test.ts
```

Expected: PASS. TypeScript accepts the new `DogFollowIntent` import and existing presentation style
tests still pass.

- [ ] **Step 3: Commit Task 2**

Run:

```bash
git add apps/game/src/game/objects/DogPresenter.ts
git commit -m "feat: let dog presenter apply follow intent"
```

## Task 3: Wire Dog Follow Into Game Scene

**Files:**

- Modify: `apps/game/src/game/scenes/GameScene.ts`

- [ ] **Step 1: Update `GameScene` composition**

Replace `apps/game/src/game/scenes/GameScene.ts` with:

```ts
import Phaser from "phaser";

import { createHomeYardMap } from "../maps/createHomeYardMap";
import { DogPresenter } from "../objects/DogPresenter";
import { InteractionPromptPresenter } from "../objects/InteractionPromptPresenter";
import { PlayerPresenter } from "../objects/PlayerPresenter";
import {
  createInitialDogFollowState,
  type DogFollowState,
  resolveDogFollowIntent,
} from "../systems/dogFollow/dogFollow";
import { applyDogMoodDelta, createInitialDogMood } from "../systems/dogReaction/dogMood";
import type { DogInteractionEvent, DogMood } from "../systems/dogReaction/dogReactionTypes";
import { createDogReactionRequest } from "../systems/dogReaction/dogReactionSystem";
import {
  canPetFromKeyboard,
  getPetInteractionEvent,
} from "../systems/dogInteraction/petInteraction";
import { PlayerKeyboardController } from "../systems/playerMovement/PlayerKeyboardController";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  private dogFollowState: DogFollowState = createInitialDogFollowState();
  private dogMood: DogMood = createInitialDogMood();
  private dogPresenter: DogPresenter | undefined;
  private interactionPromptPresenter: InteractionPromptPresenter | undefined;
  private playerDogCollider: Phaser.Physics.Arcade.Collider | undefined;
  private playerKeyboardController: PlayerKeyboardController | undefined;
  private playerPresenter: PlayerPresenter | undefined;

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    this.dogFollowState = createInitialDogFollowState();

    const homeYardMap = createHomeYardMap(this);
    this.physics.world.setBounds(
      0,
      0,
      homeYardMap.map.widthInPixels,
      homeYardMap.map.heightInPixels,
    );

    const playerPresenter = new PlayerPresenter(
      this,
      homeYardMap.markers.playerSpawn.x,
      homeYardMap.markers.playerSpawn.y,
    );
    const dogPresenter = new DogPresenter(
      this,
      homeYardMap.markers.dogSpawn.x,
      homeYardMap.markers.dogSpawn.y,
    );
    const playerSprite = playerPresenter.getSprite();
    const dogSprite = dogPresenter.getPhysicsObject();

    dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (!event) {
        return;
      }

      this.runPetInteraction(event);
    });

    this.physics.add.collider(playerSprite, homeYardMap.layers.collisionBlockout);
    this.physics.add.collider(dogSprite, homeYardMap.layers.collisionBlockout);
    this.playerDogCollider = this.physics.add.collider(playerSprite, dogSprite);

    this.cameras.main.setBounds(
      0,
      0,
      homeYardMap.map.widthInPixels,
      homeYardMap.map.heightInPixels,
    );
    this.cameras.main.startFollow(playerSprite, true, 0.12, 0.12);

    this.playerPresenter = playerPresenter;
    this.dogPresenter = dogPresenter;
    this.interactionPromptPresenter = new InteractionPromptPresenter(this);
    this.playerKeyboardController = PlayerKeyboardController.fromScene(this, playerSprite);
  }

  update(): void {
    if (
      this.dogPresenter === undefined ||
      this.interactionPromptPresenter === undefined ||
      this.playerKeyboardController === undefined ||
      this.playerPresenter === undefined
    ) {
      return;
    }

    this.playerKeyboardController.update();

    const playerFacing = this.playerKeyboardController.getFacingDirection();
    const playerSprite = this.playerPresenter.getSprite();
    const playerPosition = { x: playerSprite.x, y: playerSprite.y };
    const playerVelocity = {
      x: playerSprite.body.velocity.x,
      y: playerSprite.body.velocity.y,
    };
    const dogPosition = this.dogPresenter.getPosition();
    const followIntent = resolveDogFollowIntent({
      dogPosition,
      playerFacing,
      playerPosition,
      playerVelocity,
      previousState: this.dogFollowState,
    });
    const canPet = canPetFromKeyboard({
      dogPosition,
      playerFacing,
      playerPosition,
    });

    this.dogFollowState = { mode: followIntent.mode };
    this.dogPresenter.applyFollowIntent(followIntent);
    this.updatePlayerDogCollider(followIntent.shouldCollideWithPlayer);
    this.playerPresenter.setFacingDirection(playerFacing);
    this.interactionPromptPresenter.update({ targetPosition: dogPosition, visible: canPet });

    const event = getPetInteractionEvent({
      dogPosition,
      keyboardActionPressed: this.playerKeyboardController.consumeInteractJustPressed(),
      playerFacing,
      playerPosition,
    });

    if (!event) {
      return;
    }

    this.runPetInteraction(event);
  }

  private runPetInteraction(event: DogInteractionEvent): void {
    if (this.dogPresenter === undefined) {
      return;
    }

    const reaction = createDogReactionRequest(event, this.dogMood);
    this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
    this.dogPresenter.presentReaction(reaction);
  }

  private updatePlayerDogCollider(active: boolean): void {
    if (this.playerDogCollider === undefined) {
      return;
    }

    this.playerDogCollider.active = active;
  }
}
```

- [ ] **Step 2: Run focused checks**

Run:

```bash
pnpm --filter @louis-world/game typecheck
pnpm --filter @louis-world/game test -- dogFollow.test.ts petInteraction.test.ts dogReactionSystem.test.ts
```

Expected: PASS. The scene compiles, dog follow logic tests pass, and existing petting interaction and
reaction tests still pass.

- [ ] **Step 3: Commit Task 3**

Run:

```bash
git add apps/game/src/game/scenes/GameScene.ts
git commit -m "feat: wire dog follow scene behavior"
```

## Task 4: Full Verification And Browser Check

**Files:**

- No planned source changes.

- [ ] **Step 1: Run the full automated verification**

Run:

```bash
pnpm --filter @louis-world/game test
pnpm --filter @louis-world/game typecheck
pnpm --filter @louis-world/game build
```

Expected: all commands exit with code `0`.

- [ ] **Step 2: Start the local dev server**

Run:

```bash
pnpm --filter @louis-world/game dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`. Keep this command running for
the browser check.

- [ ] **Step 3: Check the behavior in the browser**

Open the Vite URL and verify this checklist:

```text
1. The game scene loads without a runtime error.
2. The player moves with arrow keys.
3. When the player moves away from the dog, the dog follows slowly.
4. The dog does not move as fast as the player.
5. While the dog is following, the player can pass through the dog instead of being blocked.
6. After the dog settles, the player no longer passes through the dog.
7. The dog does not pass through the house, locked path, or map edge.
8. If the dog is blocked by a map obstacle, it stays blocked instead of pathfinding or teleporting.
9. Keyboard petting with E still works when the player faces the dog in range.
10. Pointer petting on the dog still triggers the existing reaction.
```

- [ ] **Step 4: Commit verification-only fixes if any were needed**

If Step 1 or Step 3 required fixes, commit only those fixes:

```bash
git add apps/game/src/game
git commit -m "fix: stabilize dog follow behavior"
```

If no source changes were needed, do not create a verification commit.

# Dog Reaction Event Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first asset-independent dog petting reaction prototype, where a petting input creates a dog reaction request, increases calmness, and shows a placeholder relaxed expression with a starlight effect.

**Architecture:** Keep interaction detection, reaction decision, mood data, and Phaser presentation separate. Pure TypeScript systems produce and test the reaction contract; the Phaser presenter maps that contract to placeholder visuals and can later map it to real sprites and effects.

**Tech Stack:** TypeScript, Phaser 4, Vitest, Vite, pnpm workspace scripts.

---

## Scope Check

This plan implements one subsystem: the dog petting reaction event prototype.

It does not implement full dog AI, final dog assets, final animation state machines, save data, day progression, food, or ball play.

## File Structure

Create focused files under the existing `apps/game/src/game` boundary:

```text
apps/game/src/game/systems/dogReaction/
  dogReactionTypes.ts
  dogMood.ts
  dogReactionSystem.ts
  dogReactionSystem.test.ts

apps/game/src/game/systems/dogInteraction/
  petInteraction.ts
  petInteraction.test.ts

apps/game/src/game/objects/
  dogPresentationStyle.ts
  dogPresentationStyle.test.ts
  DogPresenter.ts

Modify:
  apps/game/src/game/scenes/GameScene.ts
```

Responsibility split:

- `PetInteraction`: turns a simple pointer input shape into a dog interaction event.
- `DogReactionSystem`: turns a dog interaction event plus mood into a reaction request.
- `DogMood`: stores and updates the minimal `calmness` data.
- `dogPresentationStyle`: maps reaction requests to simple visual style data and fallback behavior.
- `DogPresenter`: maps visual style data to Phaser placeholder objects and effects.
- `GameScene`: composes the pieces and wires Phaser pointer input to the reaction flow.

---

### Task 1: Dog Reaction Contract And Mood

**Files:**

- Create: `apps/game/src/game/systems/dogReaction/dogReactionTypes.ts`
- Create: `apps/game/src/game/systems/dogReaction/dogMood.ts`
- Create: `apps/game/src/game/systems/dogReaction/dogReactionSystem.ts`
- Create: `apps/game/src/game/systems/dogReaction/dogReactionSystem.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/game/src/game/systems/dogReaction/dogReactionSystem.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { applyDogMoodDelta, createInitialDogMood } from "./dogMood";
import { createDogReactionRequest } from "./dogReactionSystem";

describe("createDogReactionRequest", () => {
  it("returns a cautious-to-relaxed starlight reaction for the first petting input", () => {
    const mood = createInitialDogMood();

    expect(createDogReactionRequest({ type: "pet_started" }, mood)).toEqual({
      expression: "cautious_to_relaxed",
      effect: "starlight_bloom",
      intensity: "soft",
      moodDelta: { calmness: 1 },
    });
  });

  it("returns a relaxed starlight reaction after calmness has increased", () => {
    const mood = { calmness: 1 };

    expect(createDogReactionRequest({ type: "pet_started" }, mood)).toEqual({
      expression: "relaxed",
      effect: "starlight_bloom",
      intensity: "soft",
      moodDelta: { calmness: 1 },
    });
  });
});

describe("dog mood", () => {
  it("starts with no calmness", () => {
    expect(createInitialDogMood()).toEqual({ calmness: 0 });
  });

  it("applies calmness changes", () => {
    expect(applyDogMoodDelta({ calmness: 0 }, { calmness: 1 })).toEqual({
      calmness: 1,
    });
  });

  it("keeps calmness inside the first prototype range", () => {
    expect(applyDogMoodDelta({ calmness: 3 }, { calmness: 1 })).toEqual({
      calmness: 3,
    });
    expect(applyDogMoodDelta({ calmness: 0 }, { calmness: -1 })).toEqual({
      calmness: 0,
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- dogReactionSystem.test.ts
```

Expected: FAIL because `dogMood` and `dogReactionSystem` do not exist.

- [ ] **Step 3: Add the reaction contract types**

Create `apps/game/src/game/systems/dogReaction/dogReactionTypes.ts`:

```ts
export type DogInteractionEvent = {
  type: "pet_started";
};

export type DogExpression = "cautious_to_relaxed" | "relaxed";

export type DogEffect = "starlight_bloom" | "none";

export type DogReactionIntensity = "soft" | "none";

export type DogMood = {
  calmness: number;
};

export type DogMoodDelta = {
  calmness: number;
};

export type DogReactionRequest = {
  expression: DogExpression;
  effect: DogEffect;
  intensity: DogReactionIntensity;
  moodDelta: DogMoodDelta;
};
```

- [ ] **Step 4: Add minimal mood creation and update logic**

Create `apps/game/src/game/systems/dogReaction/dogMood.ts`:

```ts
import type { DogMood, DogMoodDelta } from "./dogReactionTypes";

export function createInitialDogMood(): DogMood {
  return { calmness: 0 };
}

export function applyDogMoodDelta(mood: DogMood, delta: DogMoodDelta): DogMood {
  return {
    calmness: clampCalmness(mood.calmness + delta.calmness),
  };
}

function clampCalmness(value: number): number {
  return Math.min(3, Math.max(0, value));
}
```

- [ ] **Step 5: Add the reaction request creator**

Create `apps/game/src/game/systems/dogReaction/dogReactionSystem.ts`:

```ts
import type { DogInteractionEvent, DogMood, DogReactionRequest } from "./dogReactionTypes";

export function createDogReactionRequest(
  event: DogInteractionEvent,
  mood: DogMood,
): DogReactionRequest {
  if (event.type === "pet_started") {
    return createPetStartedReaction(mood);
  }

  return {
    expression: "relaxed",
    effect: "none",
    intensity: "none",
    moodDelta: { calmness: 0 },
  };
}

function createPetStartedReaction(mood: DogMood): DogReactionRequest {
  const expression = mood.calmness > 0 ? "relaxed" : "cautious_to_relaxed";

  return {
    expression,
    effect: "starlight_bloom",
    intensity: "soft",
    moodDelta: { calmness: 1 },
  };
}
```

- [ ] **Step 6: Run the focused test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- dogReactionSystem.test.ts
```

Expected: PASS for `dogReactionSystem.test.ts`.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add apps/game/src/game/systems/dogReaction
git commit -m "feat: add dog reaction contract"
```

---

### Task 2: Pet Interaction Event Helper

**Files:**

- Create: `apps/game/src/game/systems/dogInteraction/petInteraction.ts`
- Create: `apps/game/src/game/systems/dogInteraction/petInteraction.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/game/src/game/systems/dogInteraction/petInteraction.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getPetInteractionEvent } from "./petInteraction";

describe("getPetInteractionEvent", () => {
  it("creates a petting event when the pointer is pressed on the dog", () => {
    expect(getPetInteractionEvent({ pointerDown: true, target: "dog" })).toEqual({
      type: "pet_started",
    });
  });

  it("does not create an event when the pointer is not pressed", () => {
    expect(getPetInteractionEvent({ pointerDown: false, target: "dog" })).toBeNull();
  });

  it("does not create an event when the dog is not the target", () => {
    expect(getPetInteractionEvent({ pointerDown: true, target: "none" })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- petInteraction.test.ts
```

Expected: FAIL because `petInteraction` does not exist.

- [ ] **Step 3: Add the interaction helper**

Create `apps/game/src/game/systems/dogInteraction/petInteraction.ts`:

```ts
import type { DogInteractionEvent } from "../dogReaction/dogReactionTypes";

export type PetInteractionTarget = "dog" | "none";

export type PetInteractionInput = {
  pointerDown: boolean;
  target: PetInteractionTarget;
};

export function getPetInteractionEvent(input: PetInteractionInput): DogInteractionEvent | null {
  if (!input.pointerDown) {
    return null;
  }

  if (input.target !== "dog") {
    return null;
  }

  return { type: "pet_started" };
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- petInteraction.test.ts
```

Expected: PASS for `petInteraction.test.ts`.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add apps/game/src/game/systems/dogInteraction
git commit -m "feat: add pet interaction event helper"
```

---

### Task 3: Presentation Style Mapping

**Files:**

- Create: `apps/game/src/game/objects/dogPresentationStyle.ts`
- Create: `apps/game/src/game/objects/dogPresentationStyle.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/game/src/game/objects/dogPresentationStyle.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { resolveDogPresentationStyle } from "./dogPresentationStyle";

describe("resolveDogPresentationStyle", () => {
  it("maps cautious-to-relaxed starlight reactions to a soft relaxed placeholder", () => {
    expect(
      resolveDogPresentationStyle({
        expression: "cautious_to_relaxed",
        effect: "starlight_bloom",
        intensity: "soft",
      }),
    ).toEqual({
      faceText: ":)",
      bodyColor: 0xf8fafc,
      bodyStrokeColor: 0xfacc15,
      effectEnabled: true,
      effectColor: 0xfde68a,
      effectParticleCount: 8,
    });
  });

  it("uses a relaxed placeholder for unknown expressions", () => {
    expect(
      resolveDogPresentationStyle({
        expression: "unknown_expression",
        effect: "none",
        intensity: "none",
      }),
    ).toEqual({
      faceText: ":)",
      bodyColor: 0xf8fafc,
      bodyStrokeColor: 0x94a3b8,
      effectEnabled: false,
      effectColor: 0xfde68a,
      effectParticleCount: 0,
    });
  });

  it("treats unknown effects as no-op effects", () => {
    expect(
      resolveDogPresentationStyle({
        expression: "relaxed",
        effect: "unknown_effect",
        intensity: "soft",
      }).effectEnabled,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm --filter @louis-world/game test -- dogPresentationStyle.test.ts
```

Expected: FAIL because `dogPresentationStyle` does not exist.

- [ ] **Step 3: Add the presentation style resolver**

Create `apps/game/src/game/objects/dogPresentationStyle.ts`:

```ts
import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";

export type DogPresentationRequest =
  | Pick<DogReactionRequest, "expression" | "effect" | "intensity">
  | {
      expression: string;
      effect: string;
      intensity: string;
    };

export type DogPresentationStyle = {
  faceText: string;
  bodyColor: number;
  bodyStrokeColor: number;
  effectEnabled: boolean;
  effectColor: number;
  effectParticleCount: number;
};

export function resolveDogPresentationStyle(request: DogPresentationRequest): DogPresentationStyle {
  const effectEnabled = request.effect === "starlight_bloom";

  return {
    faceText: resolveFaceText(request.expression),
    bodyColor: 0xf8fafc,
    bodyStrokeColor: effectEnabled ? 0xfacc15 : 0x94a3b8,
    effectEnabled,
    effectColor: 0xfde68a,
    effectParticleCount: resolveEffectParticleCount(request.intensity, effectEnabled),
  };
}

function resolveFaceText(expression: string): string {
  if (expression === "cautious_to_relaxed") {
    return ":)";
  }

  if (expression === "relaxed") {
    return ":)";
  }

  return ":)";
}

function resolveEffectParticleCount(intensity: string, effectEnabled: boolean): number {
  if (!effectEnabled) {
    return 0;
  }

  if (intensity === "soft") {
    return 8;
  }

  return 4;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm --filter @louis-world/game test -- dogPresentationStyle.test.ts
```

Expected: PASS for `dogPresentationStyle.test.ts`.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add apps/game/src/game/objects/dogPresentationStyle.ts apps/game/src/game/objects/dogPresentationStyle.test.ts
git commit -m "feat: add dog presentation style mapping"
```

---

### Task 4: Phaser Placeholder Presenter And Scene Integration

**Files:**

- Create: `apps/game/src/game/objects/DogPresenter.ts`
- Modify: `apps/game/src/game/scenes/GameScene.ts`

- [ ] **Step 1: Add the Phaser presenter**

Create `apps/game/src/game/objects/DogPresenter.ts`:

```ts
import Phaser from "phaser";

import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";
import { resolveDogPresentationStyle } from "./dogPresentationStyle";

export class DogPresenter {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Ellipse;
  private readonly face: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.body = scene.add.ellipse(0, 0, 144, 96, 0xcbd5e1).setStrokeStyle(4, 0x64748b);
    this.face = scene.add
      .text(0, -2, ":|", {
        color: "#0f172a",
        fontFamily: "system-ui, sans-serif",
        fontSize: "32px",
      })
      .setOrigin(0.5);
    this.container = scene.add.container(x, y, [this.body, this.face]);

    this.container.setSize(168, 120);
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(-84, -60, 168, 120),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  getInteractiveObject(): Phaser.GameObjects.Container {
    return this.container;
  }

  presentReaction(request: DogReactionRequest): void {
    const style = resolveDogPresentationStyle(request);

    this.body.setFillStyle(style.bodyColor);
    this.body.setStrokeStyle(4, style.bodyStrokeColor);
    this.face.setText(style.faceText);

    if (style.effectEnabled) {
      this.showStarlightBloom(style.effectColor, style.effectParticleCount);
    }
  }

  private showStarlightBloom(effectColor: number, particleCount: number): void {
    for (let index = 0; index < particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / particleCount;
      const startX = this.container.x + Math.cos(angle) * 54;
      const startY = this.container.y + Math.sin(angle) * 36;
      const endX = this.container.x + Math.cos(angle) * 82;
      const endY = this.container.y + Math.sin(angle) * 58;
      const particle = this.scene.add.circle(startX, startY, 4, effectColor, 0.9);

      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.3,
        duration: 600,
        ease: "Sine.easeOut",
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}
```

- [ ] **Step 2: Integrate the presenter and systems into `GameScene`**

Replace `apps/game/src/game/scenes/GameScene.ts` with:

```ts
import Phaser from "phaser";

import { DogPresenter } from "../objects/DogPresenter";
import { applyDogMoodDelta, createInitialDogMood } from "../systems/dogReaction/dogMood";
import type { DogMood } from "../systems/dogReaction/dogReactionTypes";
import { createDogReactionRequest } from "../systems/dogReaction/dogReactionSystem";
import { getPetInteractionEvent } from "../systems/dogInteraction/petInteraction";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  private dogMood: DogMood = createInitialDogMood();

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.cameras.main.setBackgroundColor("#18233f");
    this.add.circle(centerX, centerY + 88, 260, 0x24304f, 0.7);
    this.add.circle(centerX + 220, centerY - 180, 52, 0xfde68a, 0.88);

    const dogPresenter = new DogPresenter(this, centerX, centerY + 72);

    dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (!event) {
        return;
      }

      const reaction = createDogReactionRequest(event, this.dogMood);
      this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
      dogPresenter.presentReaction(reaction);
    });
  }
}
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
pnpm --filter @louis-world/game test -- dogReactionSystem.test.ts petInteraction.test.ts dogPresentationStyle.test.ts scenes.test.ts
```

Expected: PASS for the focused test files.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Run the game locally for manual verification**

Run:

```bash
pnpm dev
```

Expected: Vite starts the game app and prints a local URL.

Open the local URL and verify:

```text
The scene shows a placeholder dog shape.
Clicking or tapping the dog changes the face from cautious to relaxed.
Clicking or tapping the dog creates a small starlight bloom around the dog.
Repeated clicks do not crash the scene.
No missing asset errors appear in the browser console.
```

Stop the dev server after verification.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add apps/game/src/game/objects/DogPresenter.ts apps/game/src/game/scenes/GameScene.ts
git commit -m "feat: show dog petting reaction prototype"
```

---

### Task 5: Final Verification

**Files:**

- Verify all changed source and test files.

- [ ] **Step 1: Run the full app test suite**

Run:

```bash
pnpm test
```

Expected: PASS for all Vitest tests in `@louis-world/game`.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: PASS and Vite writes the production build for `apps/game`.

- [ ] **Step 4: Check formatting and linting status**

Run:

```bash
pnpm lint
git diff --check
```

Expected:

```text
pnpm lint exits 0.
git diff --check exits 0.
```

Run `pnpm format:check` only after the existing `.codex/skills` formatting issue is resolved or intentionally excluded from the project formatter. At the time this plan was written, `pnpm format:check` reported pre-existing formatting issues in `.codex/skills/code-style/SKILL.md` and `.codex/skills/test-code-style/SKILL.md`.

- [ ] **Step 5: Review final diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only the dog reaction prototype files from this plan are changed.

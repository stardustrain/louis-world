# 키보드 액션 구현 계획

> **에이전트 작업자 필수:** REQUIRED SUB-SKILL: 이 계획을 구현할 때는
> `superpowers:subagent-driven-development`를 권장하며, 대안으로
> `superpowers:executing-plans`를 사용한다. 단계 추적은 checkbox (`- [ ]`)를
> 사용한다.

**목표:** 방향키로 주인공을 움직이고, 강아지 앞에서 `E`를 눌러 현재
쓰다듬기 반응을 실행할 수 있게 만든다.

**아키텍처:** `GameScene`은 조립자 역할만 유지하고, 이동 입력은
`PlayerKeyboardController`, 이동 계산은 순수 `playerMovement` helper,
상호작용 판정은 `PetInteraction`, 시각 표현은 각 Presenter가 맡는다. 주인공과
강아지는 작은 SVG 토큰을 Arcade Physics sprite로 렌더링한다.

**기술 스택:** Phaser 4.1, Arcade Physics, Vite, TypeScript, Vitest, SVG runtime
assets

---

## 파일 구조

- 생성: `apps/game/src/game/systems/playerMovement/playerMovement.ts`
  - 방향키 상태를 velocity와 바라보는 방향으로 바꾸는 순수 로직.
- 생성: `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`
  - 속도, 대각선 정규화, 방향 결정 테스트.
- 생성: `apps/game/src/game/systems/playerMovement/PlayerKeyboardController.ts`
  - Phaser 키보드 입력을 읽고 player sprite에 velocity를 적용.
- 수정: `apps/game/src/game/systems/dogInteraction/petInteraction.ts`
  - 포인터 쓰다듬기 유지, 키보드 쓰다듬기 판정 추가.
- 수정: `apps/game/src/game/systems/dogInteraction/petInteraction.test.ts`
  - 앞쪽 `24x24px` 상호작용 영역과 `E` 입력 조건 테스트.
- 생성: `apps/game/src/game/objects/characterTokenAssets.ts`
  - player/dog SVG 텍스처 키와 로드 helper.
- 생성: `apps/game/src/game/objects/characterTokenAssets.test.ts`
  - SVG 로드 helper가 정확한 key/url/size로 loader를 호출하는지 테스트.
- 생성: `apps/game/public/assets/images/player-token.svg`
  - `24x24px` 주인공 원형 토큰 SVG.
- 생성: `apps/game/public/assets/images/dog-token.svg`
  - `24x24px` 강아지 원형 토큰 SVG.
- 생성: `apps/game/src/game/objects/PlayerPresenter.ts`
  - 주인공 physics sprite 생성과 facing 회전.
- 수정: `apps/game/src/game/objects/DogPresenter.ts`
  - 큰 타원 placeholder를 작은 dog token physics sprite로 교체.
- 생성: `apps/game/src/game/objects/InteractionPromptPresenter.ts`
  - 상호작용 가능 상태의 작은 `E` keycap 표시.
- 수정: `apps/game/src/game/scenes/PreloaderScene.ts`
  - character token SVG 로드 추가.
- 수정: `apps/game/src/game/scenes/GameScene.ts`
  - player/dog 생성, 키보드 컨트롤러, 충돌, 카메라 follow, `E` 상호작용 연결.

## Task 1: 주인공 이동 의도 계산과 키보드 컨트롤러

**파일:**

- Create: `apps/game/src/game/systems/playerMovement/playerMovement.ts`
- Create: `apps/game/src/game/systems/playerMovement/playerMovement.test.ts`
- Create: `apps/game/src/game/systems/playerMovement/PlayerKeyboardController.ts`

- [ ] **Step 1: 실패하는 이동 의도 테스트 작성**

`apps/game/src/game/systems/playerMovement/playerMovement.test.ts`를 생성한다.

```ts
import {
  DEFAULT_PLAYER_FACING,
  PLAYER_MOVEMENT_SPEED,
  resolvePlayerMovementIntent,
} from "./playerMovement";

describe("playerMovement", () => {
  describe("resolvePlayerMovementIntent", () => {
    test("아무 방향키도 누르지 않으면 멈추고 기존 방향을 유지합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: false, left: false, right: false, up: false }, "left"),
      ).toEqual({
        facing: "left",
        velocity: { x: 0, y: 0 },
      });
    });

    test("이전 방향이 없으면 기본 방향은 아래입니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: false,
          up: false,
        }).facing,
      ).toBe(DEFAULT_PLAYER_FACING);
    });

    test("오른쪽 입력은 오른쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: true,
          up: false,
        }),
      ).toEqual({
        facing: "right",
        velocity: { x: PLAYER_MOVEMENT_SPEED, y: 0 },
      });
    });

    test("위쪽 입력은 위쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: false,
          up: true,
        }),
      ).toEqual({
        facing: "up",
        velocity: { x: 0, y: -PLAYER_MOVEMENT_SPEED },
      });
    });

    test("대각선 입력은 한 방향 이동과 같은 속도로 정규화합니다.", () => {
      const intent = resolvePlayerMovementIntent({
        down: false,
        left: false,
        right: true,
        up: true,
      });

      expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(PLAYER_MOVEMENT_SPEED);
      expect(intent.velocity.x).toBeCloseTo(84.8528, 4);
      expect(intent.velocity.y).toBeCloseTo(-84.8528, 4);
    });

    test("대각선 입력 중 이전 facing이 눌린 축이면 그 방향을 유지합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: false, left: false, right: true, up: true }, "up")
          .facing,
      ).toBe("up");
    });

    test("대각선 입력 중 이전 facing이 눌린 축이 아니면 가로 방향을 우선합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: true, left: true, right: false, up: false }, "up")
          .facing,
      ).toBe("left");
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/systems/playerMovement/playerMovement.test.ts
```

예상: `Cannot find module './playerMovement'` 또는 export 없음으로 FAIL.

- [ ] **Step 3: 이동 의도 helper 구현**

`apps/game/src/game/systems/playerMovement/playerMovement.ts`를 생성한다.

```ts
export type FacingDirection = "up" | "down" | "left" | "right";

export type MovementKeyState = {
  readonly up: boolean;
  readonly down: boolean;
  readonly left: boolean;
  readonly right: boolean;
};

export type MovementVector = {
  readonly x: number;
  readonly y: number;
};

export type PlayerMovementIntent = {
  readonly velocity: MovementVector;
  readonly facing: FacingDirection;
};

export const PLAYER_MOVEMENT_SPEED = 120;
export const DEFAULT_PLAYER_FACING: FacingDirection = "down";

export function resolvePlayerMovementIntent(
  keys: MovementKeyState,
  previousFacing: FacingDirection = DEFAULT_PLAYER_FACING,
): PlayerMovementIntent {
  const axisX = Number(keys.right) - Number(keys.left);
  const axisY = Number(keys.down) - Number(keys.up);

  if (axisX === 0 && axisY === 0) {
    return {
      facing: previousFacing,
      velocity: { x: 0, y: 0 },
    };
  }

  const magnitude = Math.hypot(axisX, axisY);

  return {
    facing: resolveFacingDirection(axisX, axisY, previousFacing),
    velocity: {
      x: (axisX / magnitude) * PLAYER_MOVEMENT_SPEED,
      y: (axisY / magnitude) * PLAYER_MOVEMENT_SPEED,
    },
  };
}

function resolveFacingDirection(
  axisX: number,
  axisY: number,
  previousFacing: FacingDirection,
): FacingDirection {
  if (isFacingAxisHeld(axisX, axisY, previousFacing)) {
    return previousFacing;
  }

  if (axisX < 0) {
    return "left";
  }

  if (axisX > 0) {
    return "right";
  }

  if (axisY < 0) {
    return "up";
  }

  return "down";
}

function isFacingAxisHeld(axisX: number, axisY: number, facing: FacingDirection): boolean {
  if (facing === "left") {
    return axisX < 0;
  }

  if (facing === "right") {
    return axisX > 0;
  }

  if (facing === "up") {
    return axisY < 0;
  }

  return axisY > 0;
}
```

- [ ] **Step 4: 컨트롤러 구현**

`apps/game/src/game/systems/playerMovement/PlayerKeyboardController.ts`를 생성한다.

```ts
import Phaser from "phaser";

import {
  DEFAULT_PLAYER_FACING,
  type FacingDirection,
  resolvePlayerMovementIntent,
} from "./playerMovement";

export class PlayerKeyboardController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly interactKey: Phaser.Input.Keyboard.Key;
  private facing: FacingDirection = DEFAULT_PLAYER_FACING;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  ) {
    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is not available in this scene.");
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update(): void {
    const intent = resolvePlayerMovementIntent(
      {
        down: this.cursors.down.isDown,
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        up: this.cursors.up.isDown,
      },
      this.facing,
    );

    this.facing = intent.facing;
    this.player.setVelocity(intent.velocity.x, intent.velocity.y);
  }

  getFacingDirection(): FacingDirection {
    return this.facing;
  }

  consumeInteractJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.interactKey);
  }
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/systems/playerMovement/playerMovement.test.ts
```

예상: PASS.

- [ ] **Step 6: 커밋**

```bash
git add apps/game/src/game/systems/playerMovement/playerMovement.ts apps/game/src/game/systems/playerMovement/playerMovement.test.ts apps/game/src/game/systems/playerMovement/PlayerKeyboardController.ts
git commit -m "feat: add player keyboard movement"
```

## Task 2: 키보드 쓰다듬기 판정 로직

**파일:**

- Modify: `apps/game/src/game/systems/dogInteraction/petInteraction.ts`
- Modify: `apps/game/src/game/systems/dogInteraction/petInteraction.test.ts`

- [ ] **Step 1: 실패하는 상호작용 테스트 작성**

`apps/game/src/game/systems/dogInteraction/petInteraction.test.ts`를 다음 내용으로
교체한다.

```ts
import {
  canPetFromKeyboard,
  getFacingInteractionZone,
  getPetInteractionEvent,
  isPointInsideInteractionZone,
} from "./petInteraction";

describe("petInteraction", () => {
  describe("getPetInteractionEvent", () => {
    test("포인터가 강아지 위에서 눌리면 쓰다듬기 이벤트를 만듭니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: true, target: "dog" })).toEqual({
        type: "pet_started",
      });
    });

    test("포인터가 눌리지 않았으면 이벤트를 만들지 않습니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: false, target: "dog" })).toBeNull();
    });

    test("강아지가 포인터 대상이 아니면 이벤트를 만들지 않습니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: true, target: "none" })).toBeNull();
    });

    test("E 키가 막 눌렸고 강아지가 앞쪽 영역 안에 있으면 쓰다듬기 이벤트를 만듭니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 646, y: 368 },
          keyboardActionPressed: true,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toEqual({ type: "pet_started" });
    });

    test("E 키가 막 눌리지 않았으면 키보드 쓰다듬기 이벤트를 만들지 않습니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 646, y: 368 },
          keyboardActionPressed: false,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toBeNull();
    });

    test("강아지가 앞쪽 영역 밖에 있으면 키보드 쓰다듬기 이벤트를 만들지 않습니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 700, y: 368 },
          keyboardActionPressed: true,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toBeNull();
    });
  });

  describe("getFacingInteractionZone", () => {
    test("오른쪽을 바라보면 주인공 오른쪽 24x24 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "right")).toEqual({
        height: 24,
        width: 24,
        x: 112,
        y: 188,
      });
    });

    test("왼쪽을 바라보면 주인공 왼쪽 24x24 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "left")).toEqual({
        height: 24,
        width: 24,
        x: 64,
        y: 188,
      });
    });

    test("아래를 바라보면 주인공 아래쪽 24x24 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "down")).toEqual({
        height: 24,
        width: 24,
        x: 88,
        y: 212,
      });
    });

    test("위를 바라보면 주인공 위쪽 24x24 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "up")).toEqual({
        height: 24,
        width: 24,
        x: 88,
        y: 164,
      });
    });
  });

  describe("isPointInsideInteractionZone", () => {
    test("점이 영역 안에 있으면 true를 반환합니다.", () => {
      expect(
        isPointInsideInteractionZone({ x: 120, y: 196 }, { height: 24, width: 24, x: 112, y: 188 }),
      ).toBe(true);
    });

    test("점이 영역 밖에 있으면 false를 반환합니다.", () => {
      expect(
        isPointInsideInteractionZone({ x: 140, y: 196 }, { height: 24, width: 24, x: 112, y: 188 }),
      ).toBe(false);
    });
  });

  describe("canPetFromKeyboard", () => {
    test("바라보는 방향이 없으면 false를 반환합니다.", () => {
      expect(
        canPetFromKeyboard({
          dogPosition: { x: 100, y: 224 },
          playerFacing: null,
          playerPosition: { x: 100, y: 200 },
        }),
      ).toBe(false);
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/systems/dogInteraction/petInteraction.test.ts
```

예상: `canPetFromKeyboard` 또는 `getFacingInteractionZone` export 없음으로 FAIL.

- [ ] **Step 3: 상호작용 로직 구현**

`apps/game/src/game/systems/dogInteraction/petInteraction.ts`를 다음 내용으로
교체한다.

```ts
import type { FacingDirection } from "../playerMovement/playerMovement";
import type { DogInteractionEvent } from "../dogReaction/dogReactionTypes";

export type PetInteractionTarget = "dog" | "none";

export type WorldPoint = {
  readonly x: number;
  readonly y: number;
};

export type InteractionZone = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type PetInteractionInput = {
  readonly pointerDown?: boolean;
  readonly target?: PetInteractionTarget;
  readonly keyboardActionPressed?: boolean;
  readonly playerPosition?: WorldPoint;
  readonly playerFacing?: FacingDirection | null;
  readonly dogPosition?: WorldPoint;
};

export type KeyboardPetAvailabilityInput = {
  readonly playerPosition: WorldPoint;
  readonly playerFacing: FacingDirection | null;
  readonly dogPosition: WorldPoint;
};

export const PET_INTERACTION_ZONE_SIZE = 24;

export function getPetInteractionEvent(input: PetInteractionInput): DogInteractionEvent | null {
  if (input.pointerDown === true && input.target === "dog") {
    return { type: "pet_started" };
  }

  if (
    input.keyboardActionPressed === true &&
    input.playerPosition !== undefined &&
    input.playerFacing !== undefined &&
    input.dogPosition !== undefined &&
    canPetFromKeyboard({
      dogPosition: input.dogPosition,
      playerFacing: input.playerFacing,
      playerPosition: input.playerPosition,
    })
  ) {
    return { type: "pet_started" };
  }

  return null;
}

export function canPetFromKeyboard(input: KeyboardPetAvailabilityInput): boolean {
  if (input.playerFacing === null) {
    return false;
  }

  return isPointInsideInteractionZone(
    input.dogPosition,
    getFacingInteractionZone(input.playerPosition, input.playerFacing),
  );
}

export function getFacingInteractionZone(
  playerPosition: WorldPoint,
  facing: FacingDirection,
): InteractionZone {
  const halfZoneSize = PET_INTERACTION_ZONE_SIZE / 2;

  if (facing === "right") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x + halfZoneSize,
      y: playerPosition.y - halfZoneSize,
    };
  }

  if (facing === "left") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x - halfZoneSize - PET_INTERACTION_ZONE_SIZE,
      y: playerPosition.y - halfZoneSize,
    };
  }

  if (facing === "down") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x - halfZoneSize,
      y: playerPosition.y + halfZoneSize,
    };
  }

  return {
    height: PET_INTERACTION_ZONE_SIZE,
    width: PET_INTERACTION_ZONE_SIZE,
    x: playerPosition.x - halfZoneSize,
    y: playerPosition.y - halfZoneSize - PET_INTERACTION_ZONE_SIZE,
  };
}

export function isPointInsideInteractionZone(point: WorldPoint, zone: InteractionZone): boolean {
  const right = zone.x + zone.width;
  const bottom = zone.y + zone.height;

  return point.x >= zone.x && point.x <= right && point.y >= zone.y && point.y <= bottom;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/systems/dogInteraction/petInteraction.test.ts
```

예상: PASS.

- [ ] **Step 5: 커밋**

```bash
git add apps/game/src/game/systems/dogInteraction/petInteraction.ts apps/game/src/game/systems/dogInteraction/petInteraction.test.ts
git commit -m "feat: add keyboard pet interaction logic"
```

## Task 3: 캐릭터 토큰 SVG 에셋과 로드 helper

**파일:**

- Create: `apps/game/src/game/objects/characterTokenAssets.ts`
- Create: `apps/game/src/game/objects/characterTokenAssets.test.ts`
- Create: `apps/game/public/assets/images/player-token.svg`
- Create: `apps/game/public/assets/images/dog-token.svg`

- [ ] **Step 1: 실패하는 에셋 로드 테스트 작성**

`apps/game/src/game/objects/characterTokenAssets.test.ts`를 생성한다.

```ts
import {
  CHARACTER_TOKEN_SIZE,
  DOG_TOKEN_TEXTURE_KEY,
  PLAYER_TOKEN_TEXTURE_KEY,
  preloadCharacterTokenAssets,
} from "./characterTokenAssets";

describe("characterTokenAssets", () => {
  describe("preloadCharacterTokenAssets", () => {
    test("주인공과 강아지 SVG 토큰을 24x24 크기로 로드합니다.", () => {
      const svg = vi.fn();

      preloadCharacterTokenAssets({ svg });

      expect(svg).toHaveBeenCalledTimes(2);
      expect(svg).toHaveBeenNthCalledWith(1, PLAYER_TOKEN_TEXTURE_KEY, "images/player-token.svg", {
        height: CHARACTER_TOKEN_SIZE,
        width: CHARACTER_TOKEN_SIZE,
      });
      expect(svg).toHaveBeenNthCalledWith(2, DOG_TOKEN_TEXTURE_KEY, "images/dog-token.svg", {
        height: CHARACTER_TOKEN_SIZE,
        width: CHARACTER_TOKEN_SIZE,
      });
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/objects/characterTokenAssets.test.ts
```

예상: `Cannot find module './characterTokenAssets'`로 FAIL.

- [ ] **Step 3: 에셋 helper 구현**

`apps/game/src/game/objects/characterTokenAssets.ts`를 생성한다.

```ts
export const PLAYER_TOKEN_TEXTURE_KEY = "player-token";
export const DOG_TOKEN_TEXTURE_KEY = "dog-token";
export const CHARACTER_TOKEN_SIZE = 24;
export const CHARACTER_BODY_SIZE = 18;

export type CharacterTokenAssetLoader = {
  svg: (key: string, url: string, svgConfig: { width: number; height: number }) => void;
};

export function preloadCharacterTokenAssets(loader: CharacterTokenAssetLoader): void {
  loader.svg(PLAYER_TOKEN_TEXTURE_KEY, "images/player-token.svg", {
    height: CHARACTER_TOKEN_SIZE,
    width: CHARACTER_TOKEN_SIZE,
  });
  loader.svg(DOG_TOKEN_TEXTURE_KEY, "images/dog-token.svg", {
    height: CHARACTER_TOKEN_SIZE,
    width: CHARACTER_TOKEN_SIZE,
  });
}
```

- [ ] **Step 4: SVG 파일 추가**

`apps/game/public/assets/images/player-token.svg`를 생성한다.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="player token">
  <circle cx="12" cy="12" r="10" fill="#38bdf8" stroke="#0f172a" stroke-width="2" />
  <path d="M12 3 L15 8 H9 Z" fill="#f8fafc" />
  <circle cx="12" cy="13" r="3" fill="#0f172a" opacity="0.2" />
</svg>
```

`apps/game/public/assets/images/dog-token.svg`를 생성한다.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="dog token">
  <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#64748b" stroke-width="2" />
  <circle cx="8.5" cy="10" r="1.5" fill="#0f172a" />
  <circle cx="15.5" cy="10" r="1.5" fill="#0f172a" />
  <path d="M9 15 Q12 17 15 15" fill="none" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />
</svg>
```

- [ ] **Step 5: 테스트 통과 확인**

Run:

```bash
pnpm --filter @louis-world/game test -- src/game/objects/characterTokenAssets.test.ts
```

예상: PASS.

- [ ] **Step 6: 커밋**

```bash
git add apps/game/src/game/objects/characterTokenAssets.ts apps/game/src/game/objects/characterTokenAssets.test.ts apps/game/public/assets/images/player-token.svg apps/game/public/assets/images/dog-token.svg
git commit -m "feat: add character token assets"
```

## Task 4: 주인공/강아지/상호작용 힌트 Presenter

**파일:**

- Create: `apps/game/src/game/objects/PlayerPresenter.ts`
- Modify: `apps/game/src/game/objects/DogPresenter.ts`
- Create: `apps/game/src/game/objects/InteractionPromptPresenter.ts`

- [ ] **Step 1: PlayerPresenter 구현**

`apps/game/src/game/objects/PlayerPresenter.ts`를 생성한다.

```ts
import Phaser from "phaser";

import {
  CHARACTER_BODY_SIZE,
  CHARACTER_TOKEN_SIZE,
  PLAYER_TOKEN_TEXTURE_KEY,
} from "./characterTokenAssets";
import type { FacingDirection } from "../systems/playerMovement/playerMovement";

const FACING_ANGLE: Record<FacingDirection, number> = {
  down: 180,
  left: 270,
  right: 90,
  up: 0,
};

export class PlayerPresenter {
  private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, PLAYER_TOKEN_TEXTURE_KEY);
    this.sprite.setDisplaySize(CHARACTER_TOKEN_SIZE, CHARACTER_TOKEN_SIZE);
    this.sprite.setDepth(30);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(CHARACTER_BODY_SIZE, CHARACTER_BODY_SIZE, true);
  }

  getSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return this.sprite;
  }

  setFacingDirection(facing: FacingDirection): void {
    this.sprite.setAngle(FACING_ANGLE[facing]);
  }
}
```

- [ ] **Step 2: DogPresenter를 작은 SVG token 기반으로 교체**

`apps/game/src/game/objects/DogPresenter.ts`를 다음 내용으로 교체한다.

```ts
import Phaser from "phaser";

import {
  CHARACTER_BODY_SIZE,
  CHARACTER_TOKEN_SIZE,
  DOG_TOKEN_TEXTURE_KEY,
} from "./characterTokenAssets";
import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";
import { resolveDogPresentationStyle } from "./dogPresentationStyle";

export class DogPresenter {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, DOG_TOKEN_TEXTURE_KEY);
    this.sprite.setDisplaySize(CHARACTER_TOKEN_SIZE, CHARACTER_TOKEN_SIZE);
    this.sprite.setDepth(30);
    this.sprite.setImmovable(true);
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

  presentReaction(request: DogReactionRequest): void {
    const style = resolveDogPresentationStyle(request);

    this.sprite.setTint(style.bodyColor);
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
    this.scene.time.delayedCall(450, () => {
      this.sprite.clearTint();
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
}
```

- [ ] **Step 3: InteractionPromptPresenter 구현**

`apps/game/src/game/objects/InteractionPromptPresenter.ts`를 생성한다.

```ts
import Phaser from "phaser";

import type { WorldPoint } from "../systems/dogInteraction/petInteraction";

export type InteractionPromptState = {
  readonly visible: boolean;
  readonly targetPosition: WorldPoint;
};

export class InteractionPromptPresenter {
  private readonly keycap: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.keycap = scene.add
      .text(0, 0, "E", {
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        padding: { bottom: 2, left: 6, right: 6, top: 2 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false);
  }

  update(state: InteractionPromptState): void {
    this.keycap.setPosition(state.targetPosition.x, state.targetPosition.y - 24);
    this.keycap.setVisible(state.visible);
  }
}
```

- [ ] **Step 4: 타입체크로 presenter 코드 확인**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

예상: PASS. 실패하면 출력된 TypeScript 오류를 수정한 뒤 다음 단계로 간다.

- [ ] **Step 5: 커밋**

```bash
git add apps/game/src/game/objects/PlayerPresenter.ts apps/game/src/game/objects/DogPresenter.ts apps/game/src/game/objects/InteractionPromptPresenter.ts
git commit -m "feat: add token character presenters"
```

## Task 5: PreloaderScene과 GameScene 연결

**파일:**

- Modify: `apps/game/src/game/scenes/PreloaderScene.ts`
- Modify: `apps/game/src/game/scenes/GameScene.ts`

- [ ] **Step 1: PreloaderScene에 SVG token 로드 연결**

`apps/game/src/game/scenes/PreloaderScene.ts`를 다음 내용으로 교체한다.

```ts
import Phaser from "phaser";

import { preloadHomeYardMapAssets } from "../maps/homeYardAssets";
import { preloadCharacterTokenAssets } from "../objects/characterTokenAssets";
import { GameScene } from "./GameScene";

export class PreloaderScene extends Phaser.Scene {
  static readonly KEY = "preloader";

  constructor() {
    super(PreloaderScene.KEY);
  }

  preload(): void {
    this.load.setPath("assets");
    preloadHomeYardMapAssets(this.load);
    preloadCharacterTokenAssets(this.load);
  }

  create(): void {
    this.scene.start(GameScene.KEY);
  }
}
```

- [ ] **Step 2: GameScene에 이동, 충돌, 카메라, 키보드 상호작용 연결**

`apps/game/src/game/scenes/GameScene.ts`를 다음 내용으로 교체한다.

```ts
import Phaser from "phaser";

import { createHomeYardMap } from "../maps/createHomeYardMap";
import { DogPresenter } from "../objects/DogPresenter";
import { InteractionPromptPresenter } from "../objects/InteractionPromptPresenter";
import { PlayerPresenter } from "../objects/PlayerPresenter";
import {
  getPetInteractionEvent,
  canPetFromKeyboard,
} from "../systems/dogInteraction/petInteraction";
import { applyDogMoodDelta, createInitialDogMood } from "../systems/dogReaction/dogMood";
import type { DogInteractionEvent, DogMood } from "../systems/dogReaction/dogReactionTypes";
import { createDogReactionRequest } from "../systems/dogReaction/dogReactionSystem";
import { PlayerKeyboardController } from "../systems/playerMovement/PlayerKeyboardController";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  private dogMood: DogMood = createInitialDogMood();
  private dogPresenter?: DogPresenter;
  private interactionPromptPresenter?: InteractionPromptPresenter;
  private playerKeyboardController?: PlayerKeyboardController;
  private playerPresenter?: PlayerPresenter;

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    const homeYardMap = createHomeYardMap(this);

    this.playerPresenter = new PlayerPresenter(
      this,
      homeYardMap.markers.playerSpawn.x,
      homeYardMap.markers.playerSpawn.y,
    );
    this.dogPresenter = new DogPresenter(
      this,
      homeYardMap.markers.dogSpawn.x,
      homeYardMap.markers.dogSpawn.y,
    );
    this.playerKeyboardController = new PlayerKeyboardController(
      this,
      this.playerPresenter.getSprite(),
    );
    this.interactionPromptPresenter = new InteractionPromptPresenter(this);

    this.physics.add.collider(
      this.playerPresenter.getSprite(),
      homeYardMap.layers.collisionBlockout,
    );
    this.physics.add.collider(
      this.playerPresenter.getSprite(),
      this.dogPresenter.getPhysicsObject(),
    );

    this.dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (event) {
        this.runPetInteraction(event);
      }
    });

    this.cameras.main.setBounds(
      0,
      0,
      homeYardMap.map.widthInPixels,
      homeYardMap.map.heightInPixels,
    );
    this.cameras.main.startFollow(this.playerPresenter.getSprite(), true, 0.12, 0.12);
  }

  update(): void {
    if (
      !this.playerPresenter ||
      !this.dogPresenter ||
      !this.playerKeyboardController ||
      !this.interactionPromptPresenter
    ) {
      return;
    }

    this.playerKeyboardController.update();
    this.playerPresenter.setFacingDirection(this.playerKeyboardController.getFacingDirection());

    const playerPosition = this.playerPresenter.getSprite();
    const dogPosition = this.dogPresenter.getPosition();
    const playerFacing = this.playerKeyboardController.getFacingDirection();
    const canPet = canPetFromKeyboard({
      dogPosition,
      playerFacing,
      playerPosition,
    });

    this.interactionPromptPresenter.update({
      targetPosition: dogPosition,
      visible: canPet,
    });

    const event = getPetInteractionEvent({
      dogPosition,
      keyboardActionPressed: this.playerKeyboardController.consumeInteractJustPressed(),
      playerFacing,
      playerPosition,
    });

    if (event) {
      this.runPetInteraction(event);
    }
  }

  private runPetInteraction(event: DogInteractionEvent): void {
    if (!this.dogPresenter) {
      return;
    }

    const reaction = createDogReactionRequest(event, this.dogMood);

    this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
    this.dogPresenter.presentReaction(reaction);
  }
}
```

- [ ] **Step 3: 포맷 후 타입체크**

Run:

```bash
pnpm --filter @louis-world/game typecheck
```

예상: PASS.

- [ ] **Step 4: 전체 게임 테스트 실행**

Run:

```bash
pnpm --filter @louis-world/game test
```

예상: PASS.

- [ ] **Step 5: 커밋**

```bash
git add apps/game/src/game/scenes/PreloaderScene.ts apps/game/src/game/scenes/GameScene.ts
git commit -m "feat: wire keyboard action scene"
```

## Task 6: 빌드와 브라우저 수동 검증

**파일:**

- 계획된 소스 수정은 없다. 이 task는 통합된 동작을 검증한다.

- [ ] **Step 1: 프로덕션 빌드 확인**

Run:

```bash
pnpm --filter @louis-world/game build
```

예상: PASS.

- [ ] **Step 2: 개발 서버 실행**

Run:

```bash
pnpm --filter @louis-world/game dev
```

예상: Vite 로컬 URL이 출력된다. 보통 `http://localhost:5173/`이다.

- [ ] **Step 3: 브라우저에서 수동 검증**

Codex 브라우저에서 Vite URL을 열고 다음을 확인한다.

- 방향키를 누르고 있는 동안 주인공이 움직인다.
- 방향키를 떼면 주인공이 멈춘다.
- 대각선 이동이 한 방향 이동보다 빠르게 느껴지지 않는다.
- 주인공이 집, 닫힌 길, 맵 경계를 통과하지 못한다.
- 주인공이 강아지를 통과하지 못한다.
- 카메라가 주인공을 따라가고 맵 밖 빈 공간을 보여주지 않는다.
- 주인공이 강아지 앞에서 강아지를 바라볼 때만 `E` 힌트가 보인다.
- `E`를 한 번 누르면 쓰다듬기 반응이 한 번 실행된다.
- `E`를 누르고 있어도 쓰다듬기 반응이 반복 실행되지 않는다.
- 강아지를 클릭해도 쓰다듬기 반응이 실행된다.
- 강아지 반응은 작은 SVG 토큰의 tint/scale 변화와 별빛 파티클로 보인다.

- [ ] **Step 4: 최종 상태 확인**

Run:

```bash
git status --short
```

예상: 계획된 소스 변경은 이미 커밋되어 있고, 예상하지 않은 untracked 또는
modified 파일이 남아 있지 않다.

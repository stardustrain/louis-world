import {
  PlayerKeyboardController,
  type PlayerKeyboardInput,
  type PlayerMovementTarget,
} from "./PlayerKeyboardController";
import { PLAYER_MOVEMENT_SPEED } from "./playerMovement";

describe("PlayerKeyboardController", () => {
  describe("update", () => {
    test("방향키 상태를 읽어 player.setVelocity를 호출합니다.", () => {
      const input = new ControllablePlayerKeyboardInput();
      const player = new SpyPlayerMovementTarget();
      const controller = new PlayerKeyboardController(input, player);

      input.keyState = { down: false, left: false, right: true, up: false };
      controller.update();

      expect(player.velocity).toEqual({ x: PLAYER_MOVEMENT_SPEED, y: 0 });
    });

    test("이동 입력 후 facing을 갱신합니다.", () => {
      const input = new ControllablePlayerKeyboardInput();
      const player = new SpyPlayerMovementTarget();
      const controller = new PlayerKeyboardController(input, player);

      input.keyState = { down: false, left: true, right: false, up: false };
      controller.update();

      expect(controller.getFacingDirection()).toBe("left");
    });
  });

  describe("consumeInteractJustPressed", () => {
    test("단발 상호작용 입력을 반환합니다.", () => {
      const input = new ControllablePlayerKeyboardInput();
      const player = new SpyPlayerMovementTarget();
      const controller = new PlayerKeyboardController(input, player);

      input.interactJustPressed = true;

      expect(controller.consumeInteractJustPressed()).toBe(true);
      expect(controller.consumeInteractJustPressed()).toBe(false);
    });
  });
});

class ControllablePlayerKeyboardInput implements PlayerKeyboardInput {
  keyState = { down: false, left: false, right: false, up: false };
  interactJustPressed = false;

  readMovementKeys() {
    return this.keyState;
  }

  consumeInteractJustPressed(): boolean {
    const wasPressed = this.interactJustPressed;
    this.interactJustPressed = false;

    return wasPressed;
  }
}

class SpyPlayerMovementTarget implements PlayerMovementTarget {
  velocity = { x: 0, y: 0 };

  setVelocity(x: number, y: number): void {
    this.velocity = { x, y };
  }
}

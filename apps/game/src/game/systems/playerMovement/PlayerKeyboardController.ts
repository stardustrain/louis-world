import Phaser from "phaser";

import {
  DEFAULT_PLAYER_FACING,
  type FacingDirection,
  type MovementKeyState,
  resolvePlayerMovementIntent,
} from "./playerMovement";

export type PlayerKeyboardInput = {
  readMovementKeys(): MovementKeyState;
  consumeInteractJustPressed(): boolean;
};

export type PlayerMovementTarget = {
  setVelocity(x: number, y: number): void;
};

export class PlayerKeyboardController {
  private facing: FacingDirection = DEFAULT_PLAYER_FACING;

  constructor(
    private readonly input: PlayerKeyboardInput,
    private readonly player: PlayerMovementTarget,
  ) {}

  static fromScene(
    scene: Phaser.Scene,
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  ): PlayerKeyboardController | undefined {
    if (!scene.input.keyboard) {
      return undefined;
    }

    return new PlayerKeyboardController(
      new PhaserPlayerKeyboardInput(scene.input.keyboard),
      player,
    );
  }

  update(): void {
    const intent = resolvePlayerMovementIntent(this.input.readMovementKeys(), this.facing);

    this.facing = intent.facing;
    this.player.setVelocity(intent.velocity.x, intent.velocity.y);
  }

  getFacingDirection(): FacingDirection {
    return this.facing;
  }

  consumeInteractJustPressed(): boolean {
    return this.input.consumeInteractJustPressed();
  }
}

class PhaserPlayerKeyboardInput implements PlayerKeyboardInput {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly interactKey: Phaser.Input.Keyboard.Key;

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    this.cursors = keyboard.createCursorKeys();
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  readMovementKeys(): MovementKeyState {
    return {
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
    };
  }

  consumeInteractJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.interactKey);
  }
}

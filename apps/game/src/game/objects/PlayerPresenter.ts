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

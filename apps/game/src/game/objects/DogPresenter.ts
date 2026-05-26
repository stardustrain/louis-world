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
    this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncRingPosition, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.stopSyncingRingPosition, this);
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

  private stopSyncingRingPosition(): void {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncRingPosition, this);
  }
}

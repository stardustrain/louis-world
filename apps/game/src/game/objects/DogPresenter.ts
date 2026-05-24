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

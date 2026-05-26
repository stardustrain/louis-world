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

import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .text(centerX, centerY - 24, "Louis World", {
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        fontSize: "40px",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 28, "Phaser ready", {
        color: "#cbd5e1",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
      })
      .setOrigin(0.5);
  }
}

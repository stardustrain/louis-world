import Phaser from "phaser";

import { GameScene } from "./GameScene";

export class PreloaderScene extends Phaser.Scene {
  static readonly KEY = "preloader";

  constructor() {
    super(PreloaderScene.KEY);
  }

  preload(): void {
    this.load.setPath("assets");
  }

  create(): void {
    this.scene.start(GameScene.KEY);
  }
}

import Phaser from "phaser";

import { PreloaderScene } from "./PreloaderScene";

export class BootScene extends Phaser.Scene {
  static readonly KEY = "boot";

  constructor() {
    super(BootScene.KEY);
  }

  create(): void {
    this.scene.start(PreloaderScene.KEY);
  }
}

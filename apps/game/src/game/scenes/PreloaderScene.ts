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

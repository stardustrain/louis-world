import Phaser from "phaser";
import { describe, expect, it } from "vitest";

import { BootScene } from "./BootScene";
import { GameScene } from "./GameScene";
import { PreloaderScene } from "./PreloaderScene";

describe("initial Phaser scenes", () => {
  it("uses stable scene keys", () => {
    expect(BootScene.KEY).toBe("boot");
    expect(PreloaderScene.KEY).toBe("preloader");
    expect(GameScene.KEY).toBe("game");
  });

  it("constructs Phaser scene instances", () => {
    expect(new BootScene()).toBeInstanceOf(Phaser.Scene);
    expect(new PreloaderScene()).toBeInstanceOf(Phaser.Scene);
    expect(new GameScene()).toBeInstanceOf(Phaser.Scene);
  });
});

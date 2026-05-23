import { describe, expect, it } from "vitest";

import { createGameConfig, GAME_HEIGHT, GAME_PARENT_ID, GAME_WIDTH } from "./config";
import { getGameContainer } from "./createGame";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { PreloaderScene } from "./scenes/PreloaderScene";

describe("createGameConfig", () => {
  it("uses the approved logical size and parent", () => {
    const config = createGameConfig("custom-container");

    expect(config.parent).toBe("custom-container");
    expect(config.width).toBe(GAME_WIDTH);
    expect(config.height).toBe(GAME_HEIGHT);
    expect(GAME_PARENT_ID).toBe("game-container");
    expect(GAME_WIDTH).toBe(1280);
    expect(GAME_HEIGHT).toBe(720);
  });

  it("uses Arcade Physics with zero gravity", () => {
    const config = createGameConfig("custom-container");
    const physics = config.physics as {
      default: string;
      arcade: {
        gravity: {
          x: number;
          y: number;
        };
      };
    };

    expect(physics.default).toBe("arcade");
    expect(physics.arcade.gravity).toEqual({ x: 0, y: 0 });
  });

  it("registers the initial scene order", () => {
    const config = createGameConfig("custom-container");

    expect(config.scene).toEqual([BootScene, PreloaderScene, GameScene]);
  });
});

describe("getGameContainer", () => {
  it("returns the existing game container", () => {
    document.body.innerHTML = `<div id="${GAME_PARENT_ID}"></div>`;

    expect(getGameContainer()).toBe(document.getElementById(GAME_PARENT_ID));
  });

  it("throws a clear error when the container is missing", () => {
    expect(() => getGameContainer("missing-container")).toThrow(
      "Missing game container: #missing-container",
    );
  });
});

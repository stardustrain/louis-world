import Phaser from "phaser";

import { createGameConfig, GAME_PARENT_ID } from "./config";

export function getGameContainer(containerId = GAME_PARENT_ID): HTMLElement {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Missing game container: #${containerId}`);
  }

  return container;
}

export function createGame(containerId = GAME_PARENT_ID): Phaser.Game {
  const container = getGameContainer(containerId);

  return new Phaser.Game(createGameConfig(container));
}

import Phaser from "phaser";

import { createHomeYardMap } from "../maps/createHomeYardMap";
import { DogPresenter } from "../objects/DogPresenter";
import { applyDogMoodDelta, createInitialDogMood } from "../systems/dogReaction/dogMood";
import type { DogMood } from "../systems/dogReaction/dogReactionTypes";
import { createDogReactionRequest } from "../systems/dogReaction/dogReactionSystem";
import { getPetInteractionEvent } from "../systems/dogInteraction/petInteraction";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  private dogMood: DogMood = createInitialDogMood();

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    const homeYardMap = createHomeYardMap(this);
    const dogPresenter = new DogPresenter(
      this,
      homeYardMap.markers.dogSpawn.x,
      homeYardMap.markers.dogSpawn.y,
    );

    dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (!event) {
        return;
      }

      const reaction = createDogReactionRequest(event, this.dogMood);
      this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
      dogPresenter.presentReaction(reaction);
    });

    if (import.meta.env.DEV) {
      addDebugMarker(
        this,
        homeYardMap.markers.playerSpawn.x,
        homeYardMap.markers.playerSpawn.y,
        0x38bdf8,
      );
      addDebugMarker(
        this,
        homeYardMap.markers.dogSpawn.x,
        homeYardMap.markers.dogSpawn.y,
        0xfacc15,
      );
    }
  }
}

function addDebugMarker(scene: Phaser.Scene, x: number, y: number, color: number): void {
  scene.add.circle(x, y, 8, color, 0.9).setDepth(100);
}

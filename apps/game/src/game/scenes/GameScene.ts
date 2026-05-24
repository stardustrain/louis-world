import Phaser from "phaser";

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
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.cameras.main.setBackgroundColor("#18233f");
    this.add.circle(centerX, centerY + 88, 260, 0x24304f, 0.7);
    this.add.circle(centerX + 220, centerY - 180, 52, 0xfde68a, 0.88);

    const dogPresenter = new DogPresenter(this, centerX, centerY + 72);

    dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (!event) {
        return;
      }

      const reaction = createDogReactionRequest(event, this.dogMood);
      this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
      dogPresenter.presentReaction(reaction);
    });
  }
}

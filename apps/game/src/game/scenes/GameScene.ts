import Phaser from "phaser";

import { createHomeYardMap } from "../maps/createHomeYardMap";
import { DogPresenter } from "../objects/DogPresenter";
import { InteractionPromptPresenter } from "../objects/InteractionPromptPresenter";
import { PlayerPresenter } from "../objects/PlayerPresenter";
import {
  createInitialDogFollowState,
  type DogFollowState,
  resolveDogFollowIntent,
} from "../systems/dogFollow/dogFollow";
import { applyDogMoodDelta, createInitialDogMood } from "../systems/dogReaction/dogMood";
import type { DogInteractionEvent, DogMood } from "../systems/dogReaction/dogReactionTypes";
import { createDogReactionRequest } from "../systems/dogReaction/dogReactionSystem";
import {
  canPetFromKeyboard,
  getPetInteractionEvent,
} from "../systems/dogInteraction/petInteraction";
import { PlayerKeyboardController } from "../systems/playerMovement/PlayerKeyboardController";

export class GameScene extends Phaser.Scene {
  static readonly KEY = "game";

  private dogFollowState: DogFollowState = createInitialDogFollowState();
  private dogMood: DogMood = createInitialDogMood();
  private dogPresenter: DogPresenter | undefined;
  private interactionPromptPresenter: InteractionPromptPresenter | undefined;
  private playerDogCollider: Phaser.Physics.Arcade.Collider | undefined;
  private playerKeyboardController: PlayerKeyboardController | undefined;
  private playerPresenter: PlayerPresenter | undefined;

  constructor() {
    super(GameScene.KEY);
  }

  create(): void {
    this.dogFollowState = createInitialDogFollowState();

    const homeYardMap = createHomeYardMap(this);
    this.physics.world.setBounds(
      0,
      0,
      homeYardMap.map.widthInPixels,
      homeYardMap.map.heightInPixels,
    );

    const playerPresenter = new PlayerPresenter(
      this,
      homeYardMap.markers.playerSpawn.x,
      homeYardMap.markers.playerSpawn.y,
    );
    const dogPresenter = new DogPresenter(
      this,
      homeYardMap.markers.dogSpawn.x,
      homeYardMap.markers.dogSpawn.y,
    );
    const playerSprite = playerPresenter.getSprite();
    const dogSprite = dogPresenter.getPhysicsObject();

    dogPresenter.getInteractiveObject().on("pointerdown", () => {
      const event = getPetInteractionEvent({ pointerDown: true, target: "dog" });

      if (!event) {
        return;
      }

      this.runPetInteraction(event);
    });

    this.physics.add.collider(playerSprite, homeYardMap.layers.collisionBlockout);
    this.physics.add.collider(dogSprite, homeYardMap.layers.collisionBlockout);
    this.playerDogCollider = this.physics.add.collider(playerSprite, dogSprite);

    this.cameras.main.setBounds(
      0,
      0,
      homeYardMap.map.widthInPixels,
      homeYardMap.map.heightInPixels,
    );
    this.cameras.main.startFollow(playerSprite, true, 0.12, 0.12);

    this.playerPresenter = playerPresenter;
    this.dogPresenter = dogPresenter;
    this.interactionPromptPresenter = new InteractionPromptPresenter(this);
    this.playerKeyboardController = PlayerKeyboardController.fromScene(this, playerSprite);
  }

  update(): void {
    if (
      this.dogPresenter === undefined ||
      this.interactionPromptPresenter === undefined ||
      this.playerKeyboardController === undefined ||
      this.playerPresenter === undefined
    ) {
      return;
    }

    this.playerKeyboardController.update();

    const playerFacing = this.playerKeyboardController.getFacingDirection();
    const playerSprite = this.playerPresenter.getSprite();
    const playerPosition = { x: playerSprite.x, y: playerSprite.y };
    const playerVelocity = {
      x: playerSprite.body.velocity.x,
      y: playerSprite.body.velocity.y,
    };
    const dogPosition = this.dogPresenter.getPosition();
    const followIntent = resolveDogFollowIntent({
      dogPosition,
      playerFacing,
      playerPosition,
      playerVelocity,
      previousState: this.dogFollowState,
    });
    const canPet = canPetFromKeyboard({
      dogPosition,
      playerFacing,
      playerPosition,
    });

    this.dogFollowState = { mode: followIntent.mode };
    this.dogPresenter.applyFollowIntent(followIntent);
    this.updatePlayerDogCollider(followIntent.shouldCollideWithPlayer);
    this.playerPresenter.setFacingDirection(playerFacing);
    this.interactionPromptPresenter.update({ targetPosition: dogPosition, visible: canPet });

    const event = getPetInteractionEvent({
      dogPosition,
      keyboardActionPressed: this.playerKeyboardController.consumeInteractJustPressed(),
      playerFacing,
      playerPosition,
    });

    if (!event) {
      return;
    }

    this.runPetInteraction(event);
  }

  private runPetInteraction(event: DogInteractionEvent): void {
    if (this.dogPresenter === undefined) {
      return;
    }

    const reaction = createDogReactionRequest(event, this.dogMood);
    this.dogMood = applyDogMoodDelta(this.dogMood, reaction.moodDelta);
    this.dogPresenter.presentReaction(reaction);
  }

  private updatePlayerDogCollider(active: boolean): void {
    if (this.playerDogCollider === undefined) {
      return;
    }

    this.playerDogCollider.active = active;
  }
}

import type { FacingDirection } from "../playerMovement/playerMovement";
import type { DogInteractionEvent } from "../dogReaction/dogReactionTypes";

export type PetInteractionTarget = "dog" | "none";

export type WorldPoint = {
  readonly x: number;
  readonly y: number;
};

export type InteractionZone = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type PointerPetInteractionInput = {
  readonly pointerDown: boolean;
  readonly target: PetInteractionTarget;
};

export type KeyboardPetInteractionInput = {
  readonly keyboardActionPressed: boolean;
  readonly playerPosition: WorldPoint;
  readonly playerFacing: FacingDirection | null;
  readonly dogPosition: WorldPoint;
};

export type PetInteractionInput = PointerPetInteractionInput | KeyboardPetInteractionInput;

export type KeyboardPetAvailabilityInput = {
  readonly playerPosition: WorldPoint;
  readonly playerFacing: FacingDirection | null;
  readonly dogPosition: WorldPoint;
};

export const PET_INTERACTION_ZONE_SIZE = 32;

export function getPetInteractionEvent(input: PetInteractionInput): DogInteractionEvent | null {
  if ("pointerDown" in input) {
    if (input.pointerDown === true && input.target === "dog") {
      return { type: "pet_started" };
    }

    return null;
  }

  if (input.keyboardActionPressed === true) {
    if (
      canPetFromKeyboard({
        dogPosition: input.dogPosition,
        playerFacing: input.playerFacing,
        playerPosition: input.playerPosition,
      })
    ) {
      return { type: "pet_started" };
    }
  }

  return null;
}

export function canPetFromKeyboard(input: KeyboardPetAvailabilityInput): boolean {
  if (input.playerFacing === null) {
    return false;
  }

  return isPointInsideInteractionZone(
    input.dogPosition,
    getFacingInteractionZone(input.playerPosition, input.playerFacing),
  );
}

export function getFacingInteractionZone(
  playerPosition: WorldPoint,
  facing: FacingDirection,
): InteractionZone {
  const halfZoneSize = PET_INTERACTION_ZONE_SIZE / 2;

  if (facing === "right") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x + halfZoneSize,
      y: playerPosition.y - halfZoneSize,
    };
  }

  if (facing === "left") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x - halfZoneSize - PET_INTERACTION_ZONE_SIZE,
      y: playerPosition.y - halfZoneSize,
    };
  }

  if (facing === "down") {
    return {
      height: PET_INTERACTION_ZONE_SIZE,
      width: PET_INTERACTION_ZONE_SIZE,
      x: playerPosition.x - halfZoneSize,
      y: playerPosition.y + halfZoneSize,
    };
  }

  return {
    height: PET_INTERACTION_ZONE_SIZE,
    width: PET_INTERACTION_ZONE_SIZE,
    x: playerPosition.x - halfZoneSize,
    y: playerPosition.y - halfZoneSize - PET_INTERACTION_ZONE_SIZE,
  };
}

export function isPointInsideInteractionZone(point: WorldPoint, zone: InteractionZone): boolean {
  const right = zone.x + zone.width;
  const bottom = zone.y + zone.height;

  return point.x >= zone.x && point.x <= right && point.y >= zone.y && point.y <= bottom;
}

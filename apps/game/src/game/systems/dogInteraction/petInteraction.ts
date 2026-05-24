import type { DogInteractionEvent } from "../dogReaction/dogReactionTypes";

export type PetInteractionTarget = "dog" | "none";

export type PetInteractionInput = {
  pointerDown: boolean;
  target: PetInteractionTarget;
};

export function getPetInteractionEvent(input: PetInteractionInput): DogInteractionEvent | null {
  if (!input.pointerDown) {
    return null;
  }

  if (input.target !== "dog") {
    return null;
  }

  return { type: "pet_started" };
}

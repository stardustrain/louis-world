import type { DogInteractionEvent, DogMood, DogReactionRequest } from "./dogReactionTypes";

export function createDogReactionRequest(
  event: DogInteractionEvent,
  mood: DogMood,
): DogReactionRequest {
  if (event.type === "pet_started") {
    return createPetStartedReaction(mood);
  }

  return {
    expression: "relaxed",
    effect: "none",
    intensity: "none",
    moodDelta: { calmness: 0 },
  };
}

function createPetStartedReaction(mood: DogMood): DogReactionRequest {
  const expression = mood.calmness > 0 ? "relaxed" : "cautious_to_relaxed";

  return {
    expression,
    effect: "starlight_bloom",
    intensity: "soft",
    moodDelta: { calmness: 1 },
  };
}

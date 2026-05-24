import type { DogMood, DogMoodDelta } from "./dogReactionTypes";

export function createInitialDogMood(): DogMood {
  return { calmness: 0 };
}

export function applyDogMoodDelta(mood: DogMood, delta: DogMoodDelta): DogMood {
  return {
    calmness: clampCalmness(mood.calmness + delta.calmness),
  };
}

function clampCalmness(value: number): number {
  return Math.min(3, Math.max(0, value));
}

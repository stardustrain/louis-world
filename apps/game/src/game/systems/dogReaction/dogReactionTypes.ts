export type DogInteractionEvent = {
  type: "pet_started";
};

export type DogExpression = "cautious_to_relaxed" | "relaxed";

export type DogEffect = "starlight_bloom" | "none";

export type DogReactionIntensity = "soft" | "none";

export type DogMood = {
  calmness: number;
};

export type DogMoodDelta = {
  calmness: number;
};

export type DogReactionRequest = {
  expression: DogExpression;
  effect: DogEffect;
  intensity: DogReactionIntensity;
  moodDelta: DogMoodDelta;
};

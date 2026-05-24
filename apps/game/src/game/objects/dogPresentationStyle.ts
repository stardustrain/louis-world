import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";

export type DogPresentationRequest =
  | Pick<DogReactionRequest, "expression" | "effect" | "intensity">
  | {
      expression: string;
      effect: string;
      intensity: string;
    };

export type DogPresentationStyle = {
  faceText: string;
  bodyColor: number;
  bodyStrokeColor: number;
  effectEnabled: boolean;
  effectColor: number;
  effectParticleCount: number;
};

export function resolveDogPresentationStyle(request: DogPresentationRequest): DogPresentationStyle {
  const effectEnabled = request.effect === "starlight_bloom";

  return {
    faceText: resolveFaceText(request.expression),
    bodyColor: 0xf8fafc,
    bodyStrokeColor: effectEnabled ? 0xfacc15 : 0x94a3b8,
    effectEnabled,
    effectColor: 0xfde68a,
    effectParticleCount: resolveEffectParticleCount(request.intensity, effectEnabled),
  };
}

function resolveFaceText(expression: string): string {
  if (expression === "cautious_to_relaxed") {
    return ":)";
  }

  if (expression === "relaxed") {
    return ":)";
  }

  return ":)";
}

function resolveEffectParticleCount(intensity: string, effectEnabled: boolean): number {
  if (!effectEnabled) {
    return 0;
  }

  if (intensity === "soft") {
    return 8;
  }

  return 4;
}

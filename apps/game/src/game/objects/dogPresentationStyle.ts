import type { DogReactionRequest } from "../systems/dogReaction/dogReactionTypes";

export type DogPresentationRequest =
  | Pick<DogReactionRequest, "expression" | "effect" | "intensity">
  | {
      expression: string;
      effect: string;
      intensity: string;
    };

export type DogPresentationStyle = {
  tokenTintColor: number;
  ringStrokeColor: number;
  effectEnabled: boolean;
  effectColor: number;
  effectParticleCount: number;
};

export function resolveDogPresentationStyle(request: DogPresentationRequest): DogPresentationStyle {
  const effectEnabled = request.effect === "starlight_bloom";

  return {
    tokenTintColor: resolveTokenTintColor(request.expression, effectEnabled),
    ringStrokeColor: effectEnabled ? 0xfacc15 : 0x94a3b8,
    effectEnabled,
    effectColor: 0xfde68a,
    effectParticleCount: resolveEffectParticleCount(request.intensity, effectEnabled),
  };
}

function resolveTokenTintColor(expression: string, effectEnabled: boolean): number {
  if (!effectEnabled) {
    return 0xf8fafc;
  }

  if (expression === "cautious_to_relaxed") {
    return 0xfef3c7;
  }

  if (expression === "relaxed") {
    return 0xfef3c7;
  }

  return 0xf8fafc;
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

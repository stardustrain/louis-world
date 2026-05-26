import type { FacingDirection, MovementVector } from "../playerMovement/playerMovement";

export type DogFollowMode = "following" | "settled";

export type DogFollowPoint = {
  readonly x: number;
  readonly y: number;
};

export type DogFollowState = {
  readonly mode: DogFollowMode;
};

export type DogFollowInput = {
  readonly dogPosition: DogFollowPoint;
  readonly playerFacing: FacingDirection;
  readonly playerPosition: DogFollowPoint;
  readonly playerVelocity: MovementVector;
  readonly previousState: DogFollowState;
};

export type DogFollowIntent = {
  readonly mode: DogFollowMode;
  readonly shouldCollideWithPlayer: boolean;
  readonly targetPosition: DogFollowPoint;
  readonly velocity: MovementVector;
};

export const DOG_FOLLOW_START_DISTANCE = 80;
export const DOG_FOLLOW_STOP_DISTANCE = 56;
export const DOG_FOLLOW_SPEED = 105;
export const DOG_FOLLOW_TARGET_OFFSET = 48;

export function createInitialDogFollowState(): DogFollowState {
  return { mode: "settled" };
}

export function resolveDogFollowIntent(input: DogFollowInput): DogFollowIntent {
  const mode = resolveDogFollowMode(
    getDistance(input.dogPosition, input.playerPosition),
    input.previousState.mode,
  );
  const targetPosition = resolveDogFollowTarget(input);

  if (mode === "settled") {
    return {
      mode,
      shouldCollideWithPlayer: true,
      targetPosition,
      velocity: { x: 0, y: 0 },
    };
  }

  return {
    mode,
    shouldCollideWithPlayer: false,
    targetPosition,
    velocity: resolveVelocity(input.dogPosition, targetPosition),
  };
}

function resolveDogFollowMode(playerDistance: number, previousMode: DogFollowMode): DogFollowMode {
  if (previousMode === "following") {
    if (playerDistance <= DOG_FOLLOW_STOP_DISTANCE) {
      return "settled";
    }

    return "following";
  }

  if (playerDistance >= DOG_FOLLOW_START_DISTANCE) {
    return "following";
  }

  return "settled";
}

function resolveDogFollowTarget(input: DogFollowInput): DogFollowPoint {
  if (isMoving(input.playerVelocity)) {
    return resolveMovingPlayerTarget(input.playerPosition, input.playerFacing);
  }

  return resolveSettledPlayerTarget(input.dogPosition, input.playerPosition, input.playerFacing);
}

function resolveMovingPlayerTarget(
  playerPosition: DogFollowPoint,
  playerFacing: FacingDirection,
): DogFollowPoint {
  if (playerFacing === "up") {
    return offsetPoint(playerPosition, 0, DOG_FOLLOW_TARGET_OFFSET);
  }

  if (playerFacing === "down") {
    return offsetPoint(playerPosition, 0, -DOG_FOLLOW_TARGET_OFFSET);
  }

  if (playerFacing === "left") {
    return offsetPoint(playerPosition, DOG_FOLLOW_TARGET_OFFSET, 0);
  }

  return offsetPoint(playerPosition, -DOG_FOLLOW_TARGET_OFFSET, 0);
}

function resolveSettledPlayerTarget(
  dogPosition: DogFollowPoint,
  playerPosition: DogFollowPoint,
  playerFacing: FacingDirection,
): DogFollowPoint {
  if (playerFacing === "up" || playerFacing === "down") {
    return chooseCloserPoint(dogPosition, [
      offsetPoint(playerPosition, -DOG_FOLLOW_TARGET_OFFSET, 0),
      offsetPoint(playerPosition, DOG_FOLLOW_TARGET_OFFSET, 0),
    ]);
  }

  return chooseCloserPoint(dogPosition, [
    offsetPoint(playerPosition, 0, -DOG_FOLLOW_TARGET_OFFSET),
    offsetPoint(playerPosition, 0, DOG_FOLLOW_TARGET_OFFSET),
  ]);
}

function chooseCloserPoint(
  origin: DogFollowPoint,
  candidates: readonly [DogFollowPoint, DogFollowPoint],
): DogFollowPoint {
  const firstDistance = getDistance(origin, candidates[0]);
  const secondDistance = getDistance(origin, candidates[1]);

  if (firstDistance <= secondDistance) {
    return candidates[0];
  }

  return candidates[1];
}

function resolveVelocity(
  currentPosition: DogFollowPoint,
  targetPosition: DogFollowPoint,
): MovementVector {
  const deltaX = targetPosition.x - currentPosition.x;
  const deltaY = targetPosition.y - currentPosition.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= 0.0001) {
    return { x: 0, y: 0 };
  }

  return {
    x: (deltaX / distance) * DOG_FOLLOW_SPEED,
    y: (deltaY / distance) * DOG_FOLLOW_SPEED,
  };
}

function offsetPoint(point: DogFollowPoint, x: number, y: number): DogFollowPoint {
  return {
    x: point.x + x,
    y: point.y + y,
  };
}

function getDistance(firstPoint: DogFollowPoint, secondPoint: DogFollowPoint): number {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function isMoving(velocity: MovementVector): boolean {
  return Math.hypot(velocity.x, velocity.y) > 0;
}

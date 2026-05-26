export type FacingDirection = "up" | "down" | "left" | "right";

export type MovementKeyState = {
  readonly up: boolean;
  readonly down: boolean;
  readonly left: boolean;
  readonly right: boolean;
};

export type MovementVector = {
  readonly x: number;
  readonly y: number;
};

export type PlayerMovementIntent = {
  readonly velocity: MovementVector;
  readonly facing: FacingDirection;
};

export const PLAYER_MOVEMENT_SPEED = 140;
export const DEFAULT_PLAYER_FACING: FacingDirection = "down";

export function resolvePlayerMovementIntent(
  keys: MovementKeyState,
  previousFacing: FacingDirection = DEFAULT_PLAYER_FACING,
): PlayerMovementIntent {
  const axisX = Number(keys.right) - Number(keys.left);
  const axisY = Number(keys.down) - Number(keys.up);

  if (axisX === 0 && axisY === 0) {
    return {
      facing: previousFacing,
      velocity: { x: 0, y: 0 },
    };
  }

  const magnitude = Math.hypot(axisX, axisY);

  return {
    facing: resolveFacingDirection(axisX, axisY, previousFacing),
    velocity: {
      x: (axisX / magnitude) * PLAYER_MOVEMENT_SPEED,
      y: (axisY / magnitude) * PLAYER_MOVEMENT_SPEED,
    },
  };
}

function resolveFacingDirection(
  axisX: number,
  axisY: number,
  previousFacing: FacingDirection,
): FacingDirection {
  if (isFacingAxisHeld(axisX, axisY, previousFacing)) {
    return previousFacing;
  }

  if (axisX < 0) {
    return "left";
  }

  if (axisX > 0) {
    return "right";
  }

  if (axisY < 0) {
    return "up";
  }

  return "down";
}

function isFacingAxisHeld(axisX: number, axisY: number, facing: FacingDirection): boolean {
  if (facing === "left") {
    return axisX < 0;
  }

  if (facing === "right") {
    return axisX > 0;
  }

  if (facing === "up") {
    return axisY < 0;
  }

  return axisY > 0;
}

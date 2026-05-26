import type { FacingDirection, MovementVector } from "../playerMovement/playerMovement";
import type { DogFollowPoint } from "./dogFollow";
import {
  createInitialDogFollowState,
  DOG_FOLLOW_SPEED,
  DOG_FOLLOW_START_DISTANCE,
  resolveDogFollowIntent,
} from "./dogFollow";

type MovingPlayerTargetTestCase = readonly [FacingDirection, MovementVector, DogFollowPoint];

const movingPlayerTargetTestCases: readonly MovingPlayerTargetTestCase[] = [
  ["up", { x: 0, y: -140 }, { x: 100, y: 148 }],
  ["down", { x: 0, y: 140 }, { x: 100, y: 52 }],
  ["left", { x: -140, y: 0 }, { x: 148, y: 100 }],
  ["right", { x: 140, y: 0 }, { x: 52, y: 100 }],
];

describe("dogFollow", () => {
  describe("createInitialDogFollowState", () => {
    test("강아지는 안정된 상태로 시작합니다.", () => {
      expect(createInitialDogFollowState()).toEqual({ mode: "settled" });
    });
  });

  describe("resolveDogFollowIntent", () => {
    test("강아지 따라오기 시작 거리는 80px이고 속도는 105px/s입니다.", () => {
      expect(DOG_FOLLOW_START_DISTANCE).toBe(80);
      expect(DOG_FOLLOW_SPEED).toBe(105);
    });

    test("안정 상태에서 주인과 80px 이상 멀어지면 따라오기 시작합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 80, y: 0 },
        playerVelocity: { x: 140, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(intent.mode).toBe("following");
      expect(intent.shouldCollideWithPlayer).toBe(false);
    });

    test("따라오는 중 주인과 정확히 56px 떨어지면 안정 상태가 됩니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 44, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 100, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent).toMatchObject({
        mode: "settled",
        shouldCollideWithPlayer: true,
        velocity: { x: 0, y: 0 },
      });
    });

    test("따라오는 중 주인과 56px보다 멀면 따라오기를 유지합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 72, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent.mode).toBe("following");
    });

    test("안정 상태에서 주인과 80px보다 가까우면 안정 상태를 유지합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 79, y: 0 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(intent.mode).toBe("settled");
    });

    test("따라오는 velocity 크기는 105px/s입니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 0, y: 0 },
        playerFacing: "right",
        playerPosition: { x: 120, y: 0 },
        playerVelocity: { x: 140, y: 0 },
        previousState: { mode: "settled" },
      });

      expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(DOG_FOLLOW_SPEED);
    });

    test.each(movingPlayerTargetTestCases)(
      "주인이 %s 방향으로 움직이는 중에는 facing 반대 방향 목표를 선택합니다.",
      (playerFacing, playerVelocity, expectedTargetPosition) => {
        expect(
          resolveDogFollowIntent({
            dogPosition: { x: 100, y: 260 },
            playerFacing,
            playerPosition: { x: 100, y: 100 },
            playerVelocity,
            previousState: { mode: "settled" },
          }).targetPosition,
        ).toEqual(expectedTargetPosition);
      },
    );

    test("주인이 멈춰 있고 위나 아래를 보면 더 가까운 좌우 목표를 선택합니다.", () => {
      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 0, y: 100 },
          playerFacing: "down",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 52, y: 100 });

      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 220, y: 100 },
          playerFacing: "up",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 148, y: 100 });
    });

    test("주인이 멈춰 있고 왼쪽이나 오른쪽을 보면 더 가까운 위아래 목표를 선택합니다.", () => {
      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 100, y: 0 },
          playerFacing: "right",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 100, y: 52 });

      expect(
        resolveDogFollowIntent({
          dogPosition: { x: 100, y: 220 },
          playerFacing: "left",
          playerPosition: { x: 100, y: 100 },
          playerVelocity: { x: 0, y: 0 },
          previousState: { mode: "settled" },
        }).targetPosition,
      ).toEqual({ x: 100, y: 148 });
    });

    test("목표 위치에 이미 도달한 상태에서도 유한한 zero velocity를 반환합니다.", () => {
      const intent = resolveDogFollowIntent({
        dogPosition: { x: 52, y: 100 },
        playerFacing: "up",
        playerPosition: { x: 100, y: 100 },
        playerVelocity: { x: 0, y: 0 },
        previousState: { mode: "following" },
      });

      expect(intent.velocity).toEqual({ x: 0, y: 0 });
      expect(Number.isFinite(intent.velocity.x)).toBe(true);
      expect(Number.isFinite(intent.velocity.y)).toBe(true);
    });
  });
});

import {
  DEFAULT_PLAYER_FACING,
  PLAYER_MOVEMENT_SPEED,
  resolvePlayerMovementIntent,
} from "./playerMovement";

describe("playerMovement", () => {
  describe("resolvePlayerMovementIntent", () => {
    test("플레이어 기본 이동 속도는 140px/s입니다.", () => {
      expect(PLAYER_MOVEMENT_SPEED).toBe(140);
    });

    test("아무 방향키도 누르지 않으면 멈추고 기존 방향을 유지합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: false, left: false, right: false, up: false }, "left"),
      ).toEqual({
        facing: "left",
        velocity: { x: 0, y: 0 },
      });
    });

    test("이전 방향이 없으면 기본 방향은 아래입니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: false,
          up: false,
        }).facing,
      ).toBe(DEFAULT_PLAYER_FACING);
    });

    test("오른쪽 입력은 오른쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: true,
          up: false,
        }),
      ).toEqual({
        facing: "right",
        velocity: { x: PLAYER_MOVEMENT_SPEED, y: 0 },
      });
    });

    test("왼쪽 입력은 왼쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: true,
          right: false,
          up: false,
        }),
      ).toEqual({
        facing: "left",
        velocity: { x: -PLAYER_MOVEMENT_SPEED, y: 0 },
      });
    });

    test("위쪽 입력은 위쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: false,
          left: false,
          right: false,
          up: true,
        }),
      ).toEqual({
        facing: "up",
        velocity: { x: 0, y: -PLAYER_MOVEMENT_SPEED },
      });
    });

    test("아래쪽 입력은 아래쪽 속도와 facing을 만듭니다.", () => {
      expect(
        resolvePlayerMovementIntent({
          down: true,
          left: false,
          right: false,
          up: false,
        }),
      ).toEqual({
        facing: "down",
        velocity: { x: 0, y: PLAYER_MOVEMENT_SPEED },
      });
    });

    test("대각선 입력은 한 방향 이동과 같은 속도로 정규화합니다.", () => {
      const intent = resolvePlayerMovementIntent({
        down: false,
        left: false,
        right: true,
        up: true,
      });

      expect(Math.hypot(intent.velocity.x, intent.velocity.y)).toBeCloseTo(PLAYER_MOVEMENT_SPEED);
      expect(intent.velocity.x).toBeCloseTo(98.9949, 4);
      expect(intent.velocity.y).toBeCloseTo(-98.9949, 4);
    });

    test("대각선 입력 중 이전 facing이 눌린 축이면 그 방향을 유지합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: false, left: false, right: true, up: true }, "up")
          .facing,
      ).toBe("up");
    });

    test("대각선 입력 중 이전 facing이 눌린 축이 아니면 가로 방향을 우선합니다.", () => {
      expect(
        resolvePlayerMovementIntent({ down: true, left: true, right: false, up: false }, "up")
          .facing,
      ).toBe("left");
    });
  });
});

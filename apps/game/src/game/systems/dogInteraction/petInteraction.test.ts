import {
  canPetFromKeyboard,
  getFacingInteractionZone,
  getPetInteractionEvent,
  isPointInsideInteractionZone,
} from "./petInteraction";

describe("petInteraction", () => {
  describe("getPetInteractionEvent", () => {
    test("포인터가 강아지 위에서 눌리면 쓰다듬기 이벤트를 만듭니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: true, target: "dog" })).toEqual({
        type: "pet_started",
      });
    });

    test("포인터가 눌리지 않았으면 이벤트를 만들지 않습니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: false, target: "dog" })).toBeNull();
    });

    test("강아지가 포인터 대상이 아니면 이벤트를 만들지 않습니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: true, target: "none" })).toBeNull();
    });

    test("E 키가 막 눌렸고 강아지가 앞쪽 영역 안에 있으면 쓰다듬기 이벤트를 만듭니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 646, y: 368 },
          keyboardActionPressed: true,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toEqual({ type: "pet_started" });
    });

    test("E 키가 막 눌리지 않았으면 키보드 쓰다듬기 이벤트를 만들지 않습니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 646, y: 368 },
          keyboardActionPressed: false,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toBeNull();
    });

    test("강아지가 앞쪽 영역 밖에 있으면 키보드 쓰다듬기 이벤트를 만들지 않습니다.", () => {
      expect(
        getPetInteractionEvent({
          dogPosition: { x: 700, y: 368 },
          keyboardActionPressed: true,
          playerFacing: "right",
          playerPosition: { x: 624, y: 368 },
        }),
      ).toBeNull();
    });
  });

  describe("getFacingInteractionZone", () => {
    test("오른쪽을 바라보면 주인공 오른쪽 32x32 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "right")).toEqual({
        height: 32,
        width: 32,
        x: 116,
        y: 184,
      });
    });

    test("왼쪽을 바라보면 주인공 왼쪽 32x32 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "left")).toEqual({
        height: 32,
        width: 32,
        x: 52,
        y: 184,
      });
    });

    test("아래를 바라보면 주인공 아래쪽 32x32 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "down")).toEqual({
        height: 32,
        width: 32,
        x: 84,
        y: 216,
      });
    });

    test("위를 바라보면 주인공 위쪽 32x32 영역을 만듭니다.", () => {
      expect(getFacingInteractionZone({ x: 100, y: 200 }, "up")).toEqual({
        height: 32,
        width: 32,
        x: 84,
        y: 152,
      });
    });
  });

  describe("isPointInsideInteractionZone", () => {
    test("점이 영역 안에 있으면 true를 반환합니다.", () => {
      expect(
        isPointInsideInteractionZone({ x: 120, y: 196 }, { height: 24, width: 24, x: 112, y: 188 }),
      ).toBe(true);
    });

    test("점이 영역 밖에 있으면 false를 반환합니다.", () => {
      expect(
        isPointInsideInteractionZone({ x: 140, y: 196 }, { height: 24, width: 24, x: 112, y: 188 }),
      ).toBe(false);
    });
  });

  describe("canPetFromKeyboard", () => {
    test("바라보는 방향이 없으면 false를 반환합니다.", () => {
      expect(
        canPetFromKeyboard({
          dogPosition: { x: 100, y: 224 },
          playerFacing: null,
          playerPosition: { x: 100, y: 200 },
        }),
      ).toBe(false);
    });
  });
});

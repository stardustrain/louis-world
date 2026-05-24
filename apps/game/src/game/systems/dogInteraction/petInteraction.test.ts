import { getPetInteractionEvent } from "./petInteraction";

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

    test("강아지가 대상이 아니면 이벤트를 만들지 않습니다.", () => {
      expect(getPetInteractionEvent({ pointerDown: true, target: "none" })).toBeNull();
    });
  });
});

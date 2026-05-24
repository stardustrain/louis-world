import { applyDogMoodDelta, createInitialDogMood } from "./dogMood";
import { createDogReactionRequest } from "./dogReactionSystem";

describe("dogReactionSystem", () => {
  describe("createDogReactionRequest", () => {
    test("첫 쓰다듬기 입력에는 조심스러움에서 편안함으로 바뀌는 별빛 반응을 반환합니다.", () => {
      const mood = createInitialDogMood();

      expect(createDogReactionRequest({ type: "pet_started" }, mood)).toEqual({
        expression: "cautious_to_relaxed",
        effect: "starlight_bloom",
        intensity: "soft",
        moodDelta: { calmness: 1 },
      });
    });

    test("차분함이 오른 뒤의 쓰다듬기 입력에는 편안한 별빛 반응을 반환합니다.", () => {
      const mood = { calmness: 1 };

      expect(createDogReactionRequest({ type: "pet_started" }, mood)).toEqual({
        expression: "relaxed",
        effect: "starlight_bloom",
        intensity: "soft",
        moodDelta: { calmness: 1 },
      });
    });
  });

  describe("createInitialDogMood", () => {
    test("차분함이 없는 상태로 시작합니다.", () => {
      expect(createInitialDogMood()).toEqual({ calmness: 0 });
    });
  });

  describe("applyDogMoodDelta", () => {
    test("차분함 변화를 적용합니다.", () => {
      expect(applyDogMoodDelta({ calmness: 0 }, { calmness: 1 })).toEqual({
        calmness: 1,
      });
    });

    test("차분함을 첫 프로토타입 범위 안으로 유지합니다.", () => {
      expect(applyDogMoodDelta({ calmness: 3 }, { calmness: 1 })).toEqual({
        calmness: 3,
      });
      expect(applyDogMoodDelta({ calmness: 0 }, { calmness: -1 })).toEqual({
        calmness: 0,
      });
    });
  });
});

import { resolveDogPresentationStyle } from "./dogPresentationStyle";

describe("dogPresentationStyle", () => {
  describe("resolveDogPresentationStyle", () => {
    test("조심스러움에서 편안함으로 바뀌는 별빛 반응을 부드러운 편안함 placeholder로 매핑합니다.", () => {
      expect(
        resolveDogPresentationStyle({
          expression: "cautious_to_relaxed",
          effect: "starlight_bloom",
          intensity: "soft",
        }),
      ).toEqual({
        faceText: ":)",
        bodyColor: 0xf8fafc,
        bodyStrokeColor: 0xfacc15,
        effectEnabled: true,
        effectColor: 0xfde68a,
        effectParticleCount: 8,
      });
    });

    test("알 수 없는 표정에는 편안한 placeholder를 사용합니다.", () => {
      expect(
        resolveDogPresentationStyle({
          expression: "unknown_expression",
          effect: "none",
          intensity: "none",
        }),
      ).toEqual({
        faceText: ":)",
        bodyColor: 0xf8fafc,
        bodyStrokeColor: 0x94a3b8,
        effectEnabled: false,
        effectColor: 0xfde68a,
        effectParticleCount: 0,
      });
    });

    test("알 수 없는 효과는 아무 효과도 없는 것으로 처리합니다.", () => {
      expect(
        resolveDogPresentationStyle({
          expression: "relaxed",
          effect: "unknown_effect",
          intensity: "soft",
        }).effectEnabled,
      ).toBe(false);
    });
  });
});

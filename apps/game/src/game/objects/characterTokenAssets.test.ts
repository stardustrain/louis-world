import { preloadCharacterTokenAssets } from "./characterTokenAssets";

type LoaderCall = {
  readonly key: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
};

describe("characterTokenAssets", () => {
  describe("preloadCharacterTokenAssets", () => {
    test("주인공과 강아지 SVG 토큰을 24x24 크기로 로드합니다.", () => {
      const calls: LoaderCall[] = [];

      preloadCharacterTokenAssets({
        svg(key: string, url: string, svgConfig: { width: number; height: number }): void {
          calls.push({
            height: svgConfig.height,
            key,
            url,
            width: svgConfig.width,
          });
        },
      });

      expect(calls).toEqual([
        {
          height: 24,
          key: "player-token",
          url: "images/player-token.svg",
          width: 24,
        },
        {
          height: 24,
          key: "dog-token",
          url: "images/dog-token.svg",
          width: 24,
        },
      ]);
    });
  });
});

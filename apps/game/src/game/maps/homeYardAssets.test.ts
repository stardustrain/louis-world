import { describe, expect, it } from "vitest";

import { preloadHomeYardMapAssets } from "./homeYardAssets";

type LoaderCall = {
  readonly method: string;
  readonly key: string;
  readonly url: string;
  readonly width?: number;
  readonly height?: number;
};

describe("preloadHomeYardMapAssets", () => {
  it("queues the approved Tiled map and placeholder tileset", () => {
    const calls: LoaderCall[] = [];
    const loader = {
      tilemapTiledJSON(key: string, url: string): void {
        calls.push({ method: "tilemapTiledJSON", key, url });
      },
      svg(key: string, url: string, svgConfig: { width: number; height: number }): void {
        calls.push({
          height: svgConfig.height,
          key,
          method: "svg",
          url,
          width: svgConfig.width,
        });
      },
    };

    preloadHomeYardMapAssets(loader);

    expect(calls).toEqual([
      {
        key: "home-yard-map",
        method: "tilemapTiledJSON",
        url: "tilemaps/home-yard-blockout.json",
      },
      {
        height: 32,
        key: "home-yard-tiles",
        method: "svg",
        url: "tilesets/home-yard-placeholder.svg",
        width: 224,
      },
    ]);
  });
});

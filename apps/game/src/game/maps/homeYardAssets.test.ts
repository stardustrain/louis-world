import { preloadHomeYardMapAssets } from "./homeYardAssets";

type LoaderCall =
  | {
      readonly key: string;
      readonly method: "tilemapTiledJSON" | "image";
      readonly url: string;
    }
  | {
      readonly atlasURL: string;
      readonly key: string;
      readonly method: "atlas";
      readonly textureURL: string;
    };

describe("preloadHomeYardMapAssets", () => {
  it("queues the approved Tiled map, Star Realms PNG tileset, and celestial atlas", () => {
    const calls: LoaderCall[] = [];
    const loader = {
      tilemapTiledJSON(key: string, url: string): void {
        calls.push({ method: "tilemapTiledJSON", key, url });
      },
      image(key: string, url: string): void {
        calls.push({ method: "image", key, url });
      },
      atlas(key: string, textureURL: string, atlasURL: string): void {
        calls.push({ atlasURL, key, method: "atlas", textureURL });
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
        key: "home-yard-tiles",
        method: "image",
        url: "tilesets/StarRealmsCozyForestPack24x24.png",
      },
      {
        atlasURL: "images/celestial-objects.json",
        key: "home-yard-celestial-objects",
        method: "atlas",
        textureURL: "images/celestial-objects.png",
      },
    ]);
  });
});

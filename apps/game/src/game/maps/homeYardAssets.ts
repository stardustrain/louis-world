import {
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_URL,
  HOME_YARD_TILESET_IMAGE_HEIGHT,
  HOME_YARD_TILESET_IMAGE_WIDTH,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_URL,
} from "./homeYardMap";

export type HomeYardAssetLoader = {
  tilemapTiledJSON: (key: string, url: string) => void;
  svg: (key: string, url: string, svgConfig: { width: number; height: number }) => void;
};

export function preloadHomeYardMapAssets(loader: HomeYardAssetLoader): void {
  loader.tilemapTiledJSON(HOME_YARD_MAP_KEY, HOME_YARD_MAP_URL);
  loader.svg(HOME_YARD_TILESET_KEY, HOME_YARD_TILESET_URL, {
    height: HOME_YARD_TILESET_IMAGE_HEIGHT,
    width: HOME_YARD_TILESET_IMAGE_WIDTH,
  });
}

import {
  HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
  HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
  HOME_YARD_CELESTIAL_ATLAS_KEY,
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_URL,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_URL,
} from "./homeYardMap";

export type HomeYardAssetLoader = {
  tilemapTiledJSON: (key: string, url: string) => void;
  image: (key: string, url: string) => void;
  atlas: (key: string, textureURL: string, atlasURL: string) => void;
};

export function preloadHomeYardMapAssets(loader: HomeYardAssetLoader): void {
  loader.tilemapTiledJSON(HOME_YARD_MAP_KEY, HOME_YARD_MAP_URL);
  loader.image(HOME_YARD_TILESET_KEY, HOME_YARD_TILESET_URL);
  loader.atlas(
    HOME_YARD_CELESTIAL_ATLAS_KEY,
    HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
    HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
  );
}

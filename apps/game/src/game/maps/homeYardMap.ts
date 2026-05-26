export type TileArea = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type TilePoint = {
  readonly tileX: number;
  readonly tileY: number;
};

export type PixelPoint = {
  readonly x: number;
  readonly y: number;
};

export const HOME_YARD_MAP_KEY = "home-yard-map";
export const HOME_YARD_MAP_URL = "tilemaps/home-yard-blockout.json";
export const HOME_YARD_TILESET_KEY = "home-yard-tiles";
export const HOME_YARD_TILESET_NAME = "StarRealmsCozyForestPack24x24";
export const HOME_YARD_TILESET_URL = "tilesets/StarRealmsCozyForestPack24x24.png";
export const HOME_YARD_CELESTIAL_ATLAS_KEY = "home-yard-celestial-objects";
export const HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL = "images/celestial-objects.png";
export const HOME_YARD_CELESTIAL_ATLAS_JSON_URL = "images/celestial-objects.json";
export const HOME_YARD_TILESET_IMAGE_WIDTH = 480;
export const HOME_YARD_TILESET_IMAGE_HEIGHT = 576;

export const HOME_YARD_MAP_WIDTH_IN_TILES = 54;
export const HOME_YARD_MAP_HEIGHT_IN_TILES = 30;
export const HOME_YARD_TILE_SIZE = 24;

export const HOME_YARD_LAYER_GROUND_BASE = "ground_base";
export const HOME_YARD_LAYER_YARD_AND_PATH = "yard_and_path";
export const HOME_YARD_LAYER_HOUSE_BLOCKOUT = "house_blockout";
export const HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY = "decor_soft_boundary";
export const HOME_YARD_LAYER_COLLISION_BLOCKOUT = "collision_blockout";

export const HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS = "gameplay_markers";
export const HOME_YARD_OBJECT_PLAYER_SPAWN = "player_spawn";
export const HOME_YARD_OBJECT_DOG_SPAWN = "dog_spawn";
export const HOME_YARD_OBJECT_HOUSE_DOOR = "house_door";
export const HOME_YARD_OBJECT_LOCKED_PATH = "locked_path";

export const HOME_YARD_HOUSE_AREA: TileArea = { x: 22, y: 7, width: 10, height: 7 };
export const HOME_YARD_YARD_AREA: TileArea = { x: 20, y: 14, width: 14, height: 8 };
export const HOME_YARD_DOOR_AREA: TileArea = { x: 26, y: 13, width: 2, height: 1 };
export const HOME_YARD_PATH_AREA: TileArea = { x: 26, y: 14, width: 2, height: 8 };
export const HOME_YARD_LOCKED_PATH_AREA: TileArea = { x: 26, y: 22, width: 2, height: 1 };

export const HOME_YARD_PLAYER_SPAWN: TilePoint = { tileX: 26, tileY: 14 };
export const HOME_YARD_DOG_SPAWN: TilePoint = { tileX: 27, tileY: 16 };

export function isHomeYardTileAreaInsideMap(area: TileArea): boolean {
  const areaRightEdge = area.x + area.width;
  const areaBottomEdge = area.y + area.height;

  return (
    area.x >= 0 &&
    area.y >= 0 &&
    areaRightEdge <= HOME_YARD_MAP_WIDTH_IN_TILES &&
    areaBottomEdge <= HOME_YARD_MAP_HEIGHT_IN_TILES
  );
}

export function tileToPixelCenter(point: TilePoint): PixelPoint {
  return {
    x: point.tileX * HOME_YARD_TILE_SIZE + HOME_YARD_TILE_SIZE / 2,
    y: point.tileY * HOME_YARD_TILE_SIZE + HOME_YARD_TILE_SIZE / 2,
  };
}

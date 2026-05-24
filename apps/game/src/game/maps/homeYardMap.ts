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
export const HOME_YARD_TILESET_NAME = "home-yard-placeholder";
export const HOME_YARD_TILESET_URL = "tilesets/home-yard-placeholder.svg";
export const HOME_YARD_TILESET_IMAGE_WIDTH = 224;
export const HOME_YARD_TILESET_IMAGE_HEIGHT = 32;

export const HOME_YARD_MAP_WIDTH_IN_TILES = 40;
export const HOME_YARD_MAP_HEIGHT_IN_TILES = 24;
export const HOME_YARD_TILE_SIZE = 32;

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

export const HOME_YARD_HOUSE_AREA: TileArea = { x: 15, y: 4, width: 10, height: 7 };
export const HOME_YARD_YARD_AREA: TileArea = { x: 13, y: 11, width: 14, height: 8 };
export const HOME_YARD_DOOR_AREA: TileArea = { x: 19, y: 10, width: 2, height: 1 };
export const HOME_YARD_PATH_AREA: TileArea = { x: 19, y: 11, width: 2, height: 8 };
export const HOME_YARD_LOCKED_PATH_AREA: TileArea = { x: 19, y: 19, width: 2, height: 1 };

export const HOME_YARD_PLAYER_SPAWN: TilePoint = { tileX: 19, tileY: 11 };
export const HOME_YARD_DOG_SPAWN: TilePoint = { tileX: 20, tileY: 13 };

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

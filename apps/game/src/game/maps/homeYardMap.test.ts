import { describe, expect, it } from "vitest";

import {
  HOME_YARD_DOG_SPAWN,
  HOME_YARD_DOOR_AREA,
  HOME_YARD_HOUSE_AREA,
  HOME_YARD_LAYER_COLLISION_BLOCKOUT,
  HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY,
  HOME_YARD_LAYER_GROUND_BASE,
  HOME_YARD_LAYER_HOUSE_BLOCKOUT,
  HOME_YARD_LAYER_YARD_AND_PATH,
  HOME_YARD_LOCKED_PATH_AREA,
  HOME_YARD_MAP_HEIGHT_IN_TILES,
  HOME_YARD_MAP_KEY,
  HOME_YARD_MAP_WIDTH_IN_TILES,
  HOME_YARD_OBJECT_DOG_SPAWN,
  HOME_YARD_OBJECT_HOUSE_DOOR,
  HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS,
  HOME_YARD_OBJECT_LOCKED_PATH,
  HOME_YARD_OBJECT_PLAYER_SPAWN,
  HOME_YARD_PATH_AREA,
  HOME_YARD_PLAYER_SPAWN,
  HOME_YARD_TILE_SIZE,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
  HOME_YARD_YARD_AREA,
  isHomeYardTileAreaInsideMap,
  tileToPixelCenter,
} from "./homeYardMap";

describe("home yard map metadata", () => {
  it("uses the approved map keys and dimensions", () => {
    expect(HOME_YARD_MAP_KEY).toBe("home-yard-map");
    expect(HOME_YARD_TILESET_KEY).toBe("home-yard-tiles");
    expect(HOME_YARD_TILESET_NAME).toBe("home-yard-placeholder");
    expect(HOME_YARD_MAP_WIDTH_IN_TILES).toBe(40);
    expect(HOME_YARD_MAP_HEIGHT_IN_TILES).toBe(24);
    expect(HOME_YARD_TILE_SIZE).toBe(32);
  });

  it("uses stable Tiled layer and object names", () => {
    expect(HOME_YARD_LAYER_GROUND_BASE).toBe("ground_base");
    expect(HOME_YARD_LAYER_YARD_AND_PATH).toBe("yard_and_path");
    expect(HOME_YARD_LAYER_HOUSE_BLOCKOUT).toBe("house_blockout");
    expect(HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY).toBe("decor_soft_boundary");
    expect(HOME_YARD_LAYER_COLLISION_BLOCKOUT).toBe("collision_blockout");
    expect(HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS).toBe("gameplay_markers");
    expect(HOME_YARD_OBJECT_PLAYER_SPAWN).toBe("player_spawn");
    expect(HOME_YARD_OBJECT_DOG_SPAWN).toBe("dog_spawn");
    expect(HOME_YARD_OBJECT_HOUSE_DOOR).toBe("house_door");
    expect(HOME_YARD_OBJECT_LOCKED_PATH).toBe("locked_path");
  });

  it("keeps approved areas inside the 40 x 24 map", () => {
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_HOUSE_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_YARD_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_DOOR_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_PATH_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_LOCKED_PATH_AREA)).toBe(true);
  });

  it("aligns the door, yard path, and locked path on the same 2-tile center axis", () => {
    expect(HOME_YARD_DOOR_AREA).toEqual({ x: 19, y: 10, width: 2, height: 1 });
    expect(HOME_YARD_PATH_AREA).toEqual({ x: 19, y: 11, width: 2, height: 8 });
    expect(HOME_YARD_LOCKED_PATH_AREA).toEqual({ x: 19, y: 19, width: 2, height: 1 });
  });

  it("keeps the house above the yard as one centered cluster", () => {
    expect(HOME_YARD_HOUSE_AREA).toEqual({ x: 15, y: 4, width: 10, height: 7 });
    expect(HOME_YARD_YARD_AREA).toEqual({ x: 13, y: 11, width: 14, height: 8 });
  });

  it("converts approved spawn tile coordinates to pixel centers", () => {
    expect(tileToPixelCenter(HOME_YARD_PLAYER_SPAWN)).toEqual({ x: 624, y: 368 });
    expect(tileToPixelCenter(HOME_YARD_DOG_SPAWN)).toEqual({ x: 656, y: 432 });
  });
});

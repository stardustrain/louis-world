import {
  HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL,
  HOME_YARD_CELESTIAL_ATLAS_JSON_URL,
  HOME_YARD_CELESTIAL_ATLAS_KEY,
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
  HOME_YARD_TILESET_IMAGE_HEIGHT,
  HOME_YARD_TILESET_IMAGE_WIDTH,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
  HOME_YARD_TILESET_URL,
  HOME_YARD_YARD_AREA,
  isHomeYardTileAreaInsideMap,
  tileToPixelCenter,
} from "./homeYardMap";

describe("homeYardMap", () => {
  it("승인된 맵 키와 24px Star Realms 타일셋 치수를 사용합니다.", () => {
    expect(HOME_YARD_MAP_KEY).toBe("home-yard-map");
    expect(HOME_YARD_TILESET_KEY).toBe("home-yard-tiles");
    expect(HOME_YARD_TILESET_NAME).toBe("StarRealmsCozyForestPack24x24");
    expect(HOME_YARD_TILESET_URL).toBe("tilesets/StarRealmsCozyForestPack24x24.png");
    expect(HOME_YARD_CELESTIAL_ATLAS_KEY).toBe("home-yard-celestial-objects");
    expect(HOME_YARD_CELESTIAL_ATLAS_IMAGE_URL).toBe("images/celestial-objects.png");
    expect(HOME_YARD_CELESTIAL_ATLAS_JSON_URL).toBe("images/celestial-objects.json");
    expect(HOME_YARD_TILESET_IMAGE_WIDTH).toBe(480);
    expect(HOME_YARD_TILESET_IMAGE_HEIGHT).toBe(576);
    expect(HOME_YARD_MAP_WIDTH_IN_TILES).toBe(54);
    expect(HOME_YARD_MAP_HEIGHT_IN_TILES).toBe(30);
    expect(HOME_YARD_TILE_SIZE).toBe(24);
  });

  it("안정적인 Tiled 레이어와 오브젝트 이름을 사용합니다.", () => {
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

  it("승인된 영역을 54 x 30 맵 안에 유지합니다.", () => {
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_HOUSE_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_YARD_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_DOOR_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_PATH_AREA)).toBe(true);
    expect(isHomeYardTileAreaInsideMap(HOME_YARD_LOCKED_PATH_AREA)).toBe(true);
  });

  it("문, 마당 길, 잠긴 길을 같은 2타일 중심축에 정렬합니다.", () => {
    expect(HOME_YARD_DOOR_AREA).toEqual({ x: 26, y: 13, width: 2, height: 1 });
    expect(HOME_YARD_PATH_AREA).toEqual({ x: 26, y: 14, width: 2, height: 8 });
    expect(HOME_YARD_LOCKED_PATH_AREA).toEqual({ x: 26, y: 22, width: 2, height: 1 });
  });

  it("집과 마당을 하나의 중앙 클러스터로 유지합니다.", () => {
    expect(HOME_YARD_HOUSE_AREA).toEqual({ x: 22, y: 7, width: 10, height: 7 });
    expect(HOME_YARD_YARD_AREA).toEqual({ x: 20, y: 14, width: 14, height: 8 });
  });

  it("승인된 스폰 타일 좌표를 24px 픽셀 중심점으로 변환합니다.", () => {
    expect(tileToPixelCenter(HOME_YARD_PLAYER_SPAWN)).toEqual({ x: 636, y: 348 });
    expect(tileToPixelCenter(HOME_YARD_DOG_SPAWN)).toEqual({ x: 660, y: 396 });
  });
});

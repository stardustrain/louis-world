import tilemapJsonText from "../../../public/assets/tilemaps/home-yard-blockout.json?raw";

type TiledProperty = {
  readonly name: string;
  readonly type: string;
  readonly value: boolean | number | string;
};

type TiledObject = {
  readonly height: number;
  readonly name: string;
  readonly width: number;
  readonly x: number;
  readonly y: number;
};

type TiledLayer = {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly name: string;
  readonly objects?: readonly TiledObject[];
  readonly width?: number;
};

type TiledTileLayer = {
  readonly data: readonly number[];
  readonly height: number;
  readonly name: string;
  readonly width: number;
};

type TiledTilesetTile = {
  readonly id: number;
  readonly properties: readonly TiledProperty[];
};

type TiledTileset = {
  readonly columns: number;
  readonly firstgid: number;
  readonly image: string;
  readonly imageheight: number;
  readonly imagewidth: number;
  readonly margin: number;
  readonly name: string;
  readonly spacing: number;
  readonly tilecount: number;
  readonly tileheight: number;
  readonly tiles: readonly TiledTilesetTile[];
  readonly tilewidth: number;
};

type TiledMap = {
  readonly height: number;
  readonly layers: readonly TiledLayer[];
  readonly tileheight: number;
  readonly tilesets: readonly TiledTileset[];
  readonly tilewidth: number;
  readonly width: number;
};

const tilemap: TiledMap = JSON.parse(tilemapJsonText);
const mapWidth = 54;
const emptyGid = 0;
const yardGid = 2;
const pathGid = 3;
const houseGid = 4;
const collisionGid = 6;
const hillBoundaryLeftGid = 121;
const hillBoundaryMiddleGid = 122;
const hillBoundaryRightGid = 123;
const lockedPathHintGid = 7;
const approvedTopBackgroundGids = [369, 370, 372, 373, 389, 390, 392, 393, 429, 430, 432, 453];
const approvedGroundBaseGids = [
  82,
  hillBoundaryLeftGid,
  hillBoundaryMiddleGid,
  hillBoundaryRightGid,
  142,
  ...approvedTopBackgroundGids,
];
const approvedDecorSoftBoundaryGids = [yardGid, pathGid, lockedPathHintGid];
const approvedCollisionBlockoutGids = [collisionGid];
const topBackgroundTileYs = [0, 1, 2, 3, 4, 5];
const hillBoundaryRowTileY = 6;

const houseArea = { x: 22, y: 7, width: 10, height: 7 };
const yardArea = { x: 20, y: 14, width: 14, height: 8 };
const doorArea = { x: 26, y: 13, width: 2, height: 1 };
const pathArea = { x: 26, y: 14, width: 2, height: 8 };
const lockedPathArea = { x: 26, y: 22, width: 2, height: 1 };
const playerSpawnTile = { x: 26, y: 14 };
const dogSpawnTile = { x: 27, y: 16 };
const hillBoundaryRow = [
  hillBoundaryLeftGid,
  ...Array(52).fill(hillBoundaryMiddleGid),
  hillBoundaryRightGid,
];
const emptyRow = Array(mapWidth).fill(emptyGid);
const collisionBoundaryRow = Array(mapWidth).fill(collisionGid);

describe("homeYardTilemapJson", () => {
  it("Star Realms 24px 타일셋 메타데이터를 사용합니다.", () => {
    expect(tilemap.tilewidth).toBe(24);
    expect(tilemap.tileheight).toBe(24);
    expect(tilemap.tilesets).toEqual([
      {
        columns: 20,
        firstgid: 1,
        image: "../tilesets/StarRealmsCozyForestPack24x24.png",
        imageheight: 576,
        imagewidth: 480,
        margin: 0,
        name: "StarRealmsCozyForestPack24x24",
        spacing: 0,
        tilecount: 480,
        tileheight: 24,
        tiles: [
          {
            id: 5,
            properties: [
              {
                name: "collides",
                type: "bool",
                value: true,
              },
            ],
          },
        ],
        tilewidth: 24,
      },
    ]);
  });

  it("54 x 30 맵 크기와 레이어 데이터 길이를 유지합니다.", () => {
    const tileLayers = tilemap.layers.filter(isTileLayer);

    expect(tilemap.width).toBe(54);
    expect(tilemap.height).toBe(30);
    expect(tileLayers).toHaveLength(5);

    for (const tileLayer of tileLayers) {
      expect(tileLayer.width).toBe(54);
      expect(tileLayer.height).toBe(30);
      expect(tileLayer.data).toHaveLength(1620);
    }
  });

  it("게임플레이 마커를 24px 타일 격자에 맞춥니다.", () => {
    const gameplayMarkersLayer = findRequiredLayer(tilemap, "gameplay_markers");

    expect(findRequiredObject(gameplayMarkersLayer, "player_spawn")).toMatchObject({
      height: 0,
      width: 0,
      x: 636,
      y: 348,
    });
    expect(findRequiredObject(gameplayMarkersLayer, "dog_spawn")).toMatchObject({
      height: 0,
      width: 0,
      x: 660,
      y: 396,
    });
    expect(findRequiredObject(gameplayMarkersLayer, "house_door")).toMatchObject({
      height: 24,
      width: 48,
      x: 624,
      y: 312,
    });
    expect(findRequiredObject(gameplayMarkersLayer, "locked_path")).toMatchObject({
      height: 24,
      width: 48,
      x: 624,
      y: 528,
    });
  });

  it("집, 마당, 문, 길, 잠긴 길의 구조적 타일 배치를 유지합니다.", () => {
    const yardAndPath = findRequiredTileLayer(tilemap, "yard_and_path");
    const houseBlockout = findRequiredTileLayer(tilemap, "house_blockout");
    const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

    expectAreaToUseTile(houseBlockout, houseArea, houseGid);
    expectYardAndPathStructure(yardAndPath);
    expectAreaToUseTile(yardAndPath, lockedPathArea, lockedPathHintGid);
    expectCollisionHouseStructure(collisionBlockout);
    expectAreaToUseTile(collisionBlockout, lockedPathArea, collisionGid);
  });

  it("시각 보조 레이어가 집을 침범하지 않고 마당, 길, 잠긴 길 표시를 유지합니다.", () => {
    const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");
    const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

    expectAreaToUseTile(decorSoftBoundary, houseArea, emptyGid);
    expectYardAndPathStructure(decorSoftBoundary);
    expectAreaToUseTile(decorSoftBoundary, lockedPathArea, lockedPathHintGid);
    expectAreaToUseTile(collisionBlockout, pathArea, emptyGid);
    expectTileToBe(collisionBlockout, playerSpawnTile.x, playerSpawnTile.y, emptyGid);
    expectTileToBe(collisionBlockout, dogSpawnTile.x, dogSpawnTile.y, emptyGid);
  });

  it("시각 레이어가 현재 승인된 GID 집합만 사용합니다.", () => {
    const groundBase = findRequiredTileLayer(tilemap, "ground_base");
    const decorSoftBoundary = findRequiredTileLayer(tilemap, "decor_soft_boundary");

    expect(readUniqueNonEmptyGids(groundBase)).toEqual(approvedGroundBaseGids);
    expect(readUniqueNonEmptyGidsInRows(groundBase, topBackgroundTileYs)).toEqual(
      approvedTopBackgroundGids,
    );
    expect(readRow(groundBase, hillBoundaryRowTileY)).toEqual(hillBoundaryRow);
    expect(readUniqueNonEmptyGids(decorSoftBoundary)).toEqual(approvedDecorSoftBoundaryGids);
    expect(countNonEmptyTiles(decorSoftBoundary)).toBe(114);
  });

  it("충돌 레이어는 충돌 GID만 사용하고 시각 배경 타일을 그리지 않습니다.", () => {
    const collisionBlockout = findRequiredTileLayer(tilemap, "collision_blockout");

    expect(readUniqueNonEmptyGids(collisionBlockout)).toEqual(approvedCollisionBlockoutGids);
    for (const topBackgroundTileY of topBackgroundTileYs) {
      expect(readRow(collisionBlockout, topBackgroundTileY)).toEqual(emptyRow);
    }
    expect(readRow(collisionBlockout, hillBoundaryRowTileY)).toEqual(collisionBoundaryRow);
  });
});

function isTileLayer(layer: TiledLayer): layer is TiledTileLayer {
  return layer.data !== undefined;
}

function findRequiredLayer(tilemap: TiledMap, layerName: string): TiledLayer {
  const layer = tilemap.layers.find((candidateLayer) => candidateLayer.name === layerName);

  if (layer === undefined) {
    throw new Error(`Expected tilemap fixture to include layer "${layerName}".`);
  }

  return layer;
}

function findRequiredObject(layer: TiledLayer, objectName: string): TiledObject {
  const objects = layer.objects ?? [];
  const object = objects.find((candidateObject) => candidateObject.name === objectName);

  if (object === undefined) {
    throw new Error(
      `Expected tilemap fixture layer "${layer.name}" to include object "${objectName}".`,
    );
  }

  return object;
}

function findRequiredTileLayer(tilemap: TiledMap, layerName: string): TiledTileLayer {
  const layer = findRequiredLayer(tilemap, layerName);

  if (!isTileLayer(layer)) {
    throw new Error(`Expected layer "${layerName}" to be a tile layer.`);
  }

  return layer;
}

function expectYardAndPathStructure(layer: TiledTileLayer): void {
  forEachTileInArea(yardArea, (tileX, tileY) => {
    const expectedGid = isTileInsideArea({ x: tileX, y: tileY }, pathArea) ? pathGid : yardGid;
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectCollisionHouseStructure(layer: TiledTileLayer): void {
  forEachTileInArea(houseArea, (tileX, tileY) => {
    const expectedGid = isTileInsideArea({ x: tileX, y: tileY }, doorArea)
      ? emptyGid
      : collisionGid;
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectAreaToUseTile(
  layer: TiledTileLayer,
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  expectedGid: number,
): void {
  forEachTileInArea(area, (tileX, tileY) => {
    expectTileToBe(layer, tileX, tileY, expectedGid);
  });
}

function expectTileToBe(
  layer: TiledTileLayer,
  tileX: number,
  tileY: number,
  expectedGid: number,
): void {
  expect(readTile(layer, tileX, tileY)).toBe(expectedGid);
}

function readTile(layer: TiledTileLayer, tileX: number, tileY: number): number {
  return layer.data[tileY * mapWidth + tileX] ?? emptyGid;
}

function countNonEmptyTiles(layer: TiledTileLayer): number {
  return layer.data.filter((gid) => gid !== emptyGid).length;
}

function readUniqueNonEmptyGids(layer: TiledTileLayer): readonly number[] {
  return [...new Set(layer.data.filter((gid) => gid !== emptyGid))].sort(
    (leftGid, rightGid) => leftGid - rightGid,
  );
}

function readUniqueNonEmptyGidsInRows(
  layer: TiledTileLayer,
  tileYs: readonly number[],
): readonly number[] {
  const gids = tileYs.flatMap((tileY) => readRow(layer, tileY).filter((gid) => gid !== emptyGid));

  return [...new Set(gids)].sort((leftGid, rightGid) => leftGid - rightGid);
}

function readRow(layer: TiledTileLayer, tileY: number): readonly number[] {
  return layer.data.slice(tileY * mapWidth, (tileY + 1) * mapWidth);
}

function forEachTileInArea(
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  callback: (tileX: number, tileY: number) => void,
): void {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      callback(tileX, tileY);
    }
  }
}

function isTileInsideArea(
  tile: { readonly x: number; readonly y: number },
  area: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
): boolean {
  return (
    tile.x >= area.x &&
    tile.y >= area.y &&
    tile.x < area.x + area.width &&
    tile.y < area.y + area.height
  );
}

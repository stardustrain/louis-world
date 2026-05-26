import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const gameDirectory = resolve(scriptDirectory, "..");

const tileSize = 24;
const mapWidth = 54;
const mapHeight = 30;
const tilesetColumns = 20;
const tilesetTileCount = 480;
const seed = 1701;

const paths = {
  tilemap: resolve(gameDirectory, "public/assets/tilemaps/home-yard-blockout.json"),
};

const gid = {
  empty: 0,
  yard: 2,
  path: 3,
  house: 4,
  collision: 6,
  lockedPathHint: 7,
};

const palette = {
  grassBase: tile(4, 1),
  grassVariants: [tile(7, 1)],
  flowers: [tile(3, 8), tile(3, 9), tile(3, 10), tile(3, 11), tile(3, 12), tile(3, 13)],
  stones: [tile(3, 14), tile(4, 14)],
  shrubs: [tile(8, 10), tile(8, 11), tile(9, 10), tile(10, 10)],
};

const topBackgroundRows = [
  [
    369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369,
    369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 429, 430, 369, 369, 369, 369, 369,
    369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 369, 370, 369, 370,
  ],
  [
    389, 389, 389, 389, 429, 430, 389, 429, 430, 389, 389, 372, 373, 389, 389, 389, 373, 389, 389,
    389, 429, 430, 389, 389, 389, 389, 389, 389, 389, 389, 389, 372, 389, 389, 389, 369, 369, 369,
    369, 369, 369, 369, 369, 432, 389, 389, 389, 389, 389, 389, 369, 369, 370, 390,
  ],
  [
    370, 369, 372, 373, 369, 369, 369, 369, 429, 430, 369, 392, 393, 369, 369, 392, 369, 369, 369,
    369, 369, 369, 369, 369, 369, 372, 369, 369, 369, 369, 369, 392, 369, 373, 372, 373, 369, 432,
    429, 429, 430, 369, 369, 370, 453, 369, 429, 430, 369, 373, 429, 429, 430, 370,
  ],
  [
    390, 389, 392, 393, 389, 389, 373, 429, 430, 389, 429, 430, 389, 372, 389, 369, 369, 369, 369,
    372, 369, 369, 372, 370, 389, 389, 393, 389, 389, 373, 389, 389, 392, 389, 392, 393, 389, 429,
    429, 430, 430, 389, 389, 390, 373, 389, 389, 389, 429, 430, 429, 429, 430, 390,
  ],
  [
    370, 429, 430, 369, 429, 430, 369, 429, 430, 369, 369, 369, 369, 369, 393, 389, 369, 370, 369,
    392, 369, 370, 369, 393, 369, 369, 370, 369, 392, 369, 369, 369, 372, 369, 369, 369, 369, 429,
    430, 429, 430, 369, 369, 429, 430, 369, 369, 369, 369, 369, 429, 430, 430, 370,
  ],
  [
    390, 389, 389, 389, 389, 389, 389, 389, 389, 429, 430, 389, 389, 389, 389, 390, 389, 390, 389,
    390, 389, 390, 389, 390, 389, 389, 390, 389, 389, 389, 389, 389, 389, 393, 389, 389, 389, 389,
    389, 389, 389, 389, 389, 389, 389, 389, 389, 389, 389, 389, 390, 390, 389, 390,
  ],
];
const hillBoundaryTileY = topBackgroundRows.length;
const hillBoundaryRow = [121, ...Array.from({ length: mapWidth - 2 }, () => 122), 123];

const areas = {
  house: { x: 22, y: 7, width: 10, height: 7 },
  yard: { x: 20, y: 14, width: 14, height: 8 },
  door: { x: 26, y: 13, width: 2, height: 1 },
  path: { x: 26, y: 14, width: 2, height: 8 },
  lockedPath: { x: 26, y: 22, width: 2, height: 1 },
};

const objects = {
  playerSpawn: { name: "player_spawn", tileX: 26, tileY: 14 },
  dogSpawn: { name: "dog_spawn", tileX: 27, tileY: 16 },
};

const treeStamps = [
  createRectangleStamp("small_tree", 5, 10, 4, 5, [
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
  ]),
  createRectangleStamp("large_tree", 5, 14, 5, 7, [
    { x: 2, y: 5 },
    { x: 2, y: 6 },
  ]),
];

await mkdir(dirname(paths.tilemap), { recursive: true });
await writeFile(paths.tilemap, `${JSON.stringify(createTilemapJson(), null, 2)}\n`, "utf8");

function createTilemapJson() {
  const collisionData = createCollisionBlockoutData();
  const decorData = createDecorSoftBoundaryData(collisionData);

  return {
    compressionlevel: -1,
    height: mapHeight,
    infinite: false,
    layers: [
      createTileLayer(1, "ground_base", createGroundBaseData()),
      createTileLayer(2, "yard_and_path", createYardAndPathData()),
      createTileLayer(3, "house_blockout", createHouseBlockoutData()),
      createTileLayer(4, "decor_soft_boundary", decorData),
      createTileLayer(5, "collision_blockout", collisionData, false),
      createObjectLayer(6),
    ],
    nextlayerid: 7,
    nextobjectid: 5,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.12.1",
    tileheight: tileSize,
    tilesets: [
      {
        columns: tilesetColumns,
        firstgid: 1,
        image: "../tilesets/StarRealmsCozyForestPack24x24.png",
        imageheight: 576,
        imagewidth: 480,
        margin: 0,
        name: "StarRealmsCozyForestPack24x24",
        spacing: 0,
        tilecount: tilesetTileCount,
        tileheight: tileSize,
        tiles: [
          {
            id: gid.collision - 1,
            properties: [{ name: "collides", type: "bool", value: true }],
          },
        ],
        tilewidth: tileSize,
      },
    ],
    tilewidth: tileSize,
    type: "map",
    version: "1.10",
    width: mapWidth,
  };
}

function createGroundBaseData() {
  const random = createSeededRandom(seed);
  const data = createFilledData(palette.grassBase);

  for (let tileY = 0; tileY < mapHeight; tileY += 1) {
    for (let tileX = 0; tileX < mapWidth; tileX += 1) {
      if (isProtectedGroundTile(tileX, tileY)) {
        continue;
      }

      const zone = resolveZone(tileX, tileY);
      const variationChance = zone === "edge" ? 0.35 : 0.16;

      if (random() < variationChance) {
        setTile(data, tileX, tileY, pick(random, palette.grassVariants));
      }
    }
  }

  applyRows(data, 0, topBackgroundRows);
  applyRows(data, hillBoundaryTileY, [hillBoundaryRow]);

  return data;
}

function createYardAndPathData() {
  const data = createEmptyData();
  fillArea(data, areas.yard, gid.yard);
  fillArea(data, areas.path, gid.path);
  fillArea(data, areas.lockedPath, gid.lockedPathHint);
  return data;
}

function createHouseBlockoutData() {
  const data = createEmptyData();
  fillArea(data, areas.house, gid.house);
  return data;
}

function createDecorSoftBoundaryData(collisionData) {
  const random = createSeededRandom(seed + 11);
  const data = createEmptyData();

  placeTreeStamps(data, collisionData);
  scatterSmallDecor(data, random);

  return data;
}

function createCollisionBlockoutData() {
  const data = createEmptyData();

  fillArea(data, areas.house, gid.collision);
  fillArea(data, areas.door, gid.empty);
  fillArea(data, areas.lockedPath, gid.collision);

  for (let tileX = 0; tileX < mapWidth; tileX += 1) {
    setTile(data, tileX, hillBoundaryTileY, gid.collision);
    setTile(data, tileX, mapHeight - 1, gid.collision);
  }

  for (let tileY = hillBoundaryTileY; tileY < mapHeight; tileY += 1) {
    setTile(data, 0, tileY, gid.collision);
    setTile(data, mapWidth - 1, tileY, gid.collision);
  }

  return data;
}

function placeTreeStamps(decorData, collisionData) {
  const placements = [
    { x: 4, y: 4, stamp: treeStamps[0] },
    { x: 42, y: 5, stamp: treeStamps[1] },
    { x: 5, y: 21, stamp: treeStamps[0] },
    { x: 41, y: 19, stamp: treeStamps[0] },
  ];

  for (const placement of placements) {
    placeStampIfOpen(decorData, collisionData, placement.stamp, placement.x, placement.y);
  }
}

function scatterSmallDecor(data, random) {
  for (let tileY = 1; tileY < mapHeight - 1; tileY += 1) {
    for (let tileX = 1; tileX < mapWidth - 1; tileX += 1) {
      if (readTile(data, tileX, tileY) !== gid.empty || isProtectedDecorTile(tileX, tileY)) {
        continue;
      }

      const zone = resolveZone(tileX, tileY);
      const roll = random();
      const density = zone === "edge" ? 0.12 : zone === "near_yard" ? 0.035 : 0.075;

      if (roll >= density) {
        continue;
      }

      if (roll < density * 0.45) {
        setTile(data, tileX, tileY, pick(random, palette.flowers));
      } else if (roll < density * 0.72) {
        setTile(data, tileX, tileY, pick(random, palette.shrubs));
      } else {
        setTile(data, tileX, tileY, pick(random, palette.stones));
      }
    }
  }
}

function createObjectLayer(id) {
  return {
    draworder: "topdown",
    id,
    name: "gameplay_markers",
    objects: [
      createPointObject(
        1,
        objects.playerSpawn.name,
        objects.playerSpawn.tileX,
        objects.playerSpawn.tileY,
      ),
      createPointObject(2, objects.dogSpawn.name, objects.dogSpawn.tileX, objects.dogSpawn.tileY),
      createAreaObject(3, "house_door", areas.door),
      createAreaObject(4, "locked_path", areas.lockedPath),
    ],
    opacity: 1,
    type: "objectgroup",
    visible: true,
    x: 0,
    y: 0,
  };
}

function createPointObject(id, name, tileX, tileY) {
  return {
    height: 0,
    id,
    name,
    point: true,
    properties: [
      { name: "tileX", type: "int", value: tileX },
      { name: "tileY", type: "int", value: tileY },
    ],
    rotation: 0,
    type: "marker",
    visible: true,
    width: 0,
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2,
  };
}

function createAreaObject(id, name, area) {
  return {
    height: area.height * tileSize,
    id,
    name,
    properties: [
      { name: "tileX", type: "int", value: area.x },
      { name: "tileY", type: "int", value: area.y },
      { name: "tileWidth", type: "int", value: area.width },
      { name: "tileHeight", type: "int", value: area.height },
    ],
    rotation: 0,
    type: "trigger",
    visible: true,
    width: area.width * tileSize,
    x: area.x * tileSize,
    y: area.y * tileSize,
  };
}

function createTileLayer(id, name, data, visible = true) {
  return {
    data,
    height: mapHeight,
    id,
    name,
    opacity: 1,
    type: "tilelayer",
    visible,
    width: mapWidth,
    x: 0,
    y: 0,
  };
}

function createRectangleStamp(name, startRow, startColumn, width, height, collisionTiles) {
  return {
    collisionTiles,
    height,
    name,
    rows: Array.from({ length: height }, (_, rowOffset) =>
      Array.from({ length: width }, (_, columnOffset) =>
        tile(startRow + rowOffset, startColumn + columnOffset),
      ),
    ),
    width,
  };
}

function placeStampIfOpen(decorData, collisionData, stamp, originX, originY) {
  if (!canPlaceStamp(stamp, originX, originY)) {
    return;
  }

  for (let localY = 0; localY < stamp.height; localY += 1) {
    for (let localX = 0; localX < stamp.width; localX += 1) {
      setTile(decorData, originX + localX, originY + localY, stamp.rows[localY][localX]);
    }
  }

  for (const collisionTile of stamp.collisionTiles) {
    setTile(collisionData, originX + collisionTile.x, originY + collisionTile.y, gid.collision);
  }
}

function canPlaceStamp(stamp, originX, originY) {
  for (let localY = 0; localY < stamp.height; localY += 1) {
    for (let localX = 0; localX < stamp.width; localX += 1) {
      const tileX = originX + localX;
      const tileY = originY + localY;

      if (!isInsideMap(tileX, tileY) || isProtectedDecorTile(tileX, tileY)) {
        return false;
      }
    }
  }

  return true;
}

function resolveZone(tileX, tileY) {
  if (tileX <= 4 || tileY <= 4 || tileX >= mapWidth - 5 || tileY >= mapHeight - 5) {
    return "edge";
  }

  if (tileY < areas.house.y || tileY > areas.lockedPath.y) {
    return "background";
  }

  if (
    Math.abs(tileX - areas.yard.x) <= 5 ||
    Math.abs(tileX - (areas.yard.x + areas.yard.width)) <= 5
  ) {
    return "near_yard";
  }

  return "background";
}

function isProtectedGroundTile(tileX, tileY) {
  return isInsideArea(tileX, tileY, areas.house) || isInsideArea(tileX, tileY, areas.yard);
}

function isProtectedDecorTile(tileX, tileY) {
  return (
    isInsideArea(tileX, tileY, areas.house) ||
    isInsideArea(tileX, tileY, areas.yard) ||
    isInsideArea(tileX, tileY, areas.path) ||
    isInsideArea(tileX, tileY, areas.door) ||
    isInsideArea(tileX, tileY, areas.lockedPath) ||
    isSpawnTile(tileX, tileY)
  );
}

function isSpawnTile(tileX, tileY) {
  return (
    (tileX === objects.playerSpawn.tileX && tileY === objects.playerSpawn.tileY) ||
    (tileX === objects.dogSpawn.tileX && tileY === objects.dogSpawn.tileY)
  );
}

function isInsideArea(tileX, tileY, area) {
  return (
    tileX >= area.x &&
    tileY >= area.y &&
    tileX < area.x + area.width &&
    tileY < area.y + area.height
  );
}

function isInsideMap(tileX, tileY) {
  return tileX >= 0 && tileY >= 0 && tileX < mapWidth && tileY < mapHeight;
}

function createEmptyData() {
  return createFilledData(gid.empty);
}

function createFilledData(value) {
  return Array.from({ length: mapWidth * mapHeight }, () => value);
}

function fillArea(data, area, value) {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      setTile(data, tileX, tileY, value);
    }
  }
}

function applyRows(data, startTileY, rows) {
  for (let rowOffset = 0; rowOffset < rows.length; rowOffset += 1) {
    const row = rows[rowOffset];

    for (let tileX = 0; tileX < row.length; tileX += 1) {
      setTile(data, tileX, startTileY + rowOffset, row[tileX]);
    }
  }
}

function setTile(data, tileX, tileY, value) {
  data[tileY * mapWidth + tileX] = value;
}

function readTile(data, tileX, tileY) {
  return data[tileY * mapWidth + tileX] ?? gid.empty;
}

function tile(row, column) {
  return row * tilesetColumns + column + 1;
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function createSeededRandom(initialSeed) {
  let state = initialSeed >>> 0;

  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

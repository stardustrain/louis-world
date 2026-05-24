import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const gameDirectory = resolve(scriptDirectory, "..");

const tileSize = 32;
const mapWidth = 40;
const mapHeight = 24;
const tileCount = 7;

const paths = {
  tileset: resolve(gameDirectory, "public/assets/tilesets/home-yard-placeholder.svg"),
  tilemap: resolve(gameDirectory, "public/assets/tilemaps/home-yard-blockout.json"),
};

const gid = {
  empty: 0,
  ground: 1,
  yard: 2,
  path: 3,
  house: 4,
  decor: 5,
  collision: 6,
  lockedPathHint: 7,
};

const areas = {
  house: { x: 15, y: 4, width: 10, height: 7 },
  yard: { x: 13, y: 11, width: 14, height: 8 },
  door: { x: 19, y: 10, width: 2, height: 1 },
  path: { x: 19, y: 11, width: 2, height: 8 },
  lockedPath: { x: 19, y: 19, width: 2, height: 1 },
};

const objects = {
  playerSpawn: { name: "player_spawn", tileX: 19, tileY: 11 },
  dogSpawn: { name: "dog_spawn", tileX: 20, tileY: 13 },
};

await mkdir(dirname(paths.tileset), { recursive: true });
await mkdir(dirname(paths.tilemap), { recursive: true });
await writeFile(paths.tileset, createTilesetSvg(), "utf8");
await writeFile(paths.tilemap, `${JSON.stringify(createTilemapJson(), null, 2)}\n`, "utf8");

function createTilesetSvg() {
  const tileColors = ["#233647", "#3d6f5d", "#b9a56b", "#7c5a4a", "#89c6a3", "#ef4444", "#8b5cf6"];
  const tileLabels = ["GRD", "YRD", "PTH", "HSE", "DEC", "BLK", "LCK"];
  const rects = tileColors
    .map((color, index) => {
      const x = index * tileSize;
      const label = tileLabels[index];

      return [
        `<rect x="${x}" y="0" width="${tileSize}" height="${tileSize}" fill="${color}" />`,
        `<rect x="${x + 1}" y="1" width="${tileSize - 2}" height="${tileSize - 2}" fill="none" stroke="#f8fafc" stroke-opacity="0.35" />`,
        `<text x="${x + 16}" y="20" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5" paint-order="stroke fill">${label}</text>`,
      ].join("\n  ");
    })
    .join("\n  ");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize * tileCount}" height="${tileSize}" viewBox="0 0 ${tileSize * tileCount} ${tileSize}">`,
    '  <rect width="100%" height="100%" fill="#111827" />',
    `  ${rects}`,
    "</svg>",
    "",
  ].join("\n");
}

function createTilemapJson() {
  return {
    compressionlevel: -1,
    height: mapHeight,
    infinite: false,
    layers: [
      createTileLayer(1, "ground_base", createGroundBaseData()),
      createTileLayer(2, "yard_and_path", createYardAndPathData()),
      createTileLayer(3, "house_blockout", createHouseBlockoutData()),
      createTileLayer(4, "decor_soft_boundary", createDecorSoftBoundaryData()),
      createTileLayer(5, "collision_blockout", createCollisionBlockoutData(), false),
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
        columns: tileCount,
        firstgid: 1,
        image: "../tilesets/home-yard-placeholder.svg",
        imageheight: tileSize,
        imagewidth: tileSize * tileCount,
        margin: 0,
        name: "home-yard-placeholder",
        spacing: 0,
        tilecount: tileCount,
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
  return Array.from({ length: mapWidth * mapHeight }, () => gid.ground);
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

function createDecorSoftBoundaryData() {
  const data = createEmptyData();

  for (let tileY = areas.yard.y; tileY < areas.yard.y + areas.yard.height; tileY += 1) {
    setTile(data, areas.yard.x - 1, tileY, gid.decor);
    setTile(data, areas.yard.x + areas.yard.width, tileY, gid.decor);
  }

  for (let tileX = areas.yard.x; tileX < areas.yard.x + areas.yard.width; tileX += 1) {
    const overlapsDoor = tileX >= areas.door.x && tileX < areas.door.x + areas.door.width;

    if (!overlapsDoor) {
      setTile(data, tileX, areas.yard.y, gid.decor);
    }
  }

  setTile(data, 11, 14, gid.decor);
  setTile(data, 28, 15, gid.decor);

  return data;
}

function createCollisionBlockoutData() {
  const data = createEmptyData();

  fillArea(data, areas.house, gid.collision);
  fillArea(data, areas.door, gid.empty);
  fillArea(data, areas.lockedPath, gid.collision);

  for (let tileX = 0; tileX < mapWidth; tileX += 1) {
    setTile(data, tileX, 0, gid.collision);
    setTile(data, tileX, mapHeight - 1, gid.collision);
  }

  for (let tileY = 0; tileY < mapHeight; tileY += 1) {
    setTile(data, 0, tileY, gid.collision);
    setTile(data, mapWidth - 1, tileY, gid.collision);
  }

  return data;
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

function createEmptyData() {
  return Array.from({ length: mapWidth * mapHeight }, () => gid.empty);
}

function fillArea(data, area, tileGid) {
  for (let tileY = area.y; tileY < area.y + area.height; tileY += 1) {
    for (let tileX = area.x; tileX < area.x + area.width; tileX += 1) {
      setTile(data, tileX, tileY, tileGid);
    }
  }
}

function setTile(data, tileX, tileY, tileGid) {
  const tileIndex = tileY * mapWidth + tileX;
  data[tileIndex] = tileGid;
}

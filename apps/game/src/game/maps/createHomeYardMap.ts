import Phaser from "phaser";

import {
  HOME_YARD_LAYER_COLLISION_BLOCKOUT,
  HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY,
  HOME_YARD_LAYER_GROUND_BASE,
  HOME_YARD_LAYER_HOUSE_BLOCKOUT,
  HOME_YARD_LAYER_YARD_AND_PATH,
  HOME_YARD_MAP_KEY,
  HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS,
  HOME_YARD_TILESET_KEY,
  HOME_YARD_TILESET_NAME,
} from "./homeYardMap";
import { type HomeYardMarkers, readHomeYardMarkers } from "./homeYardMarkers";

export type HomeYardMapRuntime = {
  readonly map: Phaser.Tilemaps.Tilemap;
  readonly layers: {
    readonly groundBase: Phaser.Tilemaps.TilemapLayer;
    readonly yardAndPath: Phaser.Tilemaps.TilemapLayer;
    readonly houseBlockout: Phaser.Tilemaps.TilemapLayer;
    readonly decorSoftBoundary: Phaser.Tilemaps.TilemapLayer;
    readonly collisionBlockout: Phaser.Tilemaps.TilemapLayer;
  };
  readonly markers: HomeYardMarkers;
};

export function createHomeYardMap(scene: Phaser.Scene): HomeYardMapRuntime {
  const map = scene.make.tilemap({ key: HOME_YARD_MAP_KEY });
  const tileset = map.addTilesetImage(HOME_YARD_TILESET_NAME, HOME_YARD_TILESET_KEY);

  if (tileset === null) {
    throw new Error(`Missing home yard tileset: ${HOME_YARD_TILESET_NAME}`);
  }

  const groundBase = createRequiredLayer(map, HOME_YARD_LAYER_GROUND_BASE, tileset);
  const yardAndPath = createRequiredLayer(map, HOME_YARD_LAYER_YARD_AND_PATH, tileset);
  const houseBlockout = createRequiredLayer(map, HOME_YARD_LAYER_HOUSE_BLOCKOUT, tileset);
  const decorSoftBoundary = createRequiredLayer(map, HOME_YARD_LAYER_DECOR_SOFT_BOUNDARY, tileset);
  const collisionBlockout = createRequiredLayer(map, HOME_YARD_LAYER_COLLISION_BLOCKOUT, tileset);
  const objectLayer = map.getObjectLayer(HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS);

  if (objectLayer === null) {
    throw new Error(`Missing home yard object layer: ${HOME_YARD_OBJECT_LAYER_GAMEPLAY_MARKERS}`);
  }

  collisionBlockout.setCollisionByProperty({ collides: true });
  collisionBlockout.setAlpha(0.35);
  collisionBlockout.setVisible(import.meta.env.DEV);

  scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  return {
    layers: {
      collisionBlockout,
      decorSoftBoundary,
      groundBase,
      houseBlockout,
      yardAndPath,
    },
    map,
    markers: readHomeYardMarkers(objectLayer),
  };
}

function createRequiredLayer(
  map: Phaser.Tilemaps.Tilemap,
  layerName: string,
  tileset: Phaser.Tilemaps.Tileset,
): Phaser.Tilemaps.TilemapLayer {
  const layer = map.createLayer(layerName, tileset);

  if (layer === null) {
    throw new Error(`Missing home yard tile layer: ${layerName}`);
  }

  if (layer instanceof Phaser.Tilemaps.TilemapGPULayer) {
    throw new Error(`Unexpected home yard GPU tile layer: ${layerName}`);
  }

  return layer;
}

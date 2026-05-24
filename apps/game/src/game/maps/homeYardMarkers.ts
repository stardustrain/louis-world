import {
  HOME_YARD_OBJECT_DOG_SPAWN,
  HOME_YARD_OBJECT_HOUSE_DOOR,
  HOME_YARD_OBJECT_LOCKED_PATH,
  HOME_YARD_OBJECT_PLAYER_SPAWN,
} from "./homeYardMap";

export type HomeYardTiledObject = {
  readonly name?: string;
  readonly point?: boolean;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
};

export type HomeYardObjectLayer = {
  readonly objects: readonly HomeYardTiledObject[];
};

export type HomeYardPointMarker = {
  readonly x: number;
  readonly y: number;
};

export type HomeYardAreaMarker = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type HomeYardMarkers = {
  readonly playerSpawn: HomeYardPointMarker;
  readonly dogSpawn: HomeYardPointMarker;
  readonly houseDoor: HomeYardAreaMarker;
  readonly lockedPath: HomeYardAreaMarker;
};

export function readHomeYardMarkers(objectLayer: HomeYardObjectLayer): HomeYardMarkers {
  return {
    dogSpawn: readPointMarker(objectLayer, HOME_YARD_OBJECT_DOG_SPAWN),
    houseDoor: readAreaMarker(objectLayer, HOME_YARD_OBJECT_HOUSE_DOOR),
    lockedPath: readAreaMarker(objectLayer, HOME_YARD_OBJECT_LOCKED_PATH),
    playerSpawn: readPointMarker(objectLayer, HOME_YARD_OBJECT_PLAYER_SPAWN),
  };
}

function readPointMarker(
  objectLayer: HomeYardObjectLayer,
  markerName: string,
): HomeYardPointMarker {
  const object = findRequiredMarker(objectLayer, markerName);
  const x = readRequiredNumber(object, markerName, "x");
  const y = readRequiredNumber(object, markerName, "y");

  return { x, y };
}

function readAreaMarker(objectLayer: HomeYardObjectLayer, markerName: string): HomeYardAreaMarker {
  const object = findRequiredMarker(objectLayer, markerName);
  const x = readRequiredNumber(object, markerName, "x");
  const y = readRequiredNumber(object, markerName, "y");
  const width = readRequiredNumber(object, markerName, "width");
  const height = readRequiredNumber(object, markerName, "height");

  return { height, width, x, y };
}

function findRequiredMarker(
  objectLayer: HomeYardObjectLayer,
  markerName: string,
): HomeYardTiledObject {
  const object = objectLayer.objects.find((candidate) => candidate.name === markerName);

  if (object === undefined) {
    throw new Error(`Missing home yard marker: ${markerName}`);
  }

  return object;
}

function readRequiredNumber(
  object: HomeYardTiledObject,
  markerName: string,
  propertyName: "x" | "y" | "width" | "height",
): number {
  const value = object[propertyName];

  if (typeof value !== "number") {
    throw new Error(`Home yard marker ${markerName} is missing numeric ${propertyName}`);
  }

  return value;
}

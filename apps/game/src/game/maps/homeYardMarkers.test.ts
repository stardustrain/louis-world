import { describe, expect, it } from "vitest";

import { readHomeYardMarkers } from "./homeYardMarkers";

describe("readHomeYardMarkers", () => {
  it("reads required point and area markers from a Tiled object layer", () => {
    const markers = readHomeYardMarkers({
      objects: [
        { name: "player_spawn", point: true, x: 624, y: 368 },
        { name: "dog_spawn", point: true, x: 656, y: 432 },
        { height: 32, name: "house_door", width: 64, x: 608, y: 320 },
        { height: 32, name: "locked_path", width: 64, x: 608, y: 608 },
      ],
    });

    expect(markers).toEqual({
      dogSpawn: { x: 656, y: 432 },
      houseDoor: { height: 32, width: 64, x: 608, y: 320 },
      lockedPath: { height: 32, width: 64, x: 608, y: 608 },
      playerSpawn: { x: 624, y: 368 },
    });
  });

  it("throws a clear error when a required marker is missing", () => {
    expect(() =>
      readHomeYardMarkers({
        objects: [
          { name: "player_spawn", point: true, x: 624, y: 368 },
          { name: "dog_spawn", point: true, x: 656, y: 432 },
          { height: 32, name: "house_door", width: 64, x: 608, y: 320 },
        ],
      }),
    ).toThrow("Missing home yard marker: locked_path");
  });
});

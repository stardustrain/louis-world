import atlasJsonText from "../../../public/assets/images/celestial-objects.json?raw";

type AtlasFrameRect = {
  readonly h: number;
  readonly w: number;
  readonly x: number;
  readonly y: number;
};

type AtlasFrame = {
  readonly frame: AtlasFrameRect;
  readonly rotated: boolean;
  readonly sourceSize: {
    readonly h: number;
    readonly w: number;
  };
  readonly spriteSourceSize: AtlasFrameRect;
  readonly trimmed: boolean;
};

type AtlasJson = {
  readonly frames: Record<string, AtlasFrame>;
  readonly meta: {
    readonly image: string;
    readonly size: {
      readonly h: number;
      readonly w: number;
    };
  };
};

const atlas: AtlasJson = JSON.parse(atlasJsonText);
const sourceImageSize = { w: 384, h: 256 };
const expectedFrames: Record<string, AtlasFrameRect> = {
  asteroid_01: { x: 0, y: 224, w: 32, h: 32 },
  asteroid_02: { x: 34, y: 226, w: 60, h: 30 },
  asteroid_03: { x: 100, y: 232, w: 25, h: 18 },
  asteroid_04: { x: 137, y: 235, w: 13, h: 11 },
  dwarf_star_01: { x: 128, y: 192, w: 32, h: 32 },
  dwarf_star_02: { x: 160, y: 192, w: 32, h: 32 },
  dwarf_star_03: { x: 192, y: 192, w: 32, h: 32 },
  dwarf_star_04: { x: 224, y: 192, w: 32, h: 32 },
  moon_01: { x: 0, y: 192, w: 32, h: 32 },
  moon_02: { x: 32, y: 192, w: 32, h: 32 },
  moon_03: { x: 64, y: 192, w: 32, h: 32 },
  moon_04: { x: 96, y: 192, w: 32, h: 32 },
  star_cluster_01: { x: 160, y: 225, w: 32, h: 31 },
  star_cluster_02: { x: 196, y: 229, w: 27, h: 25 },
  star_cluster_03: { x: 224, y: 224, w: 32, h: 30 },
};

describe("celestialObjectsAtlasJson", () => {
  it("복사된 천체 오브젝트 PNG를 원본 이미지로 사용합니다.", () => {
    expect(atlas.meta.image).toBe("celestial-objects.png");
    expect(atlas.meta.size).toEqual(sourceImageSize);
  });

  it("승인된 홈마당 장식 frame만 정의합니다.", () => {
    expect(Object.keys(atlas.frames).sort()).toEqual(Object.keys(expectedFrames).sort());
  });

  it("승인된 각 frame을 원본 스프라이트 사각형에 유지합니다.", () => {
    for (const [frameName, expectedFrame] of Object.entries(expectedFrames)) {
      expect(atlas.frames[frameName]?.frame).toEqual(expectedFrame);
    }
  });

  it("모든 frame 사각형을 원본 이미지 경계 안에 유지합니다.", () => {
    for (const frame of Object.values(atlas.frames)) {
      const frameRightEdge = frame.frame.x + frame.frame.w;
      const frameBottomEdge = frame.frame.y + frame.frame.h;

      expect(frame.frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.frame.y).toBeGreaterThanOrEqual(0);
      expect(frameRightEdge).toBeLessThanOrEqual(sourceImageSize.w);
      expect(frameBottomEdge).toBeLessThanOrEqual(sourceImageSize.h);
    }
  });

  it("각 frame 사각형과 일치하는 untrimmed metadata를 사용합니다.", () => {
    for (const frame of Object.values(atlas.frames)) {
      expect(frame.rotated).toBe(false);
      expect(frame.trimmed).toBe(false);
      expect(frame.spriteSourceSize).toEqual({
        x: 0,
        y: 0,
        w: frame.frame.w,
        h: frame.frame.h,
      });
      expect(frame.sourceSize).toEqual({
        w: frame.frame.w,
        h: frame.frame.h,
      });
    }
  });
});

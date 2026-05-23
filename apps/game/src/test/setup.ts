import { afterEach } from "vitest";

const createMockCanvasContext = (): Partial<CanvasRenderingContext2D> => ({
  drawImage: () => {},
  fillRect: () => {},
  getImageData: () => ({
    colorSpace: "srgb",
    data: new Uint8ClampedArray([10, 20, 30, 128]),
    height: 1,
    width: 1,
  }),
  putImageData: () => {},
});

HTMLCanvasElement.prototype.getContext = function getContext(contextId: string) {
  if (contextId !== "2d") {
    return null;
  }

  return createMockCanvasContext() as CanvasRenderingContext2D;
} as HTMLCanvasElement["getContext"];

afterEach(() => {
  document.body.innerHTML = "";
});

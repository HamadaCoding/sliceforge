import type { FramePosition, SpriteFrame } from "../types/sprite";

/**
 * Extracts a single sprite frame from the source sheet onto an offscreen canvas
 * and produces a standalone PNG Blob alongside a temporary object URL for previewing.
 * 
 * Execution Flow:
 * 1. Initializes an offscreen HTML5 canvas matching the target frame dimensions.
 * 2. Blits the sub-rectangle (originX, originY, width, height) from the source sheet.
 * 3. Encodes the extracted pixel data to a high-fidelity image/png Blob.
 * 4. Generates a local Object URL for immediate thumbnail rendering in the UI.
 */
export async function sliceImageFrame(
  sourceImageElement: HTMLImageElement,
  framePosition: FramePosition
): Promise<SpriteFrame> {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = framePosition.width;
  offscreenCanvas.height = framePosition.height;

  const canvasRenderingContext = offscreenCanvas.getContext("2d");
  if (!canvasRenderingContext) {
    throw new Error(`Failed to acquire 2D rendering context for frame ${framePosition.id}`);
  }

  // Clear any existing background and paint the frame rectangle
  canvasRenderingContext.clearRect(0, 0, framePosition.width, framePosition.height);
  canvasRenderingContext.drawImage(
    sourceImageElement,
    framePosition.originX ?? framePosition.x,
    framePosition.originY ?? framePosition.y,
    framePosition.width,
    framePosition.height,
    0,
    0,
    framePosition.width,
    framePosition.height
  );

  const frameImageBlob = await new Promise<Blob>((resolvePromise, rejectPromise) => {
    offscreenCanvas.toBlob((encodedBlob) => {
      if (!encodedBlob) {
        rejectPromise(new Error(`Failed to encode PNG blob for frame ${framePosition.id}`));
        return;
      }
      resolvePromise(encodedBlob);
    }, "image/png");
  });

  return {
    ...framePosition,
    blob: frameImageBlob,
    dataUrl: URL.createObjectURL(frameImageBlob),
    isExcluded: false,
  };
}

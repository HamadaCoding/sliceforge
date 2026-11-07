import type { FramePosition } from "../types/sprite";

export interface ClusterDetectionOptions {
  /** Alpha threshold below which a pixel is considered transparent (0 to 255). Defaults to 15. */
  alphaThreshold?: number;
  /** Pixel gap distance within which adjacent bounding boxes are merged into a single sprite. Defaults to 3. */
  mergeGap?: number;
  /** Minimum pixel dimension (width or height) to ignore noise speckles. Defaults to 3. */
  minimumSpriteDimension?: number;
}

interface RawBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  pixelCount: number;
}

/**
 * Pure Pixel-Scanning Auto-Slicing Engine
 * 
 * Inspects the exact pixel alpha values of an HTMLImageElement using an offscreen canvas
 * buffer and identifies distinct sprite clusters with zero manual margins or spacing required.
 * 
 * Algorithm:
 * 1. Reads the raw RGBA pixel buffer via `getImageData`.
 * 2. Identifies all pixels with `alpha > alphaThreshold`.
 * 3. Extracts connected components and calculates their tight bounding boxes.
 * 4. Merges bounding boxes located within `mergeGap` pixels of each other (reconnecting
 *    floating character accessories, effects, or separated limbs).
 * 5. Sorts the detected clusters into a natural reading grid (top-to-bottom, left-to-right).
 * 6. Generates valid `FramePosition` objects ready for instant slicing and zero-padded export.
 */
export function detectSpriteClusters(
  sourceImageElement: HTMLImageElement,
  options: ClusterDetectionOptions = {}
): FramePosition[] {
  const imageWidth = sourceImageElement.naturalWidth || sourceImageElement.width;
  const imageHeight = sourceImageElement.naturalHeight || sourceImageElement.height;

  if (imageWidth <= 0 || imageHeight <= 0) {
    return [];
  }

  const {
    alphaThreshold = 15,
    mergeGap = 3,
    minimumSpriteDimension = 3,
  } = options;

  // Initialize offscreen canvas to access raw pixel buffer
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = imageWidth;
  offscreenCanvas.height = imageHeight;

  const canvasContext = offscreenCanvas.getContext("2d", { willReadFrequently: true });
  if (!canvasContext) {
    return [];
  }

  canvasContext.drawImage(sourceImageElement, 0, 0);
  const imagePixelData = canvasContext.getImageData(0, 0, imageWidth, imageHeight);
  const rgbaBuffer = imagePixelData.data;

  // Visited bitmask to prevent re-scanning pixels
  const visitedPixels = new Uint8Array(imageWidth * imageHeight);
  const rawClusters: RawBoundingBox[] = [];

  // Reusable breadth-first search queue
  const searchQueue = new Int32Array(imageWidth * imageHeight);

  for (let currentY = 0; currentY < imageHeight; currentY += 1) {
    for (let currentX = 0; currentX < imageWidth; currentX += 1) {
      const initialPixelIndex = currentY * imageWidth + currentX;

      if (visitedPixels[initialPixelIndex] === 1) {
        continue;
      }

      // Check alpha channel (4th byte in RGBA sequence)
      const initialAlpha = rgbaBuffer[initialPixelIndex * 4 + 3];
      if (initialAlpha <= alphaThreshold) {
        visitedPixels[initialPixelIndex] = 1;
        continue;
      }

      // Found a new visible pixel island; initiate BFS flood-fill
      let queueHead = 0;
      let queueTail = 0;

      searchQueue[queueTail] = initialPixelIndex;
      queueTail += 1;
      visitedPixels[initialPixelIndex] = 1;

      let minX = currentX;
      let maxX = currentX;
      let minY = currentY;
      let maxY = currentY;
      let clusterPixelCount = 0;

      while (queueHead < queueTail) {
        const activeIndex = searchQueue[queueHead];
        queueHead += 1;
        clusterPixelCount += 1;

        const pixelX = activeIndex % imageWidth;
        const pixelY = Math.floor(activeIndex / imageWidth);

        if (pixelX < minX) minX = pixelX;
        if (pixelX > maxX) maxX = pixelX;
        if (pixelY < minY) minY = pixelY;
        if (pixelY > maxY) maxY = pixelY;

        // Explore 4-connected neighbors
        const neighborCoordinates = [
          [pixelX + 1, pixelY],
          [pixelX - 1, pixelY],
          [pixelX, pixelY + 1],
          [pixelX, pixelY - 1],
        ];

        for (const [neighborX, neighborY] of neighborCoordinates) {
          if (
            neighborX >= 0 &&
            neighborX < imageWidth &&
            neighborY >= 0 &&
            neighborY < imageHeight
          ) {
            const neighborIndex = neighborY * imageWidth + neighborX;
            if (visitedPixels[neighborIndex] === 0) {
              visitedPixels[neighborIndex] = 1;
              const neighborAlpha = rgbaBuffer[neighborIndex * 4 + 3];
              if (neighborAlpha > alphaThreshold) {
                searchQueue[queueTail] = neighborIndex;
                queueTail += 1;
              }
            }
          }
        }
      }

      const clusterWidth = maxX - minX + 1;
      const clusterHeight = maxY - minY + 1;

      // Filter out single-pixel noise or speckles
      if (clusterWidth >= minimumSpriteDimension && clusterHeight >= minimumSpriteDimension) {
        rawClusters.push({
          minX,
          minY,
          maxX,
          maxY,
          pixelCount: clusterPixelCount,
        });
      }
    }
  }

  if (rawClusters.length === 0) {
    return [];
  }

  // Merge clusters that lie within mergeGap pixels of each other
  const mergedClusters = mergeNearbyBoundingBoxes(rawClusters, mergeGap);

  // Sort clusters into a logical reading grid (row bands, then left-to-right)
  return formatClustersIntoGridFrames(mergedClusters, imageWidth, imageHeight);
}

/**
 * Iteratively merges bounding boxes that overlap or are situated within
 * `mergeDistance` pixels of one another.
 */
function mergeNearbyBoundingBoxes(
  clusters: RawBoundingBox[],
  mergeDistance: number
): RawBoundingBox[] {
  let hasMerged = true;
  let activeList = [...clusters];

  while (hasMerged) {
    hasMerged = false;
    const consolidatedList: RawBoundingBox[] = [];
    const mergedFlags = new Uint8Array(activeList.length);

    for (let indexA = 0; indexA < activeList.length; indexA += 1) {
      if (mergedFlags[indexA] === 1) {
        continue;
      }

      let currentBox = { ...activeList[indexA] };

      for (let indexB = indexA + 1; indexB < activeList.length; indexB += 1) {
        if (mergedFlags[indexB] === 1) {
          continue;
        }

        const candidateBox = activeList[indexB];

        const isHorizontallyAdjacent =
          currentBox.minX <= candidateBox.maxX + mergeDistance &&
          currentBox.maxX + mergeDistance >= candidateBox.minX;

        const isVerticallyAdjacent =
          currentBox.minY <= candidateBox.maxY + mergeDistance &&
          currentBox.maxY + mergeDistance >= candidateBox.minY;

        if (isHorizontallyAdjacent && isVerticallyAdjacent) {
          currentBox = {
            minX: Math.min(currentBox.minX, candidateBox.minX),
            minY: Math.min(currentBox.minY, candidateBox.minY),
            maxX: Math.max(currentBox.maxX, candidateBox.maxX),
            maxY: Math.max(currentBox.maxY, candidateBox.maxY),
            pixelCount: currentBox.pixelCount + candidateBox.pixelCount,
          };
          mergedFlags[indexB] = 1;
          hasMerged = true;
        }
      }

      consolidatedList.push(currentBox);
    }

    activeList = consolidatedList;
  }

  return activeList;
}

/**
 * Organizes unstructured 2D bounding boxes into natural row bands,
 * assigns 0-based row and column indices, and returns standardized FramePosition items.
 */
function formatClustersIntoGridFrames(
  clusters: RawBoundingBox[],
  imageWidth: number,
  imageHeight: number
): FramePosition[] {
  // First sort by vertical center
  const sortedByVerticalPosition = [...clusters].sort((boxA, boxB) => {
    const centerYA = (boxA.minY + boxA.maxY) / 2;
    const centerYB = (boxB.minY + boxB.maxY) / 2;
    return centerYA - centerYB;
  });

  // Group into horizontal row bands
  const rowBands: RawBoundingBox[][] = [];

  for (const candidateBox of sortedByVerticalPosition) {
    const candidateCenterY = (candidateBox.minY + candidateBox.maxY) / 2;
    let placedInBand = false;

    for (const activeBand of rowBands) {
      // Calculate average vertical span of the active band
      const bandMinY = Math.min(...activeBand.map((box) => box.minY));
      const bandMaxY = Math.max(...activeBand.map((box) => box.maxY));

      // If candidate overlaps with this row band vertically
      if (candidateCenterY >= bandMinY && candidateCenterY <= bandMaxY) {
        activeBand.push(candidateBox);
        placedInBand = true;
        break;
      }
    }

    if (!placedInBand) {
      rowBands.push([candidateBox]);
    }
  }

  // Format into FramePositions with rowIndex and columnIndex
  const formattedFrames: FramePosition[] = [];
  let sequentialIndex = 0;

  for (let rowIndex = 0; rowIndex < rowBands.length; rowIndex += 1) {
    const currentBand = rowBands[rowIndex];
    // Sort left to right within each row
    currentBand.sort((boxA, boxB) => boxA.minX - boxB.minX);

    for (let columnIndex = 0; columnIndex < currentBand.length; columnIndex += 1) {
      const box = currentBand[columnIndex];
      const originX = box.minX;
      const originY = box.minY;
      const frameWidth = box.maxX - box.minX + 1;
      const frameHeight = box.maxY - box.minY + 1;

      formattedFrames.push({
        id: `frame_${rowIndex}_${columnIndex}`,
        index: sequentialIndex,
        rowIndex,
        columnIndex,
        originX,
        originY,
        width: frameWidth,
        height: frameHeight,
        isValid: originX + frameWidth <= imageWidth && originY + frameHeight <= imageHeight,
        row: rowIndex,
        col: columnIndex,
        x: originX,
        y: originY,
      });

      sequentialIndex += 1;
    }
  }

  return formattedFrames;
}

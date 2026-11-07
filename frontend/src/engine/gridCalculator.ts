import type { SliceSettings, FramePosition, GridDimensions } from "../types/sprite";

/**
 * Normalizes user-supplied pixel settings into valid, non-negative whole numbers
 * to ensure that calculated grid lines align precisely to pixel boundaries.
 */
export function normalizeSliceSettings(sliceSettings: SliceSettings): SliceSettings {
  return {
    slicingMode: sliceSettings.slicingMode || "auto",
    frameWidth: clampDimension(sliceSettings.frameWidth),
    frameHeight: clampDimension(sliceSettings.frameHeight),
    marginX: clampOffset(sliceSettings.marginX),
    marginY: clampOffset(sliceSettings.marginY),
    spacingX: clampOffset(sliceSettings.spacingX),
    spacingY: clampOffset(sliceSettings.spacingY),
    alphaThreshold: Math.max(0, Math.min(255, Math.floor(sliceSettings.alphaThreshold ?? 15))),
    mergeGap: Math.max(0, Math.min(32, Math.floor(sliceSettings.mergeGap ?? 3))),
  };
}

/**
 * Restricts dimension values (width, height) to positive integers >= 1.
 */
function clampDimension(dimensionValue: number): number {
  if (!Number.isFinite(dimensionValue)) {
    return 1;
  }

  return Math.max(1, Math.floor(dimensionValue));
}

/**
 * Restricts spacing and margin offsets to non-negative integers >= 0.
 */
function clampOffset(offsetValue: number): number {
  if (!Number.isFinite(offsetValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(offsetValue));
}

/**
 * Computes how many uniform frame cells fit inside the sprite sheet boundaries.
 * 
 * Slicing Mathematics:
 * - Available space is: Total Dimension - Margin Offset
 * - Each cell occupies `frameDimension + spacingDimension`, except the last cell
 *   which does not require trailing spacing. Therefore, one `spacingDimension`
 *   is added back to the available space before floor division.
 */
export function calculateGridDimensions(
  imageWidth: number,
  imageHeight: number,
  sliceSettings: SliceSettings
): GridDimensions {
  const { frameWidth, frameHeight, marginX, marginY, spacingX, spacingY } = sliceSettings;

  if (frameWidth <= 0 || frameHeight <= 0) {
    return { totalRows: 0, totalColumns: 0, totalFrames: 0, rows: 0, cols: 0 };
  }

  const availableWidth = imageWidth - marginX;
  const availableHeight = imageHeight - marginY;

  if (availableWidth < frameWidth || availableHeight < frameHeight) {
    return { totalRows: 0, totalColumns: 0, totalFrames: 0, rows: 0, cols: 0 };
  }

  const columnCount = Math.floor((availableWidth + spacingX) / (frameWidth + spacingX));
  const rowCount = Math.floor((availableHeight + spacingY) / (frameHeight + spacingY));
  const safeColumnCount = Math.max(0, columnCount);
  const safeRowCount = Math.max(0, rowCount);
  const totalFrames = safeRowCount * safeColumnCount;

  return {
    totalRows: safeRowCount,
    totalColumns: safeColumnCount,
    totalFrames,
    rows: safeRowCount,
    cols: safeColumnCount,
  };
}

/**
 * Generates coordinate bounding boxes for every cell in the calculated grid.
 * 
 * Traverses row-by-row and column-by-column, recording 0-based indices, pixel
 * origin coordinates (originX, originY), and validity checks against image boundaries.
 */
export function generateFramePositions(
  imageWidth: number,
  imageHeight: number,
  sliceSettings: SliceSettings
): FramePosition[] {
  const { totalRows, totalColumns } = calculateGridDimensions(imageWidth, imageHeight, sliceSettings);
  const generatedFrames: FramePosition[] = [];
  let sequentialFrameIndex = 0;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex += 1) {
      const originX = sliceSettings.marginX + columnIndex * (sliceSettings.frameWidth + sliceSettings.spacingX);
      const originY = sliceSettings.marginY + rowIndex * (sliceSettings.frameHeight + sliceSettings.spacingY);
      const isInsideImage =
        originX + sliceSettings.frameWidth <= imageWidth &&
        originY + sliceSettings.frameHeight <= imageHeight;

      generatedFrames.push({
        id: `frame_${rowIndex}_${columnIndex}`,
        index: sequentialFrameIndex,
        rowIndex,
        columnIndex,
        originX,
        originY,
        width: sliceSettings.frameWidth,
        height: sliceSettings.frameHeight,
        isValid: isInsideImage,

        // Backward compatibility
        row: rowIndex,
        col: columnIndex,
        x: originX,
        y: originY,
      });

      sequentialFrameIndex += 1;
    }
  }

  return generatedFrames;
}

/**
 * Calculates optimal frame width and frame height when a user specifies
 * the desired target column and row counts (Auto-Fit Grid Assistant).
 */
export function frameSizeForGrid(
  imageWidth: number,
  imageHeight: number,
  sliceSettings: SliceSettings,
  columnCount: number,
  rowCount: number
): Pick<SliceSettings, "frameWidth" | "frameHeight"> | null {
  if (columnCount <= 0 || rowCount <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return null;
  }

  const availableWidth = imageWidth - sliceSettings.marginX;
  const availableHeight = imageHeight - sliceSettings.marginY;
  const calculatedFrameWidth = Math.floor(
    (availableWidth - (columnCount - 1) * sliceSettings.spacingX) / columnCount
  );
  const calculatedFrameHeight = Math.floor(
    (availableHeight - (rowCount - 1) * sliceSettings.spacingY) / rowCount
  );

  if (calculatedFrameWidth < 1 || calculatedFrameHeight < 1) {
    return null;
  }

  return { frameWidth: calculatedFrameWidth, frameHeight: calculatedFrameHeight };
}

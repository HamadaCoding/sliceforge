import type { SpriteFrame } from "../types/sprite";

/**
 * Grid boundary metrics spanning the entire parsed sprite sheet.
 */
export interface GridSpan {
  /** Maximum number of rows discovered across all frames */
  totalRows: number;
  /** Maximum number of columns discovered across all frames */
  totalColumns: number;
}

/**
 * Calculates dynamic zero-padding for a 1-based index according to total axis length.
 * 
 * Padding Rules:
 * - Minimum pad width is 2 digits (e.g. 1 -> "01", 16 -> "16").
 * - When total axis length exceeds 99, pad width dynamically expands to 3 or more digits
 *   (e.g., if total rows is 100, row 1 formats as "001" and row 100 as "100").
 * 
 * @param sequentialPosition - The 1-based index along the axis (row or column).
 * @param totalAxisLength - The maximum count of elements along this axis.
 */
export function padGridIndex(sequentialPosition: number, totalAxisLength: number): string {
  const maximumAxisLength = Math.max(totalAxisLength, 1);
  const requiredDigitCount = Math.max(2, String(maximumAxisLength).length);
  return String(sequentialPosition).padStart(requiredDigitCount, "0");
}

/**
 * Builds the standardized zero-padded file name for a sprite frame.
 * 
 * Naming Format: `frame_row{R}_col{C}.png`
 * 
 * Examples:
 * - First frame (row 0, col 0 in a 16x16 grid): `frame_row01_col01.png`
 * - Intermediate frame (row 5, col 3 in a 16x16 grid): `frame_row06_col04.png`
 * - Final frame (row 15, col 15 in a 16x16 grid): `frame_row16_col16.png`
 * - Large grid (row 0, col 0 in a 120x80 grid): `frame_row001_col001.png`
 * 
 * @param zeroBasedRowIndex - The frame's 0-based row index.
 * @param zeroBasedColumnIndex - The frame's 0-based column index.
 * @param totalRows - Total rows in the sheet.
 * @param totalColumns - Total columns in the sheet.
 */
export function buildFrameFileName(
  zeroBasedRowIndex: number,
  zeroBasedColumnIndex: number,
  totalRows: number,
  totalColumns: number
): string {
  const oneBasedRowNumber = zeroBasedRowIndex + 1;
  const oneBasedColumnNumber = zeroBasedColumnIndex + 1;

  const paddedRowString = padGridIndex(oneBasedRowNumber, totalRows);
  const paddedColumnString = padGridIndex(oneBasedColumnNumber, totalColumns);

  return `frame_row${paddedRowString}_col${paddedColumnString}.png`;
}

/**
 * Determines the global grid span from all frames on the sheet, including frames
 * that may have been excluded from download by the user.
 */
export function resolveGridSpan(spriteFrames: SpriteFrame[]): GridSpan {
  return spriteFrames.reduce<GridSpan>(
    (accumulatedSpan, currentFrame) => {
      const currentRow = (currentFrame.rowIndex ?? currentFrame.row) + 1;
      const currentColumn = (currentFrame.columnIndex ?? currentFrame.col) + 1;

      return {
        totalRows: Math.max(accumulatedSpan.totalRows, currentRow),
        totalColumns: Math.max(accumulatedSpan.totalColumns, currentColumn),
      };
    },
    { totalRows: 0, totalColumns: 0 }
  );
}

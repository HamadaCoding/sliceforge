/**
 * SliceForge - Sprite Engine Type Definitions
 * 
 * Provides descriptive types for slicing configurations, coordinate grids,
 * and individual sprite frame positions.
 */

export type SlicingMode = "auto" | "grid";

/**
 * Pixel configuration controlling how the slicing engine divides a sprite sheet.
 */
export interface SliceSettings {
  /** Active slicing strategy: 'auto' (content-aware pixel alpha scan) or 'grid' (uniform dimensions) */
  slicingMode: SlicingMode;
  /** Width of each individual sprite cell in pixels (used in grid mode) */
  frameWidth: number;
  /** Height of each individual sprite cell in pixels (used in grid mode) */
  frameHeight: number;
  /** Horizontal margin offset in pixels from the sheet's left edge */
  marginX: number;
  /** Vertical margin offset in pixels from the sheet's top edge */
  marginY: number;
  /** Horizontal gap spacing between adjacent columns in pixels */
  spacingX: number;
  /** Vertical gap spacing between adjacent rows in pixels */
  spacingY: number;
  /** Pixel alpha threshold for auto-detection (0-255). Pixels <= this value are treated as transparent */
  alphaThreshold: number;
  /** Maximum pixel gap distance to merge detached cluster elements in auto-detection */
  mergeGap: number;
}

/**
 * Geometric positioning data calculated for an individual frame within the sprite sheet.
 */
export interface FramePosition {
  /** Unique frame identifier, formatted as `frame_{rowIndex}_{columnIndex}` */
  id: string;
  /** Sequential zero-based index across the entire sheet */
  index: number;
  /** Zero-based vertical row index */
  rowIndex: number;
  /** Zero-based horizontal column index */
  columnIndex: number;
  /** Pixel coordinate along the X-axis where this frame begins */
  originX: number;
  /** Pixel coordinate along the Y-axis where this frame begins */
  originY: number;
  /** Frame width in pixels */
  width: number;
  /** Frame height in pixels */
  height: number;
  /** Indicates whether the frame boundaries lie entirely within the source image dimensions */
  isValid: boolean;

  /** Backward-compatibility aliases */
  x: number;
  y: number;
  row: number;
  col: number;
}

/**
 * Renderable sprite frame holding the generated image data blob and UI state.
 */
export interface SpriteFrame extends FramePosition {
  /** Raw PNG image blob extracted from the canvas */
  blob?: Blob;
  /** Transient object URL for live image rendering in the UI */
  dataUrl?: string;
  /** When true, the user has marked this frame to be excluded from export */
  isExcluded: boolean;
  /** Optional tight bounding box excluding transparent padding */
  trimmedBounds?: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
}

/**
 * Summary dimensions of the calculated slicing grid.
 */
export interface GridDimensions {
  /** Total number of rows fitting inside the sheet boundaries */
  totalRows: number;
  /** Total number of columns fitting inside the sheet boundaries */
  totalColumns: number;
  /** Total frame count (totalRows * totalColumns) */
  totalFrames: number;

  /** Backward-compatibility aliases */
  rows: number;
  cols: number;
}

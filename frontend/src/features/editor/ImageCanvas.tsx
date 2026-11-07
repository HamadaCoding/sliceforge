import React, { useRef, useEffect } from "react";
import { useEditorStore } from "../../store/editorStore";
import { calculateGridDimensions } from "../../engine/gridCalculator";

/**
 * ImageCanvas Component
 * 
 * High-performance interactive HTML5 canvas displaying the active sprite sheet.
 * Features:
 * - Crisp pixel-art rendering with disabled smoothing (`imageSmoothingEnabled = false`).
 * - Dark checkered transparency backdrop for high contrast with transparent sprites.
 * - Dynamic HUD bounding box overlays for both auto-detected alpha clusters and uniform grid cells.
 */
export const ImageCanvas: React.FC = () => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const {
    imageElement,
    imageWidth,
    imageHeight,
    settings: sliceSettings,
    frames: slicedFrames,
  } = useEditorStore();

  useEffect(() => {
    const canvasElement = canvasElementRef.current;
    if (!canvasElement || !imageElement) {
      return;
    }

    const canvasRenderingContext = canvasElement.getContext("2d");
    if (!canvasRenderingContext) {
      return;
    }

    // Set canvas dimensions to exact source resolution
    canvasElement.width = imageWidth;
    canvasElement.height = imageHeight;

    // Disable image smoothing for ultra-crisp pixel art
    canvasRenderingContext.imageSmoothingEnabled = false;

    // Draw dark checkered transparency grid backdrop
    const checkerSize = Math.max(8, Math.floor(Math.min(imageWidth, imageHeight) / 32));
    for (let tileY = 0; tileY < imageHeight; tileY += checkerSize) {
      for (let tileX = 0; tileX < imageWidth; tileX += checkerSize) {
        const isDarkSquare = (Math.floor(tileX / checkerSize) + Math.floor(tileY / checkerSize)) % 2 === 0;
        canvasRenderingContext.fillStyle = isDarkSquare ? "#090d16" : "#0f172a";
        canvasRenderingContext.fillRect(tileX, tileY, checkerSize, checkerSize);
      }
    }

    // Draw the source sprite image
    canvasRenderingContext.drawImage(imageElement, 0, 0);

    // Render Bounding Box Overlays
    if (sliceSettings.slicingMode === "auto") {
      // Content-Aware Cluster Overlays
      for (const frame of slicedFrames) {
        const originX = frame.originX ?? frame.x;
        const originY = frame.originY ?? frame.y;
        const width = frame.width;
        const height = frame.height;

        if (frame.isExcluded) {
          // Excluded frame: subtle red outline
          canvasRenderingContext.strokeStyle = "rgba(239, 68, 68, 0.5)";
          canvasRenderingContext.lineWidth = 1;
          canvasRenderingContext.strokeRect(originX, originY, width, height);
          continue;
        }

        // Active frame: subtle cyan tint + sharp border
        canvasRenderingContext.fillStyle = "rgba(6, 182, 212, 0.08)";
        canvasRenderingContext.fillRect(originX, originY, width, height);

        canvasRenderingContext.strokeStyle = "rgba(6, 182, 212, 0.85)";
        canvasRenderingContext.lineWidth = 1;
        canvasRenderingContext.strokeRect(originX, originY, width, height);

        // High-tech corner bracket accents
        const cornerLength = Math.max(2, Math.min(6, Math.floor(Math.min(width, height) / 3)));
        canvasRenderingContext.strokeStyle = "#38bdf8";
        canvasRenderingContext.lineWidth = 1.5;
        canvasRenderingContext.beginPath();

        // Top-left
        canvasRenderingContext.moveTo(originX, originY + cornerLength);
        canvasRenderingContext.lineTo(originX, originY);
        canvasRenderingContext.lineTo(originX + cornerLength, originY);

        // Top-right
        canvasRenderingContext.moveTo(originX + width - cornerLength, originY);
        canvasRenderingContext.lineTo(originX + width, originY);
        canvasRenderingContext.lineTo(originX + width, originY + cornerLength);

        // Bottom-left
        canvasRenderingContext.moveTo(originX, originY + height - cornerLength);
        canvasRenderingContext.lineTo(originX, originY + height);
        canvasRenderingContext.lineTo(originX + cornerLength, originY + height);

        // Bottom-right
        canvasRenderingContext.moveTo(originX + width - cornerLength, originY + height);
        canvasRenderingContext.lineTo(originX + width, originY + height);
        canvasRenderingContext.lineTo(originX + width, originY + height - cornerLength);

        canvasRenderingContext.stroke();
      }
    } else {
      // Uniform Grid Mode Overlays
      const { totalRows, totalColumns } = calculateGridDimensions(
        imageWidth,
        imageHeight,
        sliceSettings
      );

      if (totalRows > 0 && totalColumns > 0) {
        const { frameWidth, frameHeight, marginX, marginY, spacingX, spacingY } = sliceSettings;

        canvasRenderingContext.strokeStyle = "rgba(6, 182, 212, 0.85)";
        canvasRenderingContext.lineWidth = Math.max(1, Math.floor(imageWidth / 600));
        canvasRenderingContext.beginPath();

        // Draw vertical column separators
        for (let columnIndex = 0; columnIndex <= totalColumns; columnIndex += 1) {
          let linePositionX = marginX + columnIndex * (frameWidth + spacingX);
          if (columnIndex === totalColumns) {
            linePositionX = marginX + totalColumns * frameWidth + (totalColumns - 1) * spacingX;
          }

          if (linePositionX <= imageWidth) {
            const heightSpan = marginY + totalRows * frameHeight + (totalRows - 1) * spacingY;
            canvasRenderingContext.moveTo(linePositionX, marginY);
            canvasRenderingContext.lineTo(linePositionX, heightSpan);
          }
        }

        // Draw horizontal row separators
        for (let rowIndex = 0; rowIndex <= totalRows; rowIndex += 1) {
          let linePositionY = marginY + rowIndex * (frameHeight + spacingY);
          if (rowIndex === totalRows) {
            linePositionY = marginY + totalRows * frameHeight + (totalRows - 1) * spacingY;
          }

          if (linePositionY <= imageHeight) {
            const widthSpan = marginX + totalColumns * frameWidth + (totalColumns - 1) * spacingX;
            canvasRenderingContext.moveTo(marginX, linePositionY);
            canvasRenderingContext.lineTo(widthSpan, linePositionY);
          }
        }

        canvasRenderingContext.stroke();
      }
    }
  }, [imageElement, imageWidth, imageHeight, sliceSettings, slicedFrames]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-slate-950/80 rounded-xl p-4 border border-slate-800 min-h-110">
      <canvas
        ref={canvasElementRef}
        className="max-h-100 w-auto object-contain shadow-2xl rounded border border-slate-800"
      />
    </div>
  );
};

export default ImageCanvas;

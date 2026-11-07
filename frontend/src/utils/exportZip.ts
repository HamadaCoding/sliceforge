import JSZip from "jszip";
import type { SpriteFrame, SliceSettings } from "../types/sprite";
import { buildFrameFileName, resolveGridSpan } from "./frameName";

/**
 * Packages all included sprite frames into a compressed ZIP archive and triggers
 * an automatic browser file download.
 * 
 * Packaging Features:
 * - Automatically computes maximum row and column counts to format file names
 *   with standardized zero-padding (e.g. `frame_row01_col01.png`).
 * - Excludes any frames deselected by the user while preserving the overall grid span.
 * - Injects a companion `sprites_metadata.json` file providing engine-ready
 *   coordinate positions, pixel bounding boxes, and generator information.
 * 
 * @param spriteFrames - Complete collection of parsed sprite frames.
 * @param sliceSettings - Active slicing settings used for grid calculation.
 * @param baseFileName - Original image file name used to name the output archive.
 */
export async function exportSpritesToZip(
  spriteFrames: SpriteFrame[],
  sliceSettings: SliceSettings,
  baseFileName: string
): Promise<void> {
  const activeFramesForExport = spriteFrames.filter(
    (frame) => !frame.isExcluded && Boolean(frame.dataUrl) && Boolean(frame.blob)
  );

  if (activeFramesForExport.length === 0) {
    throw new Error("No frames selected for export.");
  }

  const zipArchive = new JSZip();
  const sanitizedFolderName = baseFileName.replace(/\.[^/.]+$/, "") || "sprite_sheet";
  const targetArchiveFolder = zipArchive.folder(sanitizedFolderName) ?? zipArchive;

  const { totalRows, totalColumns } = resolveGridSpan(spriteFrames);
  const frameMetadataEntries: Record<string, unknown>[] = [];

  for (const currentFrame of activeFramesForExport) {
    if (!currentFrame.blob) {
      continue;
    }

    const frameRowIndex = currentFrame.rowIndex ?? currentFrame.row;
    const frameColumnIndex = currentFrame.columnIndex ?? currentFrame.col;
    const frameOriginX = currentFrame.originX ?? currentFrame.x;
    const frameOriginY = currentFrame.originY ?? currentFrame.y;

    const formattedFileName = buildFrameFileName(
      frameRowIndex,
      frameColumnIndex,
      totalRows,
      totalColumns
    );

    targetArchiveFolder.file(formattedFileName, currentFrame.blob);

    frameMetadataEntries.push({
      filename: formattedFileName,
      frame: {
        originX: frameOriginX,
        originY: frameOriginY,
        width: currentFrame.width,
        height: currentFrame.height,
      },
      row: frameRowIndex + 1,
      column: frameColumnIndex + 1,
      index: currentFrame.index,
    });
  }

  const archiveMetadata = {
    info: {
      generator: "SliceForge",
      version: "1.0.0",
      totalExportedFrames: frameMetadataEntries.length,
      totalRows,
      totalColumns,
      settings: {
        frameWidth: sliceSettings.frameWidth,
        frameHeight: sliceSettings.frameHeight,
        marginX: sliceSettings.marginX,
        marginY: sliceSettings.marginY,
        spacingX: sliceSettings.spacingX,
        spacingY: sliceSettings.spacingY,
      },
    },
    frames: frameMetadataEntries,
  };

  targetArchiveFolder.file(
    "sprites_metadata.json",
    JSON.stringify(archiveMetadata, null, 2)
  );

  const archiveBlob = await zipArchive.generateAsync({ type: "blob" });
  const temporaryDownloadUrl = URL.createObjectURL(archiveBlob);
  const downloadAnchorElement = document.createElement("a");

  downloadAnchorElement.href = temporaryDownloadUrl;
  downloadAnchorElement.download = `${sanitizedFolderName}_sliced.zip`;
  document.body.appendChild(downloadAnchorElement);
  downloadAnchorElement.click();
  document.body.removeChild(downloadAnchorElement);
  URL.revokeObjectURL(temporaryDownloadUrl);
}

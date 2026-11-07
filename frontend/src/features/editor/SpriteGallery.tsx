import React, { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { exportSpritesToZip } from "../../utils/exportZip";

/**
 * SpriteGallery Component
 * 
 * Displays the sliced frame collection in a scrollable responsive grid.
 * Allows interactive 1-click toggling to include or exclude frames from the final ZIP export.
 */
export const SpriteGallery: React.FC = () => {
  const { 
    frames: slicedSpriteFrames,
    toggleFrameExclusion,
    selectAllFrames,
    deselectAllFrames,
    selectedFrameIds,
    isProcessing,
    settings: sliceSettings,
    fileName: sourceFileName,
  } = useEditorStore();

  const [isExportingArchive, setIsExportingArchive] = useState<boolean>(false);

  /**
   * Triggers the JSZip archive bundling and browser download pipeline.
   */
  const handleExportZipArchive = async (): Promise<void> => {
    setIsExportingArchive(true);
    try {
      await exportSpritesToZip(
        slicedSpriteFrames,
        sliceSettings,
        sourceFileName || "Sprite_Sheet"
      );
    } catch (exportError) {
      console.error("ZIP Export Encountered an Error: ", exportError);
      alert("Failed to export ZIP archive. Please ensure at least one frame is selected.");
    } finally {
      setIsExportingArchive(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3 shadow-xl">
        <div className="inline-block w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-300 font-medium">Extracting sprite frames with pixel precision...</p>
      </div>
    );
  }

  if (slicedSpriteFrames.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-200">🖼️ Sliced Frame Gallery</h3>
          <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800">
            {selectedFrameIds.size} / {slicedSpriteFrames.length} Exportable
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAllFrames}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAllFrames}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
          >
            Deselect All
          </button>
          <button
            type="button"
            onClick={() => void handleExportZipArchive()}
            disabled={isExportingArchive || selectedFrameIds.size === 0}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isExportingArchive ? "Bundling ZIP..." : "📦 Download Padded ZIP"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[340px] overflow-y-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {slicedSpriteFrames.map((spriteFrame) => {
          const displayRowNumber = (spriteFrame.rowIndex ?? spriteFrame.row) + 1;
          const displayColumnNumber = (spriteFrame.columnIndex ?? spriteFrame.col) + 1;

          return (
            <div
              key={spriteFrame.id}
              onClick={() => toggleFrameExclusion(spriteFrame.id)}
              className={`group relative aspect-square bg-slate-900 border rounded-xl p-2 flex items-center justify-center cursor-pointer transition-all select-none ${
                spriteFrame.isExcluded
                  ? "border-red-500/40 opacity-40 bg-red-950/10"
                  : "border-slate-800 hover:border-cyan-500 hover:bg-slate-800/50 shadow-md"
              }`}
              title={`Frame #${spriteFrame.index + 1} (Row ${displayRowNumber}, Col ${displayColumnNumber}) - Click to ${
                spriteFrame.isExcluded ? "Include in ZIP" : "Exclude from ZIP"
              }`}
            >
              {spriteFrame.dataUrl ? (
                <img
                  src={spriteFrame.dataUrl}
                  alt={`Frame ${spriteFrame.index}`}
                  className="max-w-full max-h-full object-contain image-pixelated"
                />
              ) : (
                <span className="text-[10px] text-slate-500">Loading</span>
              )}

              <div className="absolute top-1 right-1 text-[10px]">
                {spriteFrame.isExcluded ? (
                  <span className="bg-red-500/80 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    ×
                  </span>
                ) : (
                  <span className="bg-emerald-500/80 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px]">
                    ✓
                  </span>
                )}
              </div>

              <span className="absolute bottom-1 left-1.5 text-[9px] text-slate-400 font-mono">
                #{spriteFrame.index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
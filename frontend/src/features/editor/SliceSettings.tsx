import React, { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { NumberStepper } from "../../components/ui/NumberStepper";

/**
 * SliceSettingsPanel Component
 * 
 * Provides dual slicing strategies:
 * 1. Content-Aware Alpha Detection: automatically computes bounding boxes from visible pixels with zero manual margins.
 * 2. Uniform Grid: manual layout controls with custom dark-themed number steppers.
 */
export const SliceSettingsPanel: React.FC = () => {
  const {
    settings: sliceSettings,
    updateSettings,
    setSlicingMode,
    fileName,
    imageWidth,
    imageHeight,
    frames: slicedFrames,
  } = useEditorStore();

  const [targetColumnCount, setTargetColumnCount] = useState<number>(4);
  const [targetRowCount, setTargetRowCount] = useState<number>(4);

  /**
   * Recalculates frame width and height based on user-entered columns and rows in Grid mode.
   */
  const handleAutoGridCalculation = (columnCount: number, rowCount: number): void => {
    if (columnCount <= 0 || rowCount <= 0 || imageWidth <= 0 || imageHeight <= 0) {
      return;
    }

    const availablePixelWidth = imageWidth - sliceSettings.marginX;
    const availablePixelHeight = imageHeight - sliceSettings.marginY;

    const calculatedFrameWidth = Math.floor(
      (availablePixelWidth - (columnCount - 1) * sliceSettings.spacingX) / columnCount
    );
    const calculatedFrameHeight = Math.floor(
      (availablePixelHeight - (rowCount - 1) * sliceSettings.spacingY) / rowCount
    );

    updateSettings({
      frameWidth: Math.max(1, calculatedFrameWidth),
      frameHeight: Math.max(1, calculatedFrameHeight),
    });
  };

  /**
   * Applies common standard game engine tile dimensions (16x16, 32x32, 64x64).
   */
  const handleApplyPresetDimension = (squarePixelSize: number): void => {
    updateSettings({
      frameWidth: squarePixelSize,
      frameHeight: squarePixelSize,
      marginX: 0,
      marginY: 0,
      spacingX: 0,
      spacingY: 0,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-5">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          ⚡ Slicing Parameters
        </h2>
        <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
          {sliceSettings.slicingMode === "auto" ? "Alpha Detection" : "Uniform Grid"}
        </span>
      </div>

      {/* Slicing Strategy Mode Toggle */}
      <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 grid grid-cols-2 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSlicingMode("auto")}
          className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            sliceSettings.slicingMode === "auto"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <span>✨ Auto-Detect</span>
        </button>
        <button
          type="button"
          onClick={() => setSlicingMode("grid")}
          className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            sliceSettings.slicingMode === "grid"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <span>📐 Uniform Grid</span>
        </button>
      </div>

      {/* Mode 1: Content-Aware Alpha Detection (Zero-Margin/Zero-Spacing) */}
      {sliceSettings.slicingMode === "auto" ? (
        <div className="space-y-4">
          <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">
                ✨ Content-Aware Alpha Scanning
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                {slicedFrames.length} Clusters Found
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every visible sprite cluster is isolated automatically by scanning pixel alpha channels.
              No manual margins or spacing math required!
            </p>
          </div>

          <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Alpha Transparency Cutoff:</span>
                <span className="font-mono text-cyan-400">{sliceSettings.alphaThreshold} / 255</span>
              </div>
              <input
                type="range"
                min={1}
                max={128}
                value={sliceSettings.alphaThreshold}
                onChange={(changeEvent) =>
                  updateSettings({ alphaThreshold: Number(changeEvent.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Pixels with alpha ≤ {sliceSettings.alphaThreshold} are considered transparent.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Cluster Merge Gap:</span>
                <span className="font-mono text-cyan-400">{sliceSettings.mergeGap} px</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                value={sliceSettings.mergeGap}
                onChange={(changeEvent) =>
                  updateSettings({ mergeGap: Number(changeEvent.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Merges detached accessories or particle effects within {sliceSettings.mergeGap}px.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Uniform Grid Mode */
        <div className="space-y-4">
          {/* Auto-Fit by Grid Layout Assistant */}
          <div className="bg-cyan-950/20 border border-cyan-800/40 p-3.5 rounded-xl space-y-3">
            <label className="text-xs font-semibold text-cyan-300 block">
              ✨ Auto-Fit by Layout Count
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <NumberStepper
                label="Columns Count"
                value={targetColumnCount}
                min={1}
                max={64}
                unit="cols"
                onChange={(nextCols) => {
                  setTargetColumnCount(nextCols);
                  handleAutoGridCalculation(nextCols, targetRowCount);
                }}
              />
              <NumberStepper
                label="Rows Count"
                value={targetRowCount}
                min={1}
                max={64}
                unit="rows"
                onChange={(nextRows) => {
                  setTargetRowCount(nextRows);
                  handleAutoGridCalculation(targetColumnCount, nextRows);
                }}
              />
            </div>
          </div>

          {/* Quick Standard Presets */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Quick Tile Presets:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[16, 24, 32, 64].map((pixelDimension) => (
                <button
                  key={pixelDimension}
                  type="button"
                  onClick={() => handleApplyPresetDimension(pixelDimension)}
                  className="px-2 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {pixelDimension}px
                </button>
              ))}
            </div>
          </div>

          {/* Precise Pixel Dimensions */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-medium text-slate-300 block">
              Custom Frame Dimensions
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              <NumberStepper
                label="Frame Width"
                value={sliceSettings.frameWidth}
                min={1}
                max={imageWidth || 4096}
                unit="px"
                onChange={(nextWidth) => updateSettings({ frameWidth: nextWidth })}
              />
              <NumberStepper
                label="Frame Height"
                value={sliceSettings.frameHeight}
                min={1}
                max={imageHeight || 4096}
                unit="px"
                onChange={(nextHeight) => updateSettings({ frameHeight: nextHeight })}
              />
            </div>

            {/* Margins & Spacings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Margin (X / Y)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <NumberStepper
                    value={sliceSettings.marginX}
                    min={0}
                    max={imageWidth}
                    unit="X"
                    onChange={(nextMarginX) => updateSettings({ marginX: nextMarginX })}
                  />
                  <NumberStepper
                    value={sliceSettings.marginY}
                    min={0}
                    max={imageHeight}
                    unit="Y"
                    onChange={(nextMarginY) => updateSettings({ marginY: nextMarginY })}
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Spacing (X / Y)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <NumberStepper
                    value={sliceSettings.spacingX}
                    min={0}
                    max={imageWidth}
                    unit="X"
                    onChange={(nextSpacingX) => updateSettings({ spacingX: nextSpacingX })}
                  />
                  <NumberStepper
                    value={sliceSettings.spacingY}
                    min={0}
                    max={imageHeight}
                    unit="Y"
                    onChange={(nextSpacingY) => updateSettings({ spacingY: nextSpacingY })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slicing Summary Telemetry */}
      <div className="text-xs space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/70">
        <p className="text-slate-400 truncate">
          Active Sheet: <span className="text-cyan-400 font-medium">{fileName || "None"}</span>
        </p>
        <p className="text-slate-400">
          Resolution: <span className="text-cyan-400 font-medium">{imageWidth} × {imageHeight} px</span>
        </p>
        <p className="text-slate-400">
          Sliced Frames: <span className="text-cyan-300 font-bold">{slicedFrames.length}</span>
        </p>
      </div>
    </div>
  );
};

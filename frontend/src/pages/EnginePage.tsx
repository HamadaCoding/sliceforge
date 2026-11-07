import React from "react";
import { useEditorStore } from "../store/editorStore";
import { ImageUploader } from "../features/editor/ImageUploader";
import { SliceSettingsPanel } from "../features/editor/SliceSettings";
import { ImageCanvas } from "../features/editor/ImageCanvas";
import { SpriteGallery } from "../features/editor/SpriteGallery";

/**
 * EnginePage Component
 * 
 * The primary tool workspace for SliceForge, containing the image dropzone,
 * real-time HTML5 grid overlay canvas, parameter control panel, and thumbnail gallery.
 */
export const EnginePage: React.FC = () => {
  const { imageSrc, clearImage, fileName, imageWidth, imageHeight, frames } = useEditorStore();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 page-enter">
      {/* Workspace Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white flex items-center gap-2">
              ⚡ Slicing Engine Workspace
            </h1>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800 font-mono">
              Live Canvas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {imageSrc
              ? `Loaded: ${fileName} (${imageWidth}×${imageHeight}px) • ${frames.length} frames detected`
              : "Upload a sprite texture atlas below to begin slicing."}
          </p>
        </div>

        {imageSrc && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearImage}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              Upload Another Image
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      {!imageSrc ? (
        <div className="max-w-2xl mx-auto py-12">
          <ImageUploader />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls: Slicing Parameters */}
            <div className="lg:col-span-4 lg:sticky lg:top-20 self-stretch">
              <SliceSettingsPanel />
            </div>

            {/* Right Display: Interactive Overlay Canvas */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl">
              <div className="w-full flex justify-between items-center">
                <span className="text-xs bg-slate-950 text-slate-300 px-3 py-1 rounded-lg border border-slate-800 font-mono">
                  Interactive Grid Canvas Overlay
                </span>
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/25 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Grid Engine
                </span>
              </div>

              <div className="w-full overflow-auto max-h-[500px] flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
                <ImageCanvas />
              </div>

              <div className="w-full text-center text-xs text-slate-400">
                Tip: Use the Auto-Fit Assistant on the left or fine-tune pixel dimensions to align the cyan lines.
              </div>
            </div>
          </div>

          {/* Sliced Thumbnails and Zero-Padded ZIP Export */}
          <SpriteGallery />
        </div>
      )}
    </div>
  );
};

export default EnginePage;

import React, { useRef } from "react";
import { useEditorStore } from "../../store/editorStore";

/**
 * ImageUploader Component
 * 
 * Provides an interactive drag-and-drop dropzone, a hidden file input, and
 * a built-in sample generator allowing instant testing of the slicing engine.
 */
export const ImageUploader: React.FC = () => {
  const setImage = useEditorStore((state) => state.setImage);
  const fileInputElementRef = useRef<HTMLInputElement>(null);

  /**
   * Reads a chosen image file, converts it to a data URL, and loads it into an HTMLImageElement.
   */
  const handleSelectedFile = (selectedFile: File): void => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (fileReaderProgressEvent: ProgressEvent<FileReader>) => {
      const dataUrlString = fileReaderProgressEvent.target?.result as string;
      const loadedImageElement = new Image();
      loadedImageElement.onload = () => {
        void setImage(dataUrlString, loadedImageElement, selectedFile.name);
      };
      loadedImageElement.src = dataUrlString;
    };
    fileReader.readAsDataURL(selectedFile);
  };

  /**
   * Handles dropping an image file over the dropzone container.
   */
  const handleDropEvent = (dragDropEvent: React.DragEvent<HTMLDivElement>): void => {
    dragDropEvent.preventDefault();
    if (dragDropEvent.dataTransfer.files && dragDropEvent.dataTransfer.files[0]) {
      handleSelectedFile(dragDropEvent.dataTransfer.files[0]);
    }
  };

  /**
   * Handles standard file input change events.
   */
  const handleFileInputChange = (changeEvent: React.ChangeEvent<HTMLInputElement>): void => {
    if (changeEvent.target.files && changeEvent.target.files[0]) {
      handleSelectedFile(changeEvent.target.files[0]);
    }
  };

  /**
   * Generates a sample pixel-art character sprite sheet directly via canvas
   * for instant one-click testing without requiring file uploads.
   */
  const handleLoadDemoSpriteSheet = (): void => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 128;
    demoCanvas.height = 128;
    const demoContext = demoCanvas.getContext("2d");
    if (!demoContext) {
      return;
    }

    // Paint a checkerboard retro sprite grid
    const colors = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b"];
    for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < 4; columnIndex += 1) {
        const originX = columnIndex * 32;
        const originY = rowIndex * 32;
        demoContext.fillStyle = colors[(rowIndex + columnIndex) % colors.length];
        demoContext.fillRect(originX + 4, originY + 4, 24, 24);

        // Add inner pixel accent
        demoContext.fillStyle = "#ffffff";
        demoContext.fillRect(originX + 10, originY + 10, 12, 12);
        demoContext.fillStyle = "#0f172a";
        demoContext.fillRect(originX + 13, originY + 13, 6, 6);
      }
    }

    const demoDataUrl = demoCanvas.toDataURL("image/png");
    const demoImage = new Image();
    demoImage.onload = () => {
      void setImage(demoDataUrl, demoImage, "sample_character_run_4x4.png");
    };
    demoImage.src = demoDataUrl;
  };

  return (
    <div
      onDragOver={(dragOverEvent) => dragOverEvent.preventDefault()}
      onDrop={handleDropEvent}
      onClick={() => fileInputElementRef.current?.click()}
      className="border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/50 rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-5 group shadow-2xl backdrop-blur-sm"
    >
      <input
        type="file"
        ref={fileInputElementRef}
        onChange={handleFileInputChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform text-3xl shadow-lg shadow-cyan-500/10">
        ⚡
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100 tracking-wide">
          Drop Sprite Sheet Here
        </h3>
        <p className="text-sm text-slate-400">
          Supports PNG, JPG, and WebP (Up to 25MB with transparent alphas)
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <button
          type="button"
          onClick={() => fileInputElementRef.current?.click()}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-600/30 transition-all hover:scale-102 cursor-pointer"
        >
          Browse Local File
        </button>
        <button
          type="button"
          onClick={handleLoadDemoSpriteSheet}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-sm font-medium rounded-xl border border-slate-700 transition-all hover:border-cyan-500/50 cursor-pointer"
        >
          Load 4x4 Sample Sheet
        </button>
      </div>
    </div>
  );
};
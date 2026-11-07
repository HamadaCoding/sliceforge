import { create } from "zustand";
import type { SliceSettings, SpriteFrame, SlicingMode, FramePosition } from "../types/sprite";
import { generateFramePositions, normalizeSliceSettings } from "../engine/gridCalculator";
import { detectSpriteClusters } from "../engine/alphaScanner";
import { sliceImageFrame } from "../engine/sliceImage";

/**
 * State and mutation actions for the SliceForge workspace editor.
 */
interface EditorState {
  imageSrc: string | null;
  imageElement: HTMLImageElement | null;
  imageWidth: number;
  imageHeight: number;
  fileName: string;
  settings: SliceSettings;
  frames: SpriteFrame[];
  selectedFrameIds: Set<string>;
  isProcessing: boolean;

  setImage: (sourceUrlString: string, loadedImageElement: HTMLImageElement, sourceFileName: string) => Promise<void>;
  updateSettings: (nextSettings: Partial<SliceSettings>) => void;
  setSlicingMode: (nextMode: SlicingMode) => void;
  toggleFrameExclusion: (targetFrameId: string) => void;
  selectAllFrames: () => void;
  deselectAllFrames: () => void;
  clearImage: () => void;
}

const defaultSliceSettings: SliceSettings = {
  slicingMode: "auto",
  frameWidth: 32,
  frameHeight: 32,
  marginX: 0,
  marginY: 0,
  spacingX: 0,
  spacingY: 0,
  alphaThreshold: 15,
  mergeGap: 3,
};

let sliceDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeSliceGeneration = 0;

/**
 * Revokes transient Blob object URLs to avoid memory leaks when re-slicing.
 */
function releaseFramePreviewUrls(spriteFrames: SpriteFrame[]): void {
  for (const spriteFrame of spriteFrames) {
    if (spriteFrame.dataUrl) {
      URL.revokeObjectURL(spriteFrame.dataUrl);
    }
  }
}

export const useEditorStore = create<EditorState>((setStoreState, getStoreState) => {
  /**
   * Slices the active sprite sheet for a specific generation.
   * If a newer slice request was scheduled while processing, cancels old frames to prevent race conditions.
   */
  const sliceLoadedSheet = async (sliceGenerationNumber: number): Promise<void> => {
    const { imageElement, imageWidth, imageHeight, settings, frames } = getStoreState();
    if (!imageElement || imageWidth <= 0 || imageHeight <= 0) {
      setStoreState({ isProcessing: false });
      return;
    }

    let candidateFramePositions: FramePosition[];

    if (settings.slicingMode === "auto") {
      // Content-Aware Alpha Scanning Engine (zero margins, zero spacing)
      const detectedClusters = detectSpriteClusters(imageElement, {
        alphaThreshold: settings.alphaThreshold,
        mergeGap: settings.mergeGap,
      });

      // If no clusters detected (e.g., solid background without transparency), fall back to grid
      candidateFramePositions = detectedClusters.length > 0
        ? detectedClusters
        : generateFramePositions(imageWidth, imageHeight, settings);
    } else {
      // Uniform Grid Mode
      candidateFramePositions = generateFramePositions(imageWidth, imageHeight, settings);
    }

    const validPositions = candidateFramePositions.filter((framePosition) => framePosition.isValid);
    const slicedSpriteFrames: SpriteFrame[] = [];

    for (const framePosition of validPositions) {
      if (sliceGenerationNumber !== activeSliceGeneration) {
        releaseFramePreviewUrls(slicedSpriteFrames);
        return;
      }

      try {
        const slicedFrame = await sliceImageFrame(imageElement, framePosition);
        slicedSpriteFrames.push(slicedFrame);
      } catch (sliceError) {
        console.error(`Failed to slice frame ${framePosition.id}`, sliceError);
      }
    }

    if (sliceGenerationNumber !== activeSliceGeneration) {
      releaseFramePreviewUrls(slicedSpriteFrames);
      return;
    }

    releaseFramePreviewUrls(frames);
    setStoreState({
      frames: slicedSpriteFrames,
      selectedFrameIds: new Set(slicedSpriteFrames.map((frame) => frame.id)),
      isProcessing: false,
    });
  };

  /**
   * Debounces slicing calculations when users rapidly adjust dimension sliders or inputs.
   */
  const scheduleDebouncedSlice = (): void => {
    if (sliceDebounceTimer) {
      clearTimeout(sliceDebounceTimer);
    }

    activeSliceGeneration += 1;
    const currentGeneration = activeSliceGeneration;
    setStoreState({ isProcessing: true });

    sliceDebounceTimer = setTimeout(() => {
      void sliceLoadedSheet(currentGeneration);
    }, 200);
  };

  return {
    imageSrc: null,
    imageElement: null,
    imageWidth: 0,
    imageHeight: 0,
    fileName: "",
    settings: defaultSliceSettings,
    frames: [],
    selectedFrameIds: new Set(),
    isProcessing: false,

    setImage: async (sourceUrlString, loadedImageElement, sourceFileName) => {
      const normalizedSettings = normalizeSliceSettings(getStoreState().settings);
      releaseFramePreviewUrls(getStoreState().frames);

      setStoreState({
        imageSrc: sourceUrlString,
        imageElement: loadedImageElement,
        imageWidth: loadedImageElement.naturalWidth,
        imageHeight: loadedImageElement.naturalHeight,
        fileName: sourceFileName,
        settings: normalizedSettings,
        frames: [],
        selectedFrameIds: new Set(),
      });

      if (sliceDebounceTimer) {
        clearTimeout(sliceDebounceTimer);
      }

      activeSliceGeneration += 1;
      const currentGeneration = activeSliceGeneration;
      setStoreState({ isProcessing: true });
      await sliceLoadedSheet(currentGeneration);
    },

    updateSettings: (nextSettings) => {
      const normalizedSettings = normalizeSliceSettings({ ...getStoreState().settings, ...nextSettings });
      setStoreState({ settings: normalizedSettings });

      const { imageElement, imageWidth, imageHeight } = getStoreState();
      if (!imageElement || imageWidth <= 0 || imageHeight <= 0) {
        return;
      }

      scheduleDebouncedSlice();
    },

    setSlicingMode: (nextMode: SlicingMode) => {
      const normalizedSettings = normalizeSliceSettings({ ...getStoreState().settings, slicingMode: nextMode });
      setStoreState({ settings: normalizedSettings });

      const { imageElement, imageWidth, imageHeight } = getStoreState();
      if (!imageElement || imageWidth <= 0 || imageHeight <= 0) {
        return;
      }

      scheduleDebouncedSlice();
    },

    toggleFrameExclusion: (targetFrameId) => {
      const updatedSelectedFrameIds = new Set(getStoreState().selectedFrameIds);

      if (updatedSelectedFrameIds.has(targetFrameId)) {
        updatedSelectedFrameIds.delete(targetFrameId);
      } else {
        updatedSelectedFrameIds.add(targetFrameId);
      }

      setStoreState({
        frames: getStoreState().frames.map((frame) =>
          frame.id === targetFrameId ? { ...frame, isExcluded: !frame.isExcluded } : frame
        ),
        selectedFrameIds: updatedSelectedFrameIds,
      });
    },

    selectAllFrames: () => {
      setStoreState({
        frames: getStoreState().frames.map((frame) => ({ ...frame, isExcluded: false })),
        selectedFrameIds: new Set(getStoreState().frames.map((frame) => frame.id)),
      });
    },

    deselectAllFrames: () => {
      setStoreState({
        frames: getStoreState().frames.map((frame) => ({ ...frame, isExcluded: true })),
        selectedFrameIds: new Set(),
      });
    },

    clearImage: () => {
      if (sliceDebounceTimer) {
        clearTimeout(sliceDebounceTimer);
      }
      activeSliceGeneration += 1;
      releaseFramePreviewUrls(getStoreState().frames);
      setStoreState({
        imageSrc: null,
        imageElement: null,
        imageWidth: 0,
        imageHeight: 0,
        fileName: "",
        frames: [],
        selectedFrameIds: new Set(),
        isProcessing: false,
      });
    },
  };
});

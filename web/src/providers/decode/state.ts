import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DecodeDefaultArgs, maxContrast, minContrast } from '../../constants/default-arg';
import type { PrismImage } from '../../models/image';
import type { ImageEncodeFormat } from '../../services/image-encoder';

export type PrismDecodeMethod = 'black' | 'white' | 'transparent' | 'lcopy' | 'tcopy' | 'ltavg';

type PrismDecodeState = {
  doReadMetadata: boolean;
  lowerThreshold: number;
  higherThreshold: number;
  method: PrismDecodeMethod;
  contrast: number;
  saveFormat: ImageEncodeFormat;
  iterations: number;
  setDoReadMetadata: (value: boolean) => void;
  setLowerThreshold: (value: number) => void;
  setHigherThreshold: (value: number) => void;
  setMethod: (value: PrismDecodeMethod) => void;
  setContrast: (value: number) => void;
  setSaveFormat: (value: ImageEncodeFormat) => void;
  setIterations: (value: number) => void;
};

export const usePrismDecodeStore = create<PrismDecodeState>()(
  subscribeWithSelector((set) => ({
    doReadMetadata: DecodeDefaultArgs.doReadMetadata,
    lowerThreshold: DecodeDefaultArgs.lowerThreshold,
    higherThreshold: DecodeDefaultArgs.higherThreshold,
    method: DecodeDefaultArgs.method as PrismDecodeMethod,
    contrast: DecodeDefaultArgs.contrast,
    saveFormat: DecodeDefaultArgs.saveFormat,
    iterations: DecodeDefaultArgs.iterations,
    setDoReadMetadata: (value: boolean) => {
      set({ doReadMetadata: value });
    },
    setLowerThreshold: (value: number) => {
      set((state) => {
        if (value < 0 || value > state.higherThreshold) return {};
        return { lowerThreshold: value };
      });
    },
    setHigherThreshold: (value: number) => {
      set((state) => {
        if (value < state.lowerThreshold || value > 255) return {};
        return { higherThreshold: value };
      });
    },
    setMethod: (value: PrismDecodeMethod) => {
      set({ method: value });
    },
    setContrast: (value: number) => {
      if (value < minContrast || value > maxContrast) return;
      set({ contrast: value });
    },
    setSaveFormat: (value: ImageEncodeFormat) => {
      set({ saveFormat: value });
    },
    setIterations: (value: number) => {
      if (value < 0 || value > DecodeDefaultArgs.maxIterations) return;
      set({ iterations: value });
    },
  }))
);

type PrismDecodeImage = {
  image: PrismImage;
  index: number;
};

type PrismDecodeImagesState = {
  images: PrismDecodeImage[];
  currImage: PrismDecodeImage | null;
  setCurrIndex: (index: number) => void;
  setImages: (images: PrismImage[]) => void;
};

export const usePrismDecodeImagesStore = create<PrismDecodeImagesState>()(
  subscribeWithSelector((set) => ({
    images: [],
    currImage: null,
    setCurrIndex: (index: number) => {
      set((state) => {
        if (index < 0 || index >= state.images.length) {
          return { currImage: null };
        }
        return { currImage: state.images[index] };
      });
    },
    setImages: (images: PrismImage[]) => {
      const decodeImages = images.map((image, index) => ({
        image,
        index,
      }));
      set({ images: decodeImages, currImage: decodeImages.length > 0 ? decodeImages[0] : null });
    },
  }))
);

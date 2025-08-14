import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { decodeDefaultArgs } from '../../constants/default-arg';
import type { PrismImage } from '../../models/image';
import type { ImageEncodeFormat } from '../../services/image-encoder';

export type PrismDecodeMethod = 'black' | 'white' | 'transparent' | 'lcopy' | 'tcopy' | 'ltavg';

interface PrismDecodeState {
  doReadMetadata: boolean;
  lowerThreshold: number;
  higherThreshold: number;
  method: PrismDecodeMethod;
  contrast: number;
  saveFormat: ImageEncodeFormat;
  setDoReadMetadata: (value: boolean) => void;
  setLowerThreshold: (value: number) => void;
  setHigherThreshold: (value: number) => void;
  setMethod: (value: PrismDecodeMethod) => void;
  setContrast: (value: number) => void;
  setSaveFormat: (value: ImageEncodeFormat) => void;
}

export const usePrismDecodeStore = create<PrismDecodeState>()(
  subscribeWithSelector((set) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    doReadMetadata: decodeDefaultArgs.doReadMetadata,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    lowerThreshold: decodeDefaultArgs.lowerThreshold,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    higherThreshold: decodeDefaultArgs.higherThreshold,
    method: decodeDefaultArgs.method as PrismDecodeMethod,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    contrast: decodeDefaultArgs.contrast,
    saveFormat: decodeDefaultArgs.saveFormat as ImageEncodeFormat,
    setDoReadMetadata: (value: boolean) => {
      set({ doReadMetadata: value });
    },
    setLowerThreshold: (value: number) => {
      set({ lowerThreshold: value });
    },
    setHigherThreshold: (value: number) => {
      set({ higherThreshold: value });
    },
    setMethod: (value: PrismDecodeMethod) => {
      set({ method: value });
    },
    setContrast: (value: number) => {
      set({ contrast: value });
    },
    setSaveFormat: (value: ImageEncodeFormat) => {
      set({ saveFormat: value });
    },
  }))
);

type PrismDecodeImage = {
  image: PrismImage;
  index: number;
};

interface PrismDecodeImagesState {
  images: PrismDecodeImage[];
  currImage: PrismDecodeImage | null;
  setCurrIndex: (index: number) => void;
  setImages: (images: PrismImage[]) => void;
}

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

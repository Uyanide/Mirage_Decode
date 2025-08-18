import { create } from 'zustand';
import type { ImageEncodeFormat } from '../../services/image-encoder';
import { subscribeWithSelector } from 'zustand/middleware';
import { encodeDefaultArgs } from '../../constants/default-arg';
import type { PrismImage } from '../../models/image';
import { prismEncodeCanvas } from './canvas';

type PrismEncodeBlendMode = {
  slope: number;
  gap: number;
  isRow: boolean;
};

interface PrismEncodeState {
  innerThreshold: number;
  coverThreshold: number;
  innerContrast: number;
  coverContrast: number;
  isInnerGray: boolean;
  isCoverGray: boolean;
  isReverse: boolean;
  saveFormat: ImageEncodeFormat;
  maxSize: number;
  blendMode: PrismEncodeBlendMode;
  setInnerThreshold: (value: number) => void;
  setCoverThreshold: (value: number) => void;
  setInnerContrast: (value: number) => void;
  setCoverContrast: (value: number) => void;
  setIsInnerGray: (value: boolean) => void;
  setIsCoverGray: (value: boolean) => void;
  setIsReverse: (value: boolean) => void;
  setSaveFormat: (value: ImageEncodeFormat) => void;
  setMaxSize: (value: number) => void;
  setBlendMode: (slope: number, gap: number, isRow: boolean) => void;
}

export const usePrismEncodeStore = create<PrismEncodeState>()(
  subscribeWithSelector((set) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    innerThreshold: encodeDefaultArgs.innerThreshold,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    coverThreshold: encodeDefaultArgs.coverThreshold,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    innerContrast: encodeDefaultArgs.innerContrast,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    coverContrast: encodeDefaultArgs.coverContrast,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    isInnerGray: encodeDefaultArgs.isInnerGray,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    isCoverGray: encodeDefaultArgs.isCoverGray,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    isReverse: encodeDefaultArgs.isReverse,
    saveFormat: encodeDefaultArgs.saveFormat as ImageEncodeFormat,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    maxSize: encodeDefaultArgs.maxSize,
    blendMode: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      slope: encodeDefaultArgs.blendMode.slope,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      gap: encodeDefaultArgs.blendMode.gap,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      isRow: encodeDefaultArgs.blendMode.isRow,
    },
    setInnerThreshold: (value: number) => {
      set((state) => {
        if (value > state.coverThreshold) return {};
        return { innerThreshold: value };
      });
    },
    setCoverThreshold: (value: number) => {
      set((state) => {
        if (value < state.innerThreshold) return {};
        return { coverThreshold: value };
      });
    },
    setInnerContrast: (value: number) => {
      set({ innerContrast: value });
    },
    setCoverContrast: (value: number) => {
      set({ coverContrast: value });
    },
    setIsInnerGray: (value: boolean) => {
      set({ isInnerGray: value });
    },
    setIsCoverGray: (value: boolean) => {
      set({ isCoverGray: value });
    },
    setIsReverse: (value: boolean) => {
      set({ isReverse: value });
    },
    setSaveFormat: (value: ImageEncodeFormat) => {
      set({ saveFormat: value });
    },
    setMaxSize: (value: number) => {
      set({ maxSize: value });
    },
    setBlendMode: (slope: number, gap: number, isRow: boolean) => {
      set({ blendMode: { slope, gap, isRow } });
    },
  }))
);

export interface PrismEncodeImageState {
  innerImage: PrismImage | null;
  coverImage: PrismImage | null;
  haveResult: boolean;
  setInnerImage: (image: PrismImage | null) => void;
  setCoverImage: (image: PrismImage | null) => void;
  setHaveResult: (value: boolean) => void;
}

export const usePrismEncodeImageStore = create<PrismEncodeImageState>()(
  subscribeWithSelector((set) => ({
    innerImage: null,
    coverImage: null,
    haveResult: false,
    setInnerImage: (image: PrismImage | null) => {
      if (image) prismEncodeCanvas.setInnerImage(image);
      set({ innerImage: image });
    },
    setCoverImage: (image: PrismImage | null) => {
      if (image) prismEncodeCanvas.setCoverImage(image);
      set({ coverImage: image });
    },
    setHaveResult: (value: boolean) => {
      set({ haveResult: value });
    },
  }))
);

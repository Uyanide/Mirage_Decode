import { create } from 'zustand';
import type { ImageEncodeFormat } from '../../services/image-encoder';
import { subscribeWithSelector } from 'zustand/middleware';
import { EncodeDefaultArgs, maxContrast, minContrast } from '../../constants/default-arg';
import type { PrismImage } from '../../models/image';
import { prismEncodeCanvas } from './canvas';

type PrismEncodeBlendMode = {
  slope: number;
  gap: number;
  isRow: boolean;
};

type PrismEncodeStore = {
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
};

export const usePrismEncodeStore = create<PrismEncodeStore>()(
  subscribeWithSelector((set) => ({
    innerThreshold: EncodeDefaultArgs.innerThreshold,
    coverThreshold: EncodeDefaultArgs.coverThreshold,
    innerContrast: EncodeDefaultArgs.innerContrast,
    coverContrast: EncodeDefaultArgs.coverContrast,
    isInnerGray: EncodeDefaultArgs.isInnerGray,
    isCoverGray: EncodeDefaultArgs.isCoverGray,
    isReverse: EncodeDefaultArgs.isReverse,
    saveFormat: EncodeDefaultArgs.saveFormat,
    maxSize: EncodeDefaultArgs.maxSize,
    blendMode: {
      slope: EncodeDefaultArgs.blendMode.slope,
      gap: EncodeDefaultArgs.blendMode.gap,
      isRow: EncodeDefaultArgs.blendMode.isRow,
    },
    setInnerThreshold: (value: number) => {
      set((state) => {
        if (value > state.coverThreshold || value < 0) return {};
        return { innerThreshold: value };
      });
    },
    setCoverThreshold: (value: number) => {
      set((state) => {
        if (value < state.innerThreshold || value > 255) return {};
        return { coverThreshold: value };
      });
    },
    setInnerContrast: (value: number) => {
      if (value < minContrast || value > maxContrast) return;
      set({ innerContrast: value });
    },
    setCoverContrast: (value: number) => {
      if (value < minContrast || value > maxContrast) return;
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
      if (value < EncodeDefaultArgs.minMaxSize || value > EncodeDefaultArgs.maxMaxSize) return;
      set({ maxSize: value });
    },
    setBlendMode: (slope: number, gap: number, isRow: boolean) => {
      set({ blendMode: { slope, gap, isRow } });
    },
  }))
);

export type PrismEncodeImageStore = {
  innerImage: PrismImage | null;
  coverImage: PrismImage | null;
  haveResult: boolean;
  setInnerImage: (image: PrismImage | null) => void;
  setCoverImage: (image: PrismImage | null) => void;
  setHaveResult: (value: boolean) => void;
};

export const usePrismEncodeImageStore = create<PrismEncodeImageStore>()(
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

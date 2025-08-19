import type { ImageEncodeFormat } from '../services/image-encoder';

export const maxListSize: number = 20;

export const minContrast = -255;
export const maxContrast = 255;

type DecodeDefaultArgsType = {
  doReadMetadata: boolean;
  lowerThreshold: number;
  higherThreshold: number;
  thresholdStep: number;
  method: string;
  contrast: number;
  contrastStep: number;
  saveFormat: ImageEncodeFormat;
};

export const DecodeDefaultArgs: DecodeDefaultArgsType = {
  doReadMetadata: true,
  lowerThreshold: 0,
  higherThreshold: 24,
  thresholdStep: 1,
  method: 'ltavg',
  contrast: 0,
  contrastStep: 5,
  saveFormat: 'PNG',
};

type EncodeDefaultArgsType = {
  innerThreshold: number;
  coverThreshold: number;
  thresholdStep: number;
  innerContrast: number;
  coverContrast: number;
  contrastStep: number;
  isInnerGray: boolean;
  isCoverGray: boolean;
  isReverse: boolean;
  saveFormat: ImageEncodeFormat;
  maxSize: number;
  blendMode: {
    slope: number;
    gap: number;
    isRow: boolean;
  };
  maxMaxSize: number;
  minMaxSize: number;
};

export const EncodeDefaultArgs: EncodeDefaultArgsType = {
  innerThreshold: 24,
  coverThreshold: 42,
  thresholdStep: 1,
  innerContrast: 0,
  coverContrast: 0,
  contrastStep: 5,
  isInnerGray: false,
  isCoverGray: true,
  isReverse: false,
  saveFormat: 'JPEG',
  maxSize: 1200,
  blendMode: {
    slope: 1,
    gap: 1,
    isRow: true,
  },
  maxMaxSize: 10000,
  minMaxSize: 10,
};

export const corsProxyUrl: string = 'https://api.uyanide.com/proxy?url=';

type AdvancedEncodeDefaultArgsType = {
  width: number;
  height: number;
  maxSize: number;
  minSize: number;
  lowerThreshold: number;
  higherThreshold: number;
  thresholdStep: number;
  contrast: number;
  contrastStep: number;
  isGray: boolean;
  weight: number;
  saveFormat: ImageEncodeFormat;
};

export const AdvancedEncodeDefaultArgs: AdvancedEncodeDefaultArgsType = {
  width: 1000,
  height: 1000,
  maxSize: 10000,
  minSize: 10,
  lowerThreshold: 0,
  higherThreshold: 24,
  thresholdStep: 1,
  contrast: 0,
  contrastStep: 5,
  isGray: false,
  weight: 1,
  saveFormat: 'JPEG',
};

export const defaultImages = {
  decode: '/examples/prism.jpg',
  encodeInner: '/examples/inner.jpg',
  encodeCover: '/examples/cover.jpg',
};

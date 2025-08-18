import type { ImageEncodeFormat } from '../services/image-encoder';

export const maxListSize: number = 20;

export const minContrast = -255;
export const maxContrast = 255;

interface DecodeDefaultArgsType {
  doReadMetadata: boolean;
  lowerThreshold: number;
  higherThreshold: number;
  thresholdStep: number;
  method: string;
  contrast: number;
  contrastStep: number;
  saveFormat: ImageEncodeFormat;
}

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

interface EncodeDefaultArgsType {
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
}

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

export const defaultImages = {
  decode: '/examples/prism.jpg',
  encodeInner: '/examples/inner.jpg',
  encodeCover: '/examples/cover.jpg',
};

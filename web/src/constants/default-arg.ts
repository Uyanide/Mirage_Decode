/* eslint-disable @typescript-eslint/no-explicit-any */
export const maxListSize: number = 20;

export const decodeDefaultArgs: Record<string, any> = {
  doReadMetadata: true,
  lowerThreshold: 0,
  higherThreshold: 24,
  method: 'ltavg',
  contrast: 50,
  saveFormat: 'PNG',
};

export const encodeDefaultArgs: Record<string, any> = {
  innerThreshold: 24,
  coverThreshold: 42,
  innerContrast: 50,
  coverContrast: 50,
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

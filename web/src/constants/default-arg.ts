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
  isCoverGray: false,
  isReverse: false,
  isCoverMirage: false,
  saveFormat: 'png',
  innerContrast: 50,
  coverContrast: 50,
  size: 1200,
  minSize: 100,
  maxSize: 4000,
};

export const corsProxyUrl: string = 'https://api.uyanide.com/proxy?url=';

export const defaultImages = {
  decode: '/examples/prism.jpg',
};

import type { PrismDecodeMethod } from '../providers/decode/state';

export type PrismDecodeConfig = {
  lowerThreshold: number;
  higherThreshold: number;
  method: PrismDecodeMethod;
  contrast: number;
};

export interface PrismDecodeService {
  prismDecode: (imageData: ImageData, newImageData: ImageData, config: PrismDecodeConfig) => void;
  decodePreset: (str: string, values: PrismDecodeConfig) => void;
}

export type PrismEncodeConfig = {
  innerThreshold: number;
  coverThreshold: number;
  slope: number;
  gap: number;
  isRow: boolean;
  isReverse: boolean;
};

export interface PrismEncodeService {
  prismEncode: (innerData: ImageData, coverData: ImageData, resultData: ImageData, config: PrismEncodeConfig) => void;

  encodePreset: (innerThreshold: number, contrast: number, isReverse: boolean) => string;

  encodeIsCover: (x: number, y: number, slope: number, gap: number, isRow: boolean) => boolean;
}

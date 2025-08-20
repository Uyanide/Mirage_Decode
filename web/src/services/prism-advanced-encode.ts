export type PrismAdvancedEncodeInputConfig = {
  imageData: ImageData;
  lowerThreshold: number;
  higherThreshold: number;
  weight: number;
};

export type PrismAdvancedEncodeConfig = {
  inputs: PrismAdvancedEncodeInputConfig[];
  output: ImageData;
};

export interface PrismAdvancedEncodeService {
  prismAdvancedEncode: (config: PrismAdvancedEncodeConfig) => boolean;
}

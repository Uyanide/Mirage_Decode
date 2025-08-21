import type { Ptr } from '../utils/general';
import type { PrismAdvancedEncodeService } from './prism-advanced-encode';
import type { PrismDecodeService } from './prism-decode';
import type { PrismEncodeService } from './prism-encode';
import { FallbackProcess } from './process/fallback/process';

export type ToGrayAlgo = 'Lum' | 'Average';

// thing(s) that dont worth rewriting with different approaches
export const ImageUtils = {
  matchSize: (src: Ptr<ImageData>, tar: Ptr<ImageData>) => {
    if (!src.v) {
      tar.v = null;
      return;
    }
    const { width, height } = src.v;
    if (tar.v !== null && src.v !== tar.v && width === tar.v.width && height === tar.v.height) {
      return;
    }
    tar.v = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
  },
};

export interface ImageCommonService {
  toGray: (src: Ptr<ImageData>, tar: Ptr<ImageData>, algo?: ToGrayAlgo) => void;

  adjustContrast: (contrast: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) => void;

  resizeCover: (width: number, height: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) => void;

  resizeFit: (maxSize: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) => void;
}

export const ImageProcess: ImageCommonService & PrismEncodeService & PrismDecodeService & PrismAdvancedEncodeService =
  new FallbackProcess();

export function initImageProcess() {
  return;
}

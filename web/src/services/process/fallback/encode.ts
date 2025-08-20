import type { PrismEncodeConfig, PrismEncodeService } from '../../../services/prism-encode';
import type { FallbackProcessConstructor } from './common';

function scaleContrastCompress(value: number): number {
  return Math.max(Math.min((value * 50) / 255 + 50, 100), 0);
}

export function FallbackEncodeProcess<TBase extends FallbackProcessConstructor>(Base: TBase) {
  return class extends Base implements PrismEncodeService {
    encodeIsCover(x: number, y: number, slope: number, gap: number, isRow: boolean): boolean {
      if (slope === 0) {
        return (isRow ? y : x) % (gap + 1) < gap;
      } else if (isRow) {
        return (y / slope + x) % (gap + 1) < gap;
      } else {
        return (x / slope + y) % (gap + 1) < gap;
      }
    }

    prismEncode(
      innerData: ImageData,
      coverData: ImageData,
      resultData: ImageData,
      { innerThreshold, coverThreshold, slope, gap, isRow, isReverse }: PrismEncodeConfig
    ) {
      // All the validation works should be done by caller
      const isCoverPixel = (x: number, y: number) => this.encodeIsCover(x, y, slope, gap, isRow);
      const scaleWrap = (v: number, t: number, func: (v: number, t: number) => number) => {
        return Math.floor(func(v, t));
      };
      const scaleInner = (v: number, t: number) =>
        scaleWrap(
          v,
          t,
          isReverse ? (v: number, t: number) => 255 - t + (v * t) / 255 : (v: number, t: number) => (v * t) / 255
        );
      const scaleCover = (v: number, t: number) =>
        scaleWrap(
          v,
          t,
          isReverse ? (v: number, t: number) => (v * (255 - t)) / 255 : (v: number, t: number) => t + (v * (255 - t)) / 255
        );
      const width = innerData.width;
      const length = innerData.data.length;
      for (let i = 0, x = 0, y = 0; i < length; i += 4) {
        if (isCoverPixel(x, y)) {
          const r = coverData.data[i];
          const g = coverData.data[i + 1];
          const b = coverData.data[i + 2];
          const a = coverData.data[i + 3];
          resultData.data[i] = scaleCover(r, coverThreshold);
          resultData.data[i + 1] = scaleCover(g, coverThreshold);
          resultData.data[i + 2] = scaleCover(b, coverThreshold);
          resultData.data[i + 3] = a;
        } else {
          const r = innerData.data[i];
          const g = innerData.data[i + 1];
          const b = innerData.data[i + 2];
          const a = innerData.data[i + 3];
          resultData.data[i] = scaleInner(r, innerThreshold);
          resultData.data[i + 1] = scaleInner(g, innerThreshold);
          resultData.data[i + 2] = scaleInner(b, innerThreshold);
          resultData.data[i + 3] = a;
        }
        x += 1;
        if (x >= width) {
          x = 0;
          y += 1;
        }
      }
    }

    encodePreset(innerThreshold: number, contrast: number, isReverse: boolean) {
      contrast = scaleContrastCompress(contrast);
      return `${isReverse ? '1' : '0'}\
${innerThreshold.toString(16).padStart(2, '0')}\
${contrast.toString(16).padStart(2, '0')}`;
    }
  };
}

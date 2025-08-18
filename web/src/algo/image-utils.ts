import type { Ptr } from '../utils/general';

type ToGrayAlgo = (r: number, g: number, b: number) => number;

const toGrayLum: ToGrayAlgo = (r: number, g: number, b: number): number => {
  return r * 0.299 + g * 0.587 + b * 0.114;
};

const toGrayAverage: ToGrayAlgo = (r: number, g: number, b: number): number => {
  return (r + g + b) / 3;
};

function toGray(src: Ptr<ImageData>, tar: Ptr<ImageData>, algo: ToGrayAlgo = toGrayLum) {
  if (!src.v) {
    tar.v = null;
    return;
  }
  const srcData = src.v.data;
  matchSize(src, tar);
  if (!tar.v) {
    console.warn('No buffer available for grayscale conversion');
    return;
  }
  const tarData = tar.v.data;
  for (let i = 0; i < src.v.data.length; i += 4) {
    const r = srcData[i];
    const g = srcData[i + 1];
    const b = srcData[i + 2];
    const gray = algo(r, g, b);
    tarData[i] = gray;
    tarData[i + 1] = gray;
    tarData[i + 2] = gray;
    tarData[i + 3] = srcData[i + 3]; // alpha channel
  }
}

/**
 * Adjusts the contrast of the image.
 * @param contrast from 0 to 100
 * @returns
 */
function adjustContrast(contrast: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) {
  if (!src.v) {
    tar.v = null;
    return;
  }
  const srcData = src.v.data;
  matchSize(src, tar);
  if (!tar.v) {
    console.warn('No buffer available for contrast adjustment');
    return;
  }
  const tarData = tar.v.data;
  const contrastScaled = (contrast - 50) * 5.1;
  const factor = (259 * (contrastScaled + 255)) / (255 * (259 - contrastScaled));

  for (let i = 0; i < srcData.length; i += 4) {
    tarData[i] = Math.min(Math.max(0, factor * (srcData[i] - 128) + 128), 255);
    tarData[i + 1] = Math.min(Math.max(0, factor * (srcData[i + 1] - 128) + 128), 255);
    tarData[i + 2] = Math.min(Math.max(0, factor * (srcData[i + 2] - 128) + 128), 255);
    tarData[i + 3] = srcData[i + 3]; // alpha channel
  }
}

function resizeCover(width: number, height: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) {
  if (!src.v || width === 0 || height === 0 || src.v.width === 0 || src.v.height === 0) {
    tar.v = null;
    return;
  }
  const origWidth = src.v.width;
  const origHeight = src.v.height;
  const origData = src.v.data;

  if (width === origWidth && height === origHeight) {
    tar.v = new ImageData(origData.slice(), origWidth, origHeight);
    return;
  }

  const origAspect = origWidth / origHeight;
  const targetAspect = width / height;

  let resizedWidth: number, resizedHeight: number;
  let offsetX = 0,
    offsetY = 0;

  if (origAspect > targetAspect) {
    resizedHeight = height;
    resizedWidth = Math.max(Math.round(height * origAspect), width);
    offsetX = Math.floor((resizedWidth - width) / 2);
  } else {
    resizedWidth = width;
    resizedHeight = Math.max(Math.round(width / origAspect), height);
    offsetY = Math.floor((resizedHeight - height) / 2);
  }

  const resizedData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const srcX = ((x + offsetX) * (origWidth - 1)) / (resizedWidth - 1);
      const srcY = ((y + offsetY) * (origHeight - 1)) / (resizedHeight - 1);

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, origWidth - 1);
      const y1 = Math.min(y0 + 1, origHeight - 1);

      const wx = srcX - x0;
      const wy = srcY - y0;

      function getPixel(ix: number, iy: number) {
        const idx = (iy * origWidth + ix) * 4;
        return [origData[idx], origData[idx + 1], origData[idx + 2], origData[idx + 3]];
      }

      const p00 = getPixel(x0, y0);
      const p01 = getPixel(x1, y0);
      const p10 = getPixel(x0, y1);
      const p11 = getPixel(x1, y1);

      for (let c = 0; c < 4; ++c) {
        const v = (1 - wx) * (1 - wy) * p00[c] + wx * (1 - wy) * p01[c] + (1 - wx) * wy * p10[c] + wx * wy * p11[c];
        resizedData[(y * width + x) * 4 + c] = Math.round(v);
      }
    }
  }

  tar.v = new ImageData(resizedData, width, height);
}

function resizeFit(maxSize: number, src: Ptr<ImageData>, tar: Ptr<ImageData>) {
  if (!src.v || maxSize <= 0) {
    tar.v = null;
    return;
  }
  const { width, height } = src.v;
  if (width <= maxSize && height <= maxSize) {
    tar.v = new ImageData(src.v.data.slice(), width, height);
    return;
  }

  const aspect = width / height;
  let newWidth: number, newHeight: number;

  if (aspect > 1) {
    newWidth = maxSize;
    newHeight = Math.min(Math.round(maxSize / aspect), maxSize);
  } else {
    newHeight = maxSize;
    newWidth = Math.min(Math.round(maxSize * aspect), maxSize);
  }

  resizeCover(newWidth, newHeight, src, tar);
}

// creates a new ImageData object in tar with the same width and height of src
// and ensure src and tar are not pointing to the same object
function matchSize(src: Ptr<ImageData>, tar: Ptr<ImageData>) {
  if (!src.v) {
    tar.v = null;
    return;
  }
  const { width, height } = src.v;
  if (tar.v !== null && src.v !== tar.v && width === tar.v.width && height === tar.v.height) {
    return;
  }
  tar.v = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
}

export const ImageUtils = {
  toGrayAverage,
  toGrayLum,
  resizeCover,
  resizeFit,
  toGray,
  adjustContrast,
  matchSize,
};

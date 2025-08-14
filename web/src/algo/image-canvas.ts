import { PrismImage } from '../models/image';

export class PrismCanvas {
  protected canvas: HTMLCanvasElement;
  protected imageData: ImageData | null = null;
  protected imageDataAdjusted: ImageData | null = null;
  protected unsubscribers: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  destroy() {
    this.unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribers = [];
  }

  clear() {
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setImage(image: PrismImage) {
    this.imageData = image.imageData;
    this.putImageData(this.imageData);
    this.imageDataAdjusted = null;
  }

  putImageData(imageData: ImageData) {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    ctx.putImageData(imageData, 0, 0);
  }

  static toGrayLum = (r: number, g: number, b: number): number => {
    return r * 0.299 + g * 0.587 + b * 0.114;
  };

  static toGrayAvg = (r: number, g: number, b: number): number => {
    return (r + g + b) / 3;
  };

  toGray() {
    if (!this.imageData) {
      return;
    }
    this.imageDataAdjusted ??= new ImageData(
      new Uint8ClampedArray(this.imageData.data),
      this.imageData.width,
      this.imageData.height
    );
    for (let i = 0; i < this.imageData.data.length; i += 4) {
      const r = this.imageData.data[i];
      const g = this.imageData.data[i + 1];
      const b = this.imageData.data[i + 2];
      const gray = PrismCanvas.toGrayLum(r, g, b);
      this.imageDataAdjusted.data[i] = gray;
      this.imageDataAdjusted.data[i + 1] = gray;
      this.imageDataAdjusted.data[i + 2] = gray;
    }
    this.putImageData(this.imageDataAdjusted);
  }

  /**
   * Adjusts the contrast of the image.
   * @param contrast from 0 to 100
   * @returns
   */
  adjustContrast(contrast: number) {
    if (!this.imageData) {
      return;
    }
    const srcData = this.imageData.data;
    this.imageDataAdjusted ??= new ImageData(new Uint8ClampedArray(srcData), this.imageData.width, this.imageData.height);
    const distData = this.imageDataAdjusted.data;
    const contrastScaled = (contrast - 50) * 5.1;
    const factor = (259 * (contrastScaled + 255)) / (255 * (259 - contrastScaled));

    for (let i = 0; i < srcData.length; i += 4) {
      distData[i] = Math.min(Math.max(0, factor * (srcData[i] - 128) + 128), 255);
      distData[i + 1] = Math.min(Math.max(0, factor * (srcData[i + 1] - 128) + 128), 255);
      distData[i + 2] = Math.min(Math.max(0, factor * (srcData[i + 2] - 128) + 128), 255);
    }
    this.putImageData(this.imageDataAdjusted);
  }
}

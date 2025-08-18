import { PrismImage } from '../models/image';
import { nullPtr, type Ptr } from '../utils/general';

export abstract class PrismCanvas {
  protected canvas: HTMLCanvasElement | null = null;
  protected srcData: Ptr<ImageData> = nullPtr();
  protected unsubscribers: (() => void)[] = [];

  bind(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // "double free" is allowed here
  unbind() {
    this.unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribers = [];
    this.canvas = null;
  }

  protected subscribe(func: () => void) {
    this.unsubscribers.push(func);
  }

  clear() {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setImage(srcImage: PrismImage, update = true) {
    this.srcData.v = srcImage.imageData;
    if (update) {
      this.putImageData(this.srcData);
    }
  }

  hasImage() {
    return !!this.srcData.v;
  }

  putImageData(src: Ptr<ImageData>) {
    if (!this.canvas) {
      return;
    }
    if (!src.v) {
      this.clear();
      return;
    }
    const imageData = src.v;
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      console.warn('Failed to get canvas context');
      return;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

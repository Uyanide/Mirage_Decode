import { PrismImage } from '../models/image';
import { saveFile } from '../services/file-saver';
import { encodeImage, ImageEncodeMimetypeMap, type ImageEncodeFormat } from '../services/image-encoder';
import { encodeMetadata } from '../services/metadata-encoder';
import { nullPtr, type Ptr } from '../utils/general';

export abstract class PrismCanvas {
  protected canvas: HTMLCanvasElement | null = null;
  readonly srcData: Ptr<ImageData> = nullPtr();
  protected unsubscribers: (() => void)[] = [];

  bind(canvas: HTMLCanvasElement) {
    if (this.canvas || this.unsubscribers.length > 0) {
      this.unbind();
    }
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

  getImageData() {
    if (!this.canvas) {
      return null;
    }
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      console.warn('Failed to get canvas context');
      return null;
    }
    return ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  async encodeImageFile(src: Ptr<ImageData>, format: ImageEncodeFormat, metadata?: string): Promise<Uint8Array> {
    if (!src.v) {
      throw new Error('No image data to encode');
    }
    const fileData = await encodeImage(src.v, format);
    if (!metadata) {
      return fileData;
    } else {
      return encodeMetadata(fileData, metadata);
    }
  }

  saveImageFile(file: Uint8Array, format: ImageEncodeFormat): string {
    return saveFile(file, ImageEncodeMimetypeMap[format]);
  }
}

import { decodeImage } from '../services/image-decoder';

export class PrismImage {
  readonly imageData: ImageData;

  constructor(imageData: ImageData) {
    this.imageData = imageData;
  }

  static fromCopy(imageData: ImageData) {
    return new PrismImage(new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height));
  }

  static toGray(image: PrismImage): PrismImage {
    const imageData = image.imageData;
    const grayData = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      grayData[i] = gray;
      grayData[i + 1] = gray;
      grayData[i + 2] = gray;
      grayData[i + 3] = imageData.data[i + 3];
    }
    return new PrismImage(new ImageData(grayData, imageData.width, imageData.height));
  }

  static async fromFile(file: File): Promise<PrismImage> {
    const arrayBuffer = await file.arrayBuffer();
    return PrismImage.fromArrayBuffer(arrayBuffer);
  }

  static async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<PrismImage> {
    return new PrismImage(await decodeImage(arrayBuffer));
  }

  width() {
    return this.imageData.width;
  }

  height() {
    return this.imageData.height;
  }
}

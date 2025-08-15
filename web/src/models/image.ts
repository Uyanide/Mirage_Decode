import { decodeImage } from '../services/image-decoder';
import { decodeMetadata } from '../services/metadata-decoder';

export class PrismImage {
  readonly imageData: ImageData;
  readonly metadata: string;

  private constructor(imageData: ImageData, metadata: string = '') {
    this.imageData = imageData;
    this.metadata = metadata;
  }

  static fromCopy(imageData: ImageData, metadata: string = '') {
    return new PrismImage(new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height), metadata);
  }

  static async fromFileData(data: Uint8Array): Promise<PrismImage> {
    const imageData = await decodeImage(data);
    try {
      const metaData = decodeMetadata(data);
      return new PrismImage(imageData, metaData);
    } catch (error) {
      console.warn('Metadata decoding failed:', error);
      // constructable anyway
      return new PrismImage(imageData);
    }
  }

  width() {
    return this.imageData.width;
  }

  height() {
    return this.imageData.height;
  }
}

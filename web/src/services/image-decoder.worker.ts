/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { constructError } from '../utils/general';
import { parseMimeType } from './image-mimetype';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
interface DecodeData {
  type: 'decode' | 'init';
  id: string;
  fileData: ArrayBuffer;
}

const decoders: ImageDecoderBase[] = [];
const messageQueue: DecodeData[] = [];
let isInited = false;
let isProcessing = false;

self.onmessage = (event) => {
  switch (event.data.type) {
    case 'init':
      if (isInited) {
        postMessage({ success: true, data: { decoderCount: decoders.length } });
      }
      if (ImageDecoderImageDecoderImpl.isAvailable()) {
        try {
          decoders.push(new ImageDecoderImageDecoderImpl());
        } catch (error: unknown) {
          console.error('Failed to initialize ImageDecoderImageDecoderImpl:', error);
        }
      }
      if (ImageDecoderCanvasImpl.isAvailable()) {
        try {
          decoders.push(new ImageDecoderCanvasImpl());
        } catch (error: unknown) {
          console.error('Failed to initialize ImageDecoderCanvasImpl:', error);
        }
      }
      if (decoders.length === 0) {
        postMessage({ success: false, error: 'No image decoder available' });
      }
      isInited = true;
      postMessage({ success: true, data: { decoderCount: decoders.length } });
      break;
    case 'decode':
      if (!isInited) {
        postMessage({ success: false, id: event.data.id, error: 'Worker is not initialized' });
      }
      messageQueue.push(event.data);
      if (!isProcessing) {
        isProcessing = true;
        processQueue()
          .catch((error: unknown) => {
            console.error('Error processing image queue:', error);
            postMessage({ success: false, id: event.data.id, error: error instanceof Error ? error.message : 'Unknown error' });
          })
          .finally(() => {
            isProcessing = false;
          });
      }
      break;
  }
};

async function processQueue() {
  while (messageQueue.length > 0) {
    const { id, fileData } = messageQueue.shift()!;
    const mimeType = parseMimeType(fileData);
    let success = false;
    for (const decoder of decoders) {
      try {
        const imageData = await decoder.decode(fileData, mimeType);
        console.log(`Successfully decoded image with ${decoder.constructor.name}`);
        postMessage({ success: true, id, data: { imageData } });
        success = true;
        break; // Exit loop on successful decode
      } catch (error: unknown) {
        console.error(`Error decoding image with ${decoder.constructor.name}:`, error);
      }
    }
    if (!success) {
      postMessage({ success: false, id, error: `Failed to decode image with mime type ${mimeType}` });
    }
  }
}

abstract class ImageDecoderBase {
  abstract decode(fileData: ArrayBuffer, mimeType: string): Promise<ImageData>;
}

class ImageDecoderImageDecoderImpl extends ImageDecoderBase {
  static isAvailable(): boolean {
    return typeof ImageDecoder !== 'undefined';
  }

  async decode(fileData: ArrayBuffer, mimeType: string): Promise<ImageData> {
    const decoder = new ImageDecoder({
      data: fileData,
      type: mimeType,
      colorSpaceConversion: 'none',
      preferAnimation: false,
    });
    const result = await decoder.decode();
    const pixelData = new ArrayBuffer(result.image.allocationSize({ format: 'RGBA' }));
    await result.image.copyTo(pixelData, { format: 'RGBA' });
    const imageData = new ImageData(new Uint8ClampedArray(pixelData), result.image.codedWidth, result.image.codedHeight);
    result.image.close();
    return imageData;
  }
}

class ImageDecoderCanvasImpl extends ImageDecoderBase {
  static isAvailable(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }

  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;

  constructor() {
    super();
    this.canvas = new OffscreenCanvas(0, 0);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get offscreen canvas context');
    }
    this.ctx = ctx;
  }

  async decode(fileData: ArrayBuffer, mimeType: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([fileData], { type: mimeType });
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          const image = new Image();
          image.onload = () => {
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            this.ctx.drawImage(image, 0, 0);
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            resolve(imageData);
          };
          image.onerror = (error) => {
            reject(constructError(error));
          };
          image.src = reader.result as string;
        } else {
          reject(new Error('FileReader result is null'));
        }
      };

      reader.onerror = (error) => {
        reject(constructError(error));
      };

      reader.readAsDataURL(blob);
    });
  }
}

import { constructError } from '../utils/general';
import { parseMimeType } from './image-mimetype';

export interface ImageDecodeDataBase {
  id: string;
  success: boolean;
  error?: string;
}

export interface ImageDecodeDataInit extends ImageDecodeDataBase {
  payload: {
    decoderCount: number;
  };
}

export interface ImageDecodeDataResult extends ImageDecodeDataBase {
  payload: {
    data: ArrayBuffer;
    width: number;
    height: number;
  };
}

export interface ImageDecodeWorkerData {
  type: 'decode' | 'init';
  id: string;
  payload: {
    fileData: ArrayBuffer;
  };
}

const decoders: ImageDecoderBase[] = [];
const messageQueue: ImageDecodeWorkerData[] = [];
let isInited = false;
let isProcessing = false;

self.onmessage = (event) => {
  const data = event.data as ImageDecodeWorkerData;
  switch (data.type) {
    case 'init':
      if (isInited) {
        postMessage({ success: true, payload: { decoderCount: decoders.length } } as ImageDecodeDataInit);
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
        postMessage({ success: false, error: 'No image decoder available' } as ImageDecodeDataBase);
      }
      isInited = true;
      postMessage({ success: true, payload: { decoderCount: decoders.length } } as ImageDecodeDataInit);
      break;
    case 'decode':
      if (!isInited) {
        postMessage({ success: false, id: data.id, error: 'Worker is not initialized' } as ImageDecodeDataBase);
      }
      messageQueue.push(data);
      if (!isProcessing) {
        isProcessing = true;
        processQueue()
          .catch((error: unknown) => {
            console.error('Error processing image queue:', error);
            postMessage({
              success: false,
              id: data.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            } as ImageDecodeDataBase);
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
    const { id, payload } = messageQueue.shift()!;
    const data = new Uint8Array(payload.fileData);
    const mimeType = parseMimeType(data);
    let success = false;
    for (const decoder of decoders) {
      try {
        const imageData = await decoder.decode(data, mimeType);
        console.log(`Successfully decoded image with ${decoder.constructor.name}`);
        postMessage(
          {
            success: true,
            id,
            payload: {
              width: imageData.width,
              height: imageData.height,
              data: imageData.data.buffer,
            },
          } as ImageDecodeDataResult,
          {
            transfer: [imageData.data.buffer],
          }
        );
        success = true;
        break; // Exit loop on successful decode
      } catch (error: unknown) {
        console.error(`Error decoding image with ${decoder.constructor.name}:`, error);
      }
    }
    if (!success) {
      postMessage({ success: false, id, error: `Failed to decode image with mime type ${mimeType}` } as ImageDecodeDataBase);
    }
  }
}

abstract class ImageDecoderBase {
  abstract decode(fileData: Uint8Array, mimeType: string): Promise<ImageData>;
}

class ImageDecoderImageDecoderImpl extends ImageDecoderBase {
  static isAvailable(): boolean {
    return typeof ImageDecoder !== 'undefined';
  }

  async decode(fileData: Uint8Array, mimeType: string): Promise<ImageData> {
    const decoder = new ImageDecoder({
      data: fileData.buffer,
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

  async decode(fileData: Uint8Array, mimeType: string): Promise<ImageData> {
    try {
      const blob = new Blob([fileData.buffer as ArrayBuffer], { type: mimeType });
      const imageBitmap = await createImageBitmap(blob);

      this.canvas.width = imageBitmap.width;
      this.canvas.height = imageBitmap.height;
      this.ctx.drawImage(imageBitmap, 0, 0);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      imageBitmap.close(); // Clean up imageBitmap
      return imageData;
    } catch (error: unknown) {
      throw constructError(error);
    }
  }
}

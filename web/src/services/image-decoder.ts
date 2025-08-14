interface ImageDecodeDataBase {
  id: string;
  success: boolean;
  error?: string;
}

interface ImageDecodeDataInit extends ImageDecodeDataBase {
  data: {
    decoderCount: number;
  };
}

interface ImageDecodeDataResult extends ImageDecodeDataBase {
  data: {
    imageData: ImageData;
  };
}

let worker: Worker | null = null;
const handlers: Record<string, (data: ImageDecodeDataResult) => void> = {};

export async function initDecoderWorker() {
  if (worker) {
    return;
  }
  if (typeof Worker === 'undefined') {
    throw new Error('Web Workers are not supported in this environment');
  }

  worker = new Worker(new URL('./image-decoder.worker.ts', import.meta.url), { type: 'module' });

  await new Promise<void>((resolve, reject) => {
    worker!.onmessage = (event) => {
      const data = event.data as ImageDecodeDataInit;
      if (data.success) {
        console.log(`Successfully initialized image decoder worker with ${data.data.decoderCount.toString()} decoders`);
        resolve();
      } else if (data.error) {
        reject(new Error(data.error));
      }
    };
    worker!.onerror = (eror) => {
      reject(new Error(`Worker error: ${eror.message}`));
    };
    worker!.postMessage({ type: 'init' });
  });

  worker.onmessage = (event) => {
    const data = event.data as ImageDecodeDataResult;
    const handler = handlers[data.id];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (handler) {
      handler(data);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete handlers[data.id];
    }
  };
}

function registerMessageHandler(id: string, callback: (data: ImageDecodeDataResult) => void) {
  handlers[id] = callback;
}

export async function decodeImage(fileData: ArrayBuffer): Promise<ImageData> {
  if (!worker) {
    throw new Error('Image decoder worker is not initialized');
  }
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    registerMessageHandler(id, (data: ImageDecodeDataResult) => {
      if (data.success) {
        resolve(data.data.imageData);
      } else {
        reject(new Error(data.error));
      }
    });
    worker!.postMessage({ type: 'decode', id, fileData });
  });
}

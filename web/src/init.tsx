import { enableMapSet } from 'immer';
import { initDecoderWorker } from './services/image-decoder';
import { initEncoderWorker } from './services/image-encoder';
import { initImageProcess } from './services/image-process';

export async function init() {
  const promises: Promise<void>[] = [];
  const errors: string[] = [];

  try {
    enableMapSet();
  } catch (error) {
    console.error('Failed to enable immer map/set support:', error);
    errors.push('Immer map/set support');
  }

  try {
    initImageProcess();
  } catch (error) {
    console.error('Failed to initialize image process service:', error);
    errors.push('WebGL加速 (非必需)');
  }

  promises.push(
    initDecoderWorker().catch((error: unknown) => {
      console.error('Filed to initialize decoder worker:', error);
      errors.push('图像解码器');
    })
  );

  promises.push(
    initEncoderWorker().catch((error: unknown) => {
      console.error('Filed to initialize encoder worker:', error);
      errors.push('图像编码器');
    })
  );

  await Promise.all(promises);

  return errors;
}

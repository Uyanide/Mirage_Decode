import type { PrismImage } from '../../models/image';
import type { ImageEncodeFormat } from '../../services/image-encoder';
import { nullPtr, type Ptr } from '../../utils/general';
import { PrismCanvas } from '../image-canvas';
import { ImageUtils } from '../image-utils';
import { PrismAdvancedEncode, type PrismAdvancedEncodeInputConfig } from './process';
import { useAdvancedEncodeConfigsStore, useAdvancedImagesStore } from './state';

class AdvancedEncodeInputCanvas extends PrismCanvas {
  // super.srcData
  protected resizedData: Ptr<ImageData> = nullPtr();
  readonly adjustedData: Ptr<ImageData> = nullPtr();

  readonly index: number;

  constructor(index: number) {
    super();
    this.index = index;
  }

  bind(canvas: HTMLCanvasElement) {
    super.bind(canvas);
    this.putImageData(this.adjustedData);
  }

  resizeCover(width: number, height: number) {
    if (!this.srcData.v) {
      return;
    }
    ImageUtils.resizeCover(width, height, this.srcData, this.resizedData);
  }

  adjust() {
    if (!this.resizedData.v) {
      return;
    }
    const config = useAdvancedEncodeConfigsStore.getState().getConfig(this.index);
    const temp1: Ptr<ImageData> = nullPtr();
    if (config.isGray) {
      ImageUtils.toGray(this.resizedData, temp1);
    } else {
      temp1.v = this.resizedData.v;
    }
    const temp2: Ptr<ImageData> = nullPtr();
    if (config.contrast !== 0) {
      ImageUtils.adjustContrast(config.contrast, temp1, temp2);
    } else {
      temp2.v = temp1.v;
    }
    this.adjustedData.v = temp2.v;
  }
}

class AdvancedEncodeResultCanvas extends PrismCanvas {
  resultData: Ptr<ImageData> = nullPtr();

  inputCanvases: Map<number, AdvancedEncodeInputCanvas> = new Map();

  bind(canvas: HTMLCanvasElement) {
    super.bind(canvas);
    this.putImageData(this.resultData);
  }

  resize(size: { width: number; height: number }) {
    for (const inputCanvas of this.inputCanvases.values()) {
      inputCanvas.resizeCover(size.width, size.height);
      inputCanvas.adjust();
      inputCanvas.putImageData(inputCanvas.adjustedData);
    }
  }

  createInputCanvas(index: number) {
    if (!this.inputCanvases.has(index)) {
      this.inputCanvases.set(index, new AdvancedEncodeInputCanvas(index));
    }
  }

  removeInputCanvas(index: number) {
    if (this.inputCanvases.has(index)) {
      this.inputCanvases.delete(index);
      useAdvancedImagesStore.getState().setHasInput(index, false);
    }
  }

  bindInputCanvas(index: number, canvas: HTMLCanvasElement) {
    this.inputCanvases.get(index)?.bind(canvas);
  }

  unbindInputCanvas(index: number) {
    this.inputCanvases.get(index)?.unbind();
  }

  adjustInput(index: number) {
    const canvas = this.inputCanvases.get(index);
    if (!canvas) {
      console.error(`Input canvas for index ${index.toString()} does not exist.`);
      return;
    }
    canvas.adjust();
    canvas.putImageData(canvas.adjustedData);
  }

  // return true if the image is newly set
  setInputImage(image: PrismImage, index: number): boolean {
    const inputCanvas = this.inputCanvases.get(index);
    if (!inputCanvas) {
      console.error(`Input canvas for index ${index.toString()} does not exist.`);
      return false;
    }
    inputCanvas.setImage(image, false);
    const size = useAdvancedEncodeConfigsStore.getState().size;
    inputCanvas.resizeCover(size.width, size.height);
    inputCanvas.adjust();
    inputCanvas.putImageData(inputCanvas.adjustedData);
    const lastState = useAdvancedImagesStore.getState().getHasInput(index);
    useAdvancedImagesStore.getState().setHasInput(index, true);
    return !lastState;
  }

  encode() {
    const handleFailure = (msg: string) => {
      console.error(msg);
      this.resultData.v = null;
      useAdvancedImagesStore.setState({ hasOutput: false });
    };

    const configs: PrismAdvancedEncodeInputConfig[] = [];
    for (const [index, inputCanvas] of this.inputCanvases.entries()) {
      const config = useAdvancedEncodeConfigsStore.getState().getConfig(index);
      if (!inputCanvas.adjustedData.v) continue;
      configs.push({
        imageData: inputCanvas.adjustedData.v,
        lowerThreshold: config.lowerThreshold,
        higherThreshold: config.higherThreshold,
        weight: config.weight,
      });
    }
    if (configs.length === 0) {
      handleFailure('No valid input images to encode.');
      return;
    }
    ImageUtils.matchSize({ v: configs[0].imageData }, this.resultData);
    if (!this.resultData.v) {
      handleFailure('Failed to create output image data.');
      return;
    }
    const success = PrismAdvancedEncode({ inputs: configs, output: this.resultData.v });
    if (!success) {
      handleFailure('Failed to encode image.');
      return;
    }
    this.putImageData(this.resultData);
    useAdvancedImagesStore.setState({ hasOutput: true });
  }

  encodeResultToFile(format: ImageEncodeFormat) {
    return this.encodeImageFile(this.resultData, format);
  }

  async saveResult(format: ImageEncodeFormat) {
    return this.saveImageFile(await this.encodeResultToFile(format), format);
  }
}

export const prismAdvancedEncodeCanvas = new AdvancedEncodeResultCanvas();

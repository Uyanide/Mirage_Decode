import type { PrismImage } from '../../models/image';
import { usePrismDecodeImagesStore, usePrismDecodeStore } from './state';
import { PrismCanvas } from '../image-canvas';
import { decodePreset, prismDecode, type PrismDecodeConfig } from './process';
import { nullPtr, type Ptr } from '../../utils/general';
import { ImageUtils } from '../image-utils';
import type { ImageEncodeFormat } from '../../services/image-encoder';

class DecodeCanvas extends PrismCanvas {
  protected decodedData: Ptr<ImageData> = nullPtr();
  protected adjustedData: Ptr<ImageData> = nullPtr();

  bind(canvas: HTMLCanvasElement) {
    super.bind(canvas);
    this.subscribe(
      usePrismDecodeStore.subscribe(
        (state) => state.lowerThreshold,
        () => {
          this.decode();
        }
      )
    );

    this.subscribe(
      usePrismDecodeStore.subscribe(
        (state) => state.higherThreshold,
        () => {
          this.decode();
        }
      )
    );

    this.subscribe(
      usePrismDecodeStore.subscribe(
        (state) => state.method,
        () => {
          this.decode();
        }
      )
    );

    this.subscribe(
      usePrismDecodeStore.subscribe(
        (state) => state.contrast,
        () => {
          this.adjust(true);
        }
      )
    );

    this.subscribe(
      usePrismDecodeImagesStore.subscribe(
        (state) => state.currImage,
        (currImage) => {
          if (currImage) {
            this.setImage(currImage.image);
          } else {
            this.clearImage();
          }
        },
        { fireImmediately: true }
      )
    );
  }

  setImage(image: PrismImage) {
    super.setImage(image, false);

    this.setPreset(image.metadata);

    this.decode();
    this.adjust();

    this.putImageData(this.adjustedData);
  }

  clearImage() {
    this.srcData.v = null;
    this.decodedData.v = null;
    this.adjustedData.v = null;
    this.clear();
  }

  setPreset(metadata: string) {
    console.log('Setting preset from string:', metadata);
    const { lowerThreshold, higherThreshold, contrast } = usePrismDecodeStore.getState();
    const config: PrismDecodeConfig = {
      lowerThreshold,
      higherThreshold,
      method: 'black', // doesn't matter
      contrast,
    };
    decodePreset(metadata, config);
    this.setValues(config);
  }

  setValues(config: PrismDecodeConfig) {
    usePrismDecodeStore.setState({
      lowerThreshold: config.lowerThreshold,
      higherThreshold: config.higherThreshold,
      contrast: config.contrast,
    });
  }

  decode = () => {
    if (!this.srcData.v) {
      console.warn('No original image data to decode');
      return;
    }
    ImageUtils.matchSize(this.srcData, this.decodedData);
    if (!this.decodedData.v) {
      console.warn('No buffer available');
      return;
    }
    const { lowerThreshold, higherThreshold, method, contrast } = usePrismDecodeStore.getState();
    prismDecode(this.srcData.v, this.decodedData.v, {
      lowerThreshold,
      higherThreshold,
      method,
      contrast,
    });
    this.adjust();
  };

  adjust(forceUpdate?: boolean) {
    const { contrast } = usePrismDecodeStore.getState();
    // 'forceUpdate' cuz changing from other values to 50
    // also needs updating
    if (forceUpdate || contrast !== 0) {
      ImageUtils.adjustContrast(contrast, this.decodedData, this.adjustedData);
    } else {
      this.adjustedData.v = this.decodedData.v;
    }
    this.putImageData(this.adjustedData);
  }

  async saveCurrentImage(format: ImageEncodeFormat): Promise<string> {
    return this.saveImageFile(await this.encodeImageFile(this.adjustedData, format), format);
  }

  async saveOriginalImage(format: ImageEncodeFormat): Promise<string> {
    return this.saveImageFile(await this.encodeImageFile(this.srcData, format), format);
  }
}

export const prismDecodeCanvas = new DecodeCanvas();

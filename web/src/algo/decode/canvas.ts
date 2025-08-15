import { create } from 'zustand';
import type { PrismImage } from '../../models/image';
import { usePrismDecodeImagesStore, usePrismDecodeStore } from '../../providers/process/decode';
import { PrismCanvas } from '../image-canvas';
import { decodePreset, prismDecode, type PrismDecodeConfig } from './process';
import { encodeImage, ImageEncodeMimetypeMap, type ImageEncodeFormat } from '../../services/image-encoder';
import { saveFile } from '../../services/file-saver';

export class DecodeCanvas extends PrismCanvas {
  private origData: ImageData | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.unsubscribers.push(
      usePrismDecodeStore.subscribe(
        (state) => state.lowerThreshold,
        () => {
          this.decode();
        }
      )
    );

    this.unsubscribers.push(
      usePrismDecodeStore.subscribe(
        (state) => state.higherThreshold,
        () => {
          this.decode();
        }
      )
    );

    this.unsubscribers.push(
      usePrismDecodeStore.subscribe(
        (state) => state.method,
        () => {
          this.decode();
        }
      )
    );

    this.unsubscribers.push(
      usePrismDecodeStore.subscribe(
        (state) => state.contrast,
        () => this.adjust(true)
      )
    );

    this.unsubscribers.push(
      usePrismDecodeImagesStore.subscribe(
        (state) => state.currImage,
        (currImage) => {
          if (currImage) {
            this.setImage(currImage.image);
          } else {
            this.clear();
          }
        },
        { fireImmediately: true }
      )
    );
  }

  setImage(image: PrismImage) {
    this.origData = image.imageData;
    this.imageData = new ImageData(new Uint8ClampedArray(this.origData.data.length), image.width(), image.height());
    this.imageDataAdjusted = null;

    this.setPreset(image.metadata);

    this.decode();
    if (!this.adjust()) {
      super.putImageData(this.imageData);
    }
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
    if (!this.origData || !this.imageData) {
      console.warn('No original image data or image data to decode');
      return;
    }
    const { lowerThreshold, higherThreshold, method, contrast } = usePrismDecodeStore.getState();
    prismDecode(this.origData, this.imageData, {
      lowerThreshold,
      higherThreshold,
      method,
      contrast,
    });
    if (!this.adjust()) {
      super.putImageData(this.imageData);
    }
  };

  adjust(forceUpdate?: boolean): boolean {
    const { contrast } = usePrismDecodeStore.getState();
    // 'forceUpdate' cuz changing from other values to 50
    // also needs updating
    if (forceUpdate || contrast !== 50) {
      super.adjustContrast(contrast);
      return true;
    }
    return false;
  }

  async saveCurrentImage(format: ImageEncodeFormat): Promise<string> {
    const data = this.imageDataAdjusted ?? this.imageData ?? this.origData;
    if (!data) {
      throw new Error('No image data available to save');
    }
    const encoded = await encodeImage(data, format);
    return saveFile(encoded, ImageEncodeMimetypeMap[format]);
  }

  async saveOriginalImage(format: ImageEncodeFormat): Promise<string> {
    if (!this.origData) {
      throw new Error('No original image data available to save');
    }
    const encoded = await encodeImage(this.origData, format);
    return saveFile(encoded, ImageEncodeMimetypeMap[format]);
  }
}

export const useDecodeCanvasStore = create<{
  decodeCanvas: DecodeCanvas | null;
  setDecodeCanvas: (canvas: DecodeCanvas) => void;
}>((set) => ({
  decodeCanvas: null,
  setDecodeCanvas: (canvas: DecodeCanvas) => {
    set({ decodeCanvas: canvas });
  },
}));

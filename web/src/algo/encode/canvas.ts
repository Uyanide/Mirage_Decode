import { nullPtr, type Ptr } from '../../utils/general';
import { PrismCanvas } from '../image-canvas';
import { usePrismEncodeImageStore, usePrismEncodeStore } from './state';
import type { PrismImage } from '../../models/image';
import { ImageUtils } from '../image-utils';
import { encodePreset, prismEncode } from './process';
import { encodeImage, ImageEncodeMimetypeMap, type ImageEncodeFormat } from '../../services/image-encoder';
import { saveFile } from '../../services/file-saver';
import { encodeMetadata } from '../../services/metadata-encoder';

// srcData
// resizedData
// adjustedData (gray | contrast)
export class EncodeInputCanvas extends PrismCanvas {
  // super.srcData
  protected resizedData: Ptr<ImageData> = nullPtr();
  readonly adjustedData: Ptr<ImageData> = nullPtr(); // can share same ImageData object with resizedData

  protected isInner: boolean;

  constructor(isInner: boolean) {
    super();
    this.isInner = isInner;
  }

  bind(canvas: HTMLCanvasElement) {
    super.bind(canvas);
  }

  resizeFit() {
    if (!this.srcData.v) {
      return;
    }
    const { maxSize } = usePrismEncodeStore.getState();
    ImageUtils.resizeFit(maxSize, this.srcData, this.resizedData);
  }

  resizeCover(width: number, Height: number) {
    if (!this.srcData.v) {
      return;
    }
    ImageUtils.resizeCover(width, Height, this.srcData, this.resizedData);
  }

  getSize() {
    return {
      width: this.resizedData.v?.width ?? 0,
      height: this.resizedData.v?.height ?? 0,
    };
  }

  adjust() {
    if (!this.resizedData.v) {
      return;
    }
    let gray: boolean, contrast: number;
    if (this.isInner) {
      gray = usePrismEncodeStore.getState().isInnerGray;
      contrast = usePrismEncodeStore.getState().innerContrast;
    } else {
      gray = usePrismEncodeStore.getState().isCoverGray;
      contrast = usePrismEncodeStore.getState().coverContrast;
    }
    const temp: Ptr<ImageData> = nullPtr();
    if (gray) {
      ImageUtils.toGray(this.resizedData, temp);
    } else {
      temp.v = this.resizedData.v;
    }
    const temp2: Ptr<ImageData> = nullPtr();
    if (contrast !== 50) {
      ImageUtils.adjustContrast(contrast, temp, temp2);
    } else {
      temp2.v = temp.v;
    }
    this.adjustedData.v = temp2.v;
  }
}

export class EncodeResultCanvas extends PrismCanvas {
  private inner: EncodeInputCanvas = new EncodeInputCanvas(true);
  private cover: EncodeInputCanvas = new EncodeInputCanvas(false);

  readonly resultData: Ptr<ImageData> = nullPtr();

  bind(canvas: HTMLCanvasElement) {
    super.bind(canvas);
    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.maxSize,
        () => {
          this.resize();
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.innerContrast,
        () => {
          this.inner.adjust();
          this.inner.putImageData(this.inner.adjustedData);
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.coverContrast,
        () => {
          this.cover.adjust();
          this.cover.putImageData(this.cover.adjustedData);
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.isInnerGray,
        () => {
          this.inner.adjust();
          this.inner.putImageData(this.inner.adjustedData);
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.isCoverGray,
        () => {
          this.cover.adjust();
          this.cover.putImageData(this.cover.adjustedData);
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.blendMode,
        () => {
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.innerThreshold,
        () => {
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.coverThreshold,
        () => {
          this.encodeResult();
        }
      )
    );

    this.subscribe(
      usePrismEncodeStore.subscribe(
        (state) => state.isReverse,
        () => {
          this.encodeResult();
        }
      )
    );

    // fire immediately
    this.resize();
    this.encodeResult();
  }

  unbind() {
    super.unbind();
    this.inner.unbind();
    this.cover.unbind();
  }

  setInnerImage(image: PrismImage) {
    this.inner.setImage(image, false);
    this.resize();
    if (!this.cover.hasImage()) {
      return;
    }
    this.encodeResult();
  }

  setCoverImage(image: PrismImage) {
    this.cover.setImage(image, false);
    if (!this.inner.hasImage()) {
      return;
    }
    this.resize();
    this.encodeResult();
  }

  // 1. resize inner image to avoid exceeding maxSize
  // 2. resize cover image to have the exact same size as inner image
  resize() {
    if (!this.inner.hasImage()) {
      return;
    }
    this.inner.resizeFit();
    this.inner.adjust();
    this.inner.putImageData(this.inner.adjustedData);
    if (!this.cover.hasImage()) {
      return;
    }
    const { width, height } = this.inner.getSize();
    this.cover.resizeCover(width, height);
    this.cover.adjust();
    this.cover.putImageData(this.cover.adjustedData);
  }

  bindInner = (canvas: HTMLCanvasElement) => {
    this.inner.bind(canvas);
  };

  bindCover = (canvas: HTMLCanvasElement) => {
    this.cover.bind(canvas);
  };

  unbindInner = () => {
    this.inner.unbind();
  };

  unbindCover = () => {
    this.cover.unbind();
  };

  encodeResult() {
    const inner = this.inner.adjustedData.v;
    const cover = this.cover.adjustedData.v;
    if (!inner || !cover || inner.width !== cover.width || inner.height !== cover.height) {
      return;
    }

    if (!this.resultData.v || this.resultData.v.width !== inner.width || this.resultData.v.height !== inner.height) {
      this.resultData.v = new ImageData(inner.width, inner.height);
    }
    const result = this.resultData.v;

    const {
      innerThreshold,
      coverThreshold,
      blendMode: { slope, gap, isRow },
      isReverse,
    } = usePrismEncodeStore.getState();

    const config = {
      innerThreshold,
      coverThreshold,
      slope,
      gap,
      isRow,
      isReverse,
    };

    prismEncode(inner, cover, result, config);
    this.resultData.v = result;
    usePrismEncodeImageStore.getState().haveResult = true;
    this.putImageData(this.resultData);
  }

  async saveResult(format: ImageEncodeFormat) {
    const encoded = await this.encodeResultToFile(format);
    return saveFile(encoded, ImageEncodeMimetypeMap[format]);
  }

  async encodeResultToFile(format: ImageEncodeFormat) {
    if (!this.resultData.v) {
      throw new Error('No result to encode');
    }
    const data = this.resultData.v;
    const { innerThreshold, innerContrast, isReverse } = usePrismEncodeStore.getState();
    const metadata = encodePreset(innerThreshold, innerContrast, isReverse);
    const encoded = await encodeImage(data, format);
    const inserted = encodeMetadata(encoded, metadata);
    return inserted;
  }
}

export const prismEncodeCanvas = new EncodeResultCanvas();

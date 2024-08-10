import ImageLoader from '../listeners/ImageLoader.js';

class PrismDecoder {
    constructor(decodeCanvasId, defaultArguments) {
        this.img = null;
        this.imgData = null;
        this.coverProcessMethod = defaultArguments.decodeMethod;
        this.threshold = defaultArguments.decodeThreshold;
        this.reverse = defaultArguments.isDecodeReverse;
        this.contrast = defaultArguments.decodeContrast;

        this.decodedImgData = null;

        this.decodeCanvas = document.getElementById(decodeCanvasId);
    }

    showImage(imgData) {
        const ctx = this.decodeCanvas.getContext('2d');
        ctx.putImageData(imgData, 0, 0);
    }

    updateImage(img) {
        this.img = img;
        const ctx = this.decodeCanvas.getContext('2d');
        this.decodeCanvas.width = this.img.width;
        this.decodeCanvas.height = this.img.height;
        ctx.drawImage(this.img, 0, 0, this.decodeCanvas.width, this.decodeCanvas.height);
        this.imgData = ctx.getImageData(0, 0, this.decodeCanvas.width, this.decodeCanvas.height);
        this.processImage();
    }

    processImage() {
        this.decodedImgData = ImageLoader.cloneImageData(this.imgData);
        var data = this.decodedImgData.data;
        if (!this.reverse) {
            var ratio = 255 / this.threshold;
            for (var i = 0; i < data.length; i += 4) {
                var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (avg <= this.threshold) {
                    data[i] *= ratio;
                    data[i + 1] *= ratio;
                    data[i + 2] *= ratio;
                } else {
                    this.processCoverPixel(data, i);
                }
            }
        }
        else {
            var ratio = 255 / (255 - this.threshold);
            for (var i = 0; i < data.length; i += 4) {
                var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (avg >= this.threshold) {
                    data[i] = (data[i] - this.threshold) * ratio;
                    data[i + 1] = (data[i + 1] - this.threshold) * ratio;
                    data[i + 2] = (data[i + 2] - this.threshold) * ratio;
                }
                else {
                    this.processCoverPixel(data, i);
                }
            }
        }
        if (this.contrast !== 50) {
            this.adjustContrast();
        } else {
            this.showImage(this.decodedImgData);
        }
    }

    processCoverPixel(data, i) {
        const widthTimes4 = this.imgData.width * 4;
        const col = i % (widthTimes4);
        const row = Math.floor(i / widthTimes4);
        switch (this.coverProcessMethod) {
            case 'luavg':
                if (col && row) {
                    data[i] = (data[i - 4] + data[i - widthTimes4] + data[i - widthTimes4 - 4]) / 3;
                    data[i + 1] = (data[i - 3] + data[i - widthTimes4 + 1] + data[i - widthTimes4 - 3]) / 3;
                    data[i + 2] = (data[i - 2] + data[i - widthTimes4 + 2] + data[i - widthTimes4 - 2]) / 3;
                    data[i + 3] = (data[i - 1] + data[i - widthTimes4 + 3] + data[i - widthTimes4 - 1]) / 3;
                    break;
                } else { /* fall through */ }
            case 'lcopy':
                if (col) {
                    data[i] = data[i - 4];
                    data[i + 1] = data[i - 3];
                    data[i + 2] = data[i - 2];
                    data[i + 3] = data[i - 1];
                    break;
                } else { /* fall through */ }
            case 'ucopy':
                if (row) {
                    data[i] = data[i - widthTimes4];
                    data[i + 1] = data[i - widthTimes4 + 1];
                    data[i + 2] = data[i - widthTimes4 + 2];
                    data[i + 3] = data[i - widthTimes4 + 3];
                    break;
                } else { /* fall through */ }
            case 'trans':
                data[i + 3] = 0;
                break;
            case 'black':
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
                break;
            case 'white':
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
                break;
        }
    }

    adjustContrast() {
        let imgDataCopy = ImageLoader.cloneImageData(this.decodedImgData);
        ImageLoader.adjustContrastImgData(imgDataCopy, this.contrast);
        this.showImage(imgDataCopy);
    }
}

//     return PrismDecoder;

// }));

export default PrismDecoder;
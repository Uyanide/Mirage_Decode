class MirageDecoder {
    constructor(decodeCanvasId, defaultArguments) {
        this.img = null;
        this.imgData = null;
        this.coverProcessMethod = defaultArguments.decodeMethod;
        this.threshold = defaultArguments.decodeThreshold;
        this.reverse = defaultArguments.isDecodeReverse;

        this.decodeCanvasId = decodeCanvasId;
    }

    showImage(imgData) {
        const canvas = document.getElementById(this.decodeCanvasId);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imgData, 0, 0);
    }

    updateImage(img) {
        this.img = img;
        const canvas = document.getElementById(this.decodeCanvasId);
        const ctx = canvas.getContext('2d');
        canvas.width = this.img.width;
        canvas.height = this.img.height;
        ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
        this.imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.processImage();
    }

    processImage() {
        var imgDataCopy = new ImageData(new Uint8ClampedArray(this.imgData.data), this.imgData.width, this.imgData.height);
        var data = imgDataCopy.data;
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
        this.showImage(imgDataCopy);
    }

    processCoverPixel(data, i) {
        switch (this.coverProcessMethod) {
            case 'lcopy':
                if (i) {
                    data[i] = data[i - 4];
                    data[i + 1] = data[i - 3];
                    data[i + 2] = data[i - 2];
                    break;
                } else { /*fallthrough*/ }
            case 'black':
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                break;
            case 'white':
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                break;
            case 'trans':
                data[i + 3] = 0;
                break;
        }
    }
}

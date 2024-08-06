// (function (root, factory) {
//     if (typeof define === 'function' && define.amd) {
//         define([
//             '../listeners/ImageLoader.js'
//         ], factory);
//     }
//     else if (typeof module === 'object' && module.exports) {
//         module.exports = factory(
//             require(
//                 '../listeners/ImageLoader.js'
//             ),
//         );
//     }
//     else {
//         root.PrismEncoder = factory(
//             root.ImageLoader
//         );
//     }
// }(typeof self !== 'undefined' ? self : this, function (ImageLoader) {

import ImageLoader from '../listeners/ImageLoader.js';

class PrismEncoder {
    constructor(innerCanvasId, coverCanvasId, outputCanvasId, defaultArguments) {
        this.innerImg = null;
        this.coverImg = null;
        this.innerImgdata = null;
        this.coverImgdata = null;
        this.innerImgdataContrast = null;
        this.coverImgdataContrast = null;
        this.innerContrast = defaultArguments.innerContrast;
        this.coverContrast = defaultArguments.coverContrast;
        this.innerThreshold = defaultArguments.innerThreshold;
        this.coverThreshold = defaultArguments.coverThreshold;
        this.width = 0;
        this.heigt = 0;
        this.isCoverGray = defaultArguments.isCoverGray;
        this.isEncodeReverse = defaultArguments.isEncodeReverse;
        this.isCoverMirage = defaultArguments.isCoverMirage;
        this.method = defaultArguments.encodeMethod;
        this.size = defaultArguments.size;

        this.innerCanvas = document.getElementById(innerCanvasId);
        this.coverCanvas = document.getElementById(coverCanvasId);
        this.outputCanvas = document.getElementById(outputCanvasId);

        this.weight_r = 0.299;
        this.weight_g = 0.587;
        this.weight_b = 0.114;
    }

    updateInnerImage(img) {
        this.innerImg = img;
        const ctx = this.innerCanvas.getContext('2d');

        if (img.width > img.height) {
            if (img.width > this.size) {
                const ratio = this.size / img.width;
                this.innerCanvas.width = this.size;
                this.innerCanvas.height = img.height * ratio;
            } else {
                this.innerCanvas.width = this.size;
                this.innerCanvas.height = img.height * this.size / img.width;
            }
        } else {
            if (img.height > this.size) {
                const ratio = this.size / img.height;
                this.innerCanvas.width = img.width * ratio;
                this.innerCanvas.height = this.size;
            } else {
                this.innerCanvas.width = img.width * this.size / img.height;
                this.innerCanvas.height = this.size;
            }
        }

        this.width = this.innerCanvas.width;
        this.height = this.innerCanvas.height;

        ctx.drawImage(this.innerImg, 0, 0, this.innerCanvas.width, this.innerCanvas.height);
        this.innerImgdata = ctx.getImageData(0, 0, this.innerCanvas.width, this.innerCanvas.height);
        if (this.innerContrast !== 50) {
            this.adjustInnerContrast();
        }
        if (this.coverImgdata) {
            this.updateCoverImage(this.coverImg);
        }
    }

    updateCoverImage(img) {
        this.coverImg = img;
        if (this.innerImgdata) {
            const imgRatio = img.width / img.height;
            const targetRatio = this.width / this.height;
            let cropArea;

            if (targetRatio > imgRatio) {
                const newHeight = img.width / targetRatio;
                cropArea = {
                    x: 0,
                    y: (img.height - newHeight) / 2,
                    width: img.width,
                    height: newHeight,
                };
            } else {
                const newWidth = img.height * targetRatio;
                cropArea = {
                    x: (img.width - newWidth) / 2,
                    y: 0,
                    width: newWidth,
                    height: img.height,
                };
            }

            this.coverCanvas.width = this.width;
            this.coverCanvas.height = this.height;
            const ctx = this.coverCanvas.getContext('2d');

            ctx.drawImage(
                img,
                cropArea.x,
                cropArea.y,
                cropArea.width,
                cropArea.height,
                0,
                0,
                this.width,
                this.height
            );

            this.coverImgdata = ctx.getImageData(0, 0, this.coverCanvas.width, this.coverCanvas.height);
            if (this.isCoverGray) {
                this.processCoverGray();
            }
            if (this.coverContrast !== 50) {
                this.adjustCoverContrast();
            }
            this.processImage();
        } else {
            const ctx = this.coverCanvas.getContext('2d');
            this.coverCanvas.width = img.width;
            this.coverCanvas.height = img.height;
            ctx.drawImage(this.coverImg, 0, 0, this.coverCanvas.width, this.coverCanvas.height);
            this.coverImgdata = ctx.getImageData(0, 0, this.coverCanvas.width, this.coverCanvas.height);
        }
    }

    processCoverGray() {
        var coverData = this.coverImgdata.data;
        for (let i = 0; i < coverData.length; i += 4) {
            const avg = Math.floor(
                coverData[i] * this.weight_r +
                coverData[i + 1] * this.weight_g +
                coverData[i + 2] * this.weight_b
            );
            coverData[i] = avg;
            coverData[i + 1] = avg;
            coverData[i + 2] = avg;
        }
        this.showImage(this.coverImgdata, this.coverCanvas);
    }

    compressLow(targ, data, i, rate) {
        targ[i] = Math.floor(data[i] * rate);
        targ[i + 1] = Math.floor(data[i + 1] * rate);
        targ[i + 2] = Math.floor(data[i + 2] * rate);
        targ[i + 3] = data[i + 3];
    }

    compressHigh(targ, data, i, rate, limit) {
        targ[i] = Math.floor(data[i] * rate + limit);
        targ[i + 1] = Math.floor(data[i + 1] * rate + limit);
        targ[i + 2] = Math.floor(data[i + 2] * rate + limit);
        targ[i + 3] = data[i + 3];
    }

    compressClone(targ, data, i) {
        targ[i] = data[i];
        targ[i + 1] = data[i + 1];
        targ[i + 2] = data[i + 2];
        targ[i + 3] = data[i + 3];
    }

    isInnerPixel_slash(col, row, base) {
        return (col + row) % base === 0;
    }

    isInnerPixel_col(col, _, base) {
        return col % base === 0;
    }

    isInnerPixel_row(_, row, base) {
        return row % base === 0;
    }

    processImage() {
        var innerData = this.innerContrast === 50 ? this.innerImgdata.data : this.innerImgdataContrast.data;
        var coverData = this.coverContrast === 50 ? this.coverImgdata.data : this.coverImgdataContrast.data;
        var outputData = new Uint8ClampedArray(innerData.length);

        const innerRate = this.innerThreshold / 255;
        const coverRate = 1 - this.coverThreshold / 255;
        let innerCompress, coverCompress, innerLimit, coverLimit;
        if (this.isEncodeReverse === false) {
            innerCompress = this.compressLow;
            coverCompress = this.isCoverMirage ? this.compressClone : this.compressHigh;
            innerLimit = 0;
            coverLimit = this.coverThreshold;
        } else {
            innerCompress = this.compressHigh;
            coverCompress = this.isCoverMirage ? this.compressClone : this.compressLow;
            innerLimit = 255 - this.innerThreshold;
            coverLimit = 0;
        }

        let isInnerPixel, base;
        switch (this.method) {
            case 'chess':
                isInnerPixel = this.isInnerPixel_slash;
                base = 2;
                break;
            case 'gap_2':
                isInnerPixel = this.isInnerPixel_slash;
                base = 3;
                break;
            case 'gap_3':
                isInnerPixel = this.isInnerPixel_slash;
                base = 4;
                break;
            case 'gap_5':
                isInnerPixel = this.isInnerPixel_slash;
                base = 6;
                break;
            case 'col_1':
                isInnerPixel = this.isInnerPixel_col;
                base = 2;
                break;
            case 'row_1':
                isInnerPixel = this.isInnerPixel_row;
                base = 2;
        }

        for (let i = 0, j = 0; i < innerData.length; i += 4, j++) {
            const col = j % this.width;
            const row = Math.floor(j / this.width);
            if (isInnerPixel(col, row, base)) {
                innerCompress(outputData, innerData, i, innerRate, innerLimit);
            } else {
                coverCompress(outputData, coverData, i, coverRate, coverLimit);
            }
        }

        this.outputCanvas.width = this.width;
        this.outputCanvas.height = this.height;
        const ctx = this.outputCanvas.getContext('2d');
        const outputImgData = new ImageData(outputData, this.width, this.height);
        ctx.putImageData(outputImgData, 0, 0);
    }

    showImage(imgData, canvas) {
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imgData, 0, 0);
    }

    adjustInnerContrast() {
        this.innerImgdataContrast = ImageLoader.cloneImageData(this.innerImgdata);
        ImageLoader.adjustContrastImgData(this.innerImgdataContrast, this.innerContrast);
        this.showImage(this.innerImgdataContrast, this.innerCanvas);
    }

    adjustCoverContrast() {
        this.coverImgdataContrast = ImageLoader.cloneImageData(this.coverImgdata);
        ImageLoader.adjustContrastImgData(this.coverImgdataContrast, this.coverContrast);
        this.showImage(this.coverImgdataContrast, this.coverCanvas);
    }
}

// return PrismEncoder;
// }));

export default PrismEncoder;

errorHandling.scriptsLoaded.PrismEncoder = true;
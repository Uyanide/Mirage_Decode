class MirageEncoder {
    constructor(innerCanvasId, coverCanvasId, outputCanvasId, defaultArguments) {
        this.innerImg = null;
        this.coverImg = null;
        this.innerImgdata = null;
        this.coverImgdata = null;
        this.innerThreshold = defaultArguments.innerThreshold;
        this.coverThreshold = defaultArguments.coverThreshold;
        this.width = 0;
        this.heigt = 0;
        this.isCoverGray = defaultArguments.isCoverGray;
        this.isEncodeReverse = defaultArguments.isEncodeReverse;
        this.method = defaultArguments.method;
        this.size = defaultArguments.size;

        this.innerCanvasId = innerCanvasId;
        this.coverCanvasId = coverCanvasId;
        this.outputCanvasId = outputCanvasId
    }

    updateInnerImage(img) {
        this.innerImg = img;
        const canvas = document.getElementById(this.innerCanvasId);
        const ctx = canvas.getContext('2d');

        if (img.width > img.height) {
            if (img.width > this.size) {
                const ratio = this.size / img.width;
                canvas.width = this.size;
                canvas.height = img.height * ratio;
            } else {
                canvas.width = this.size;
                canvas.height = img.height * this.size / img.width;
            }
        } else {
            if (img.height > this.size) {
                const ratio = this.size / img.height;
                canvas.width = img.width * ratio;
                canvas.height = this.size;
            } else {
                canvas.width = img.width * this.size / img.height;
                canvas.height = this.size;
            }
        }

        this.width = canvas.width;
        this.height = canvas.height;

        ctx.drawImage(this.innerImg, 0, 0, canvas.width, canvas.height);
        this.innerImgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

            const canvas = document.getElementById(this.coverCanvasId);
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');

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

            this.coverImgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (this.isCoverGray) {
                this.processCoverGray();
                ctx.putImageData(this.coverImgdata, 0, 0);
            }
            this.processImage();
        } else {
            const canvas = document.getElementById(this.coverCanvasId);
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(this.coverImg, 0, 0, canvas.width, canvas.height);
            this.coverImgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    processCoverGray() {
        var coverData = this.coverImgdata.data;
        for (let i = 0; i < coverData.length; i += 4) {
            const avg = (coverData[i] + coverData[i + 1] + coverData[i + 2]) / 3;
            coverData[i] = avg;
            coverData[i + 1] = avg;
            coverData[i + 2] = avg;
        }
    }

    compressLow(targ, data, i, rate) {
        targ[i] = Math.floor(data[i] * rate);
        targ[i + 1] = Math.floor(data[i + 1] * rate);
        targ[i + 2] = Math.floor(data[i + 2] * rate);
    }

    compressHigh(targ, data, i, rate, limit) {
        targ[i] = Math.floor(data[i] * rate + limit);
        targ[i + 1] = Math.floor(data[i + 1] * rate + limit);
        targ[i + 2] = Math.floor(data[i + 2] * rate + limit);
    }

    processImage() {
        var innerData = this.innerImgdata.data;
        var coverData = this.coverImgdata.data;
        var outputData = new Uint8ClampedArray(innerData.length);

        const innerRate = this.innerThreshold / 255;
        const coverRate = 1 - this.coverThreshold / 255;
        let innerCompress, coverCompress, innerLimit, coverLimit;
        if (this.isEncodeReverse === false) {
            innerCompress = this.compressLow;
            coverCompress = this.compressHigh;
            innerLimit = 0;
            coverLimit = this.coverThreshold;
        } else {
            innerCompress = this.compressHigh;
            coverCompress = this.compressLow;
            innerLimit = 255 - this.innerThreshold;
            coverLimit = 0;
        }

        for (let i = 0, j = 0; i < innerData.length; i += 4, j++) {
            const col = j % this.width;
            const row = Math.floor(j / this.width);
            if ((col + row) % this.method === 0) {
                innerCompress(outputData, innerData, i, innerRate, innerLimit);
            } else {
                coverCompress(outputData, coverData, i, coverRate, coverLimit);
            }
            outputData[i + 3] = 255;
        }

        const canvas = document.getElementById(this.outputCanvasId);
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        const outputImgData = new ImageData(outputData, this.width, this.height);
        ctx.putImageData(outputImgData, 0, 0);

    }

}
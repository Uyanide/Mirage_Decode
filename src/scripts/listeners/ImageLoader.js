import piexif from '../lib/piexif.js';
import JPEGEncoder from '../lib/encoder.js';
import metadata from '../lib/png-metadata.js';

/************************Image Process***********************/

function copyImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const url = canvas.toDataURL();
    canvas.remove();
    return url;
}

// 调整对比度
function truncate(value) {
    return Math.min(255, Math.max(0, value));
}
// contrast范围：0-100
function adjustContrastImgData(imageData, contrast) {
    contrast = (contrast - 50) * 5.1;
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        data[i] = truncate(factor * (data[i] - 128) + 128);
        data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128);
        data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128);
    }
}

// 克隆ImageData
function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

/************************Metadata Process***********************/

function setDecodeValues(parameters) {
    if (!parameters || !parameters.isValid) {
        return;
    }
    const isReverse = parameters.isReverse;
    const threshold = parameters.innerThreshold;
    const contrast = parameters.innerContrast;
    if (contrast !== undefined) {
        document.getElementById('decodeContrastRange').value = 100 - contrast;
        PrismProcessor.PrismDecoder.contrast = 100 - contrast;
    }
    if (isReverse !== undefined) {
        document.getElementById('decodeReverseInput').checked = isReverse;
        PrismProcessor.PrismDecoder.reverse = isReverse;
    } else {
        isReverse = document.getElementById('decodeReverseInput').checked;
    }
    if (threshold !== undefined) {
        if (isReverse) {
            document.getElementById('decodeThresholdRange').value = 255 - threshold;
            document.getElementById('decodeThresholdInput').value = 255 - threshold;
            PrismProcessor.PrismDecoder.threshold = 255 - threshold;
        } else {
            document.getElementById('decodeThresholdRange').value = threshold;
            document.getElementById('decodeThresholdInput').value = threshold;
            PrismProcessor.PrismDecoder.threshold = threshold;
        }
    }
}

function getParametersFromString(str) {
    console.log('reading from Metadata: ' + str);
    if (!str) {
        return {
            isValid: false,
        };
    }
    let isReverse,
        innerThreshold,
        innerContrast = 50;
    switch (str.length) {
        case 5:
            innerContrast = parseInt(str.slice(3, 5), 16);
            if (isNaN(innerContrast)) {
                return {
                    isValid: false,
                };
            }
        case 3:
            innerThreshold = parseInt(str.slice(1, 3), 16);
            if (isNaN(innerThreshold)) {
                return {
                    isValid: false,
                };
            }
        case 1:
            if (str[0] !== '0' && str[0] !== '1') {
                return {
                    isValid: false,
                };
            }
            isReverse = str[0] === '1';
            break;
        default:
            return {
                isValid: false,
            };
    }
    return {
        isValid: true,
        isReverse: isReverse,
        innerThreshold: innerThreshold,
        innerContrast: innerContrast,
    };
}

function getParametersFromMetadata(img) {
    try {
        if (img.src.startsWith('data:image/jpeg;base64,')) {
            const exif = piexif.load(img.src);
            const infoString = exif['0th'][piexif.ImageIFD.Make];
            return getParametersFromString(infoString);
        } else if (img.src.startsWith('data:image/png;base64,')) {
            const binaryString = atob(img.src.split(',')[1]);
            let chunkList = metadata.splitChunk(binaryString);
            for (let i in chunkList) {
                let chunk = chunkList[i];
                if (chunk.type === 'tEXt' || chunk.type === 'PRSM' /*前朝余孽*/) {
                    let infoString = chunk.data;
                    return getParametersFromString(infoString);
                }
            }
        } else {
            return {
                isValid: false,
            };
        }
    } catch (error) {
        console.log('Failed loading metadata: ', error.message, error.stack);
        return {
            isValid: false,
        };
    }
}

function setDecodeValuesWithMetadata(img) {
    if (!applicationState.isReadMetadata) {
        return;
    }
    setDecodeValues(getParametersFromMetadata(img));
}

/************************Image Loader***********************/

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(blob);
    });
}

applicationState.currCanvasIndex = 0;
function handleImageLoadError(error, callback) {
    alert('无法加载图像! 错误: ' + error);
    if (errorHandling.defaultImg[errorHandling.currCanvasIndex].src) {
        const img = new Image();
        img.src = copyImage(errorHandling.defaultImg[errorHandling.currCanvasIndex]);
        img.onload = () => {
            callback(img);
        };
    }
}

// 从源加载图像并返回
async function loadImage(input, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let timer;

        img.onload = () => {
            clearTimeout(timer);
            if (errorHandling.currCanvasIndex === 0) {
                try {
                    setDecodeValuesWithMetadata(img);
                } catch (error) {
                    console.error('failed to read metadata: ' + error);
                }
            }
            resolve(img);
        };

        img.onerror = (error) => {
            clearTimeout(timer);
            reject(error);
        };

        timer = setTimeout(() => {
            img.src = '';
            reject(new Error('加载图像超时'));
        }, timeout);

        if (typeof input === 'string') {
            img.crossOrigin = 'anonymous';
            img.src = input;
        } else if (input instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = (error) => {
                clearTimeout(timer);
                reject(error);
            };
            reader.readAsDataURL(input);
        } else {
            clearTimeout(timer);
            reject(new Error('不支持的输入类型'));
        }
    });
}

// 从文件加载图像，调用callback
async function updateImageFromFile(file, callback) {
    loadImage(file)
        .then((img) => {
            callback(img);
        })
        .catch((error) => {
            handleImageLoadError(error, callback);
        });
}

// 从URL加载图像，调用callback
async function updateImageFromURL(event, callback) {
    const proxy = 'https://api.uyanide.com/proxy/?url=';
    if (event.target.previousElementSibling.value === '') {
        handleImageLoadError('未提供URL', callback);
        return;
    }
    const imageUrl = proxy + event.target.previousElementSibling.value;
    loadImage(imageUrl)
        .then((img) => {
            callback(img);
        })
        .catch((error) => {
            handleImageLoadError(error, callback);
        });
}

// 从剪贴板更新图像，调用callback
async function updateImageFromClipboard(event, callback) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            loadImage(blob)
                .then((img) => {
                    callback(img);
                })
                .catch((error) => {
                    handleImageLoadError(error, callback);
                });
        }
    }
}

// 直接从剪贴板更新图像，调用callback
async function updateImageFromClipboardDirect(callback) {
    try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        if (permission.state === 'granted' || permission.state === 'prompt') {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (item.types.some((type) => type.startsWith('image/'))) {
                    const blob = await item.getType(item.types.find((type) => type.startsWith('image/')));
                    const url = await convertBlobToBase64(blob);
                    loadImage(url)
                        .then((img) => {
                            callback(img);
                        })
                        .catch((error) => {
                            throw error;
                        });
                } else {
                    alert('剪贴板中没有图片');
                }
            }
        } else {
            alert('没有剪贴板读取权限');
        }
    } catch (error) {
        handleImageLoadError(error, callback);
    }
}

// 拖动文件加载图像
async function dragDropLoadImage(event, callback) {
    event.preventDefault();
    if (event.dataTransfer.items) {
        for (const item of event.dataTransfer.items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                loadImage(file)
                    .then((img) => {
                        callback(img);
                    })
                    .catch((error) => {
                        handleImageLoadError(error, callback);
                    });
            }
        }
    }
}

// 保存图像
function downloadFromLink(url, fileName) {
    if (!applicationState.isDownloadNotSupported) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const byteString = atob(url.split(',')[1]);
        const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        const objectURL = URL.createObjectURL(blob);
        const newTab = window.open();
        newTab.document.write('<img src="' + objectURL + '" alt="' + fileName + '">');
        newTab.document.close();
        newTab.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(objectURL);
        });
    }
}
function generateUrlFromCanvas(canvasId, isPng = true, writeInMetadata = false) {
    const isReverse = PrismProcessor.PrismEncoder.isEncodeReverse;
    const threshold = PrismProcessor.PrismEncoder.innerThreshold;
    const contrast = PrismProcessor.PrismEncoder.innerContrast;
    const canvas = document.getElementById(canvasId);
    if (isPng) {
        if (writeInMetadata) {
            return writeChunkDataPNG(canvas.toDataURL('image/png'), isReverse, threshold, contrast);
        } else {
            return canvas.toDataURL('image/png');
        }
    } else {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoder = new JPEGEncoder(100);
        const jpegData = encoder.encode(imageData, 100);
        let binary = '';
        const bytes = new Uint8Array(jpegData);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        if (writeInMetadata) {
            return writeMetadataJPEG(`data:image/jpeg;base64,${btoa(binary)}`, isReverse, threshold, contrast);
        } else {
            return `data:image/jpeg;base64,${btoa(binary)}`;
        }
    }
}
function saveImageFromCanvas(canvasId, isPng = true, writeInMetadata = false) {
    const timestamp = new Date().getTime();
    if (PrismProcessor.PrismEncoder.isCoverMirage && !isPng) {
        alert('JPEG格式不支持幻影坦克！请谨慎选择。');
    }
    const fileName = `output_${timestamp}.${isPng ? 'png' : 'jpg'}`;
    downloadFromLink(generateUrlFromCanvas(canvasId, isPng, writeInMetadata), fileName);
}

// 生成infoString
function generateInfoString(isReverse, innerThreshold, innerContrast) {
    const infoString = (isReverse ? '1' : '0') + innerThreshold.toString(16).padStart(2, '0') + innerContrast.toString(16).padStart(2, '0');
    console.log('writing to Metadata: ' + infoString);
    return infoString;
}

// 写入元数据（照相机信息）
function writeMetadataJPEG(imgURL, isReverse, innerThreshold, innerContrast) {
    const infoString = generateInfoString(isReverse, innerThreshold, innerContrast);
    let zeroth = {};
    zeroth[piexif.ImageIFD.Make] = infoString;
    const exifObj = { '0th': zeroth };
    const exifbytes = piexif.dump(exifObj);
    const inserted = piexif.insert(exifbytes, imgURL);
    return inserted;
}

// 写入tEXt块（PNG）
function writeChunkDataPNG(imgURL, isReverse, innerThreshold, innerContrast) {
    const binaryData = atob(imgURL.split(',')[1]);
    let chunkList = metadata.splitChunk(binaryData);
    const infoString = generateInfoString(isReverse, innerThreshold, innerContrast);
    let istEXtFound = false;
    for (let i in chunkList) {
        let chunk = chunkList[i];
        if (chunk.type === 'tEXt') {
            chunk.data = infoString;
            chunkList[i] = chunk;
            istEXtFound = true;
            break;
        }
    }
    if (!istEXtFound) {
        let chunk = metadata.createChunk('tEXt', infoString);
        const iend = chunkList.pop();
        chunkList.push(chunk);
        chunkList.push(iend);
    }
    const output = metadata.joinChunk(chunkList);
    return `data:image/png;base64,${btoa(output)}`;
}

const ImageLoader = {
    copyImage,
    adjustContrastImgData,
    cloneImageData,
    getParametersFromMetadata,
    setDecodeValues,
    updateImageFromFile,
    updateImageFromURL,
    updateImageFromClipboard,
    updateImageFromClipboardDirect,
    dragDropLoadImage,
    downloadFromLink,
    saveImageFromCanvas,
    generateUrlFromCanvas,
};

export default ImageLoader;

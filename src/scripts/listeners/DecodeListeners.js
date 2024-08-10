import ImageLoader from './ImageLoader.js';

// 设置是否读取元数据
function setReadMetadata(event) {
    applicationState.isReadMetadata = event.target.checked;
}

// 从文件加载图像
function decodeLoadImageFile(event) {
    const file = event.target.files[0];
    errorHandling.currCanvasIndex = 0;
    ImageLoader.updateImageFromFile(file, (img) => {
        PrismProcessor.PrismDecoder.updateImage(img);
    });
    event.target.value = '';
}

// 从URL加载图像
function decodeLoadImageURL(event) {
    errorHandling.currCanvasIndex = 0;
    ImageLoader.updateImageFromURL(event, (img) => {
        PrismProcessor.PrismDecoder.updateImage(img);
    });
    event.target.previousElementSibling.value = '';
}

// 从剪贴板加载图像
function decodeLoadImageFromClipboard(event) {
    errorHandling.currCanvasIndex = 0;
    ImageLoader.updateImageFromClipboard(event, (img) => {
        PrismProcessor.PrismDecoder.updateImage(img);
    });
}

// 从粘贴按钮加载图像
function decodeLoadImageFromPasteButton() {
    errorHandling.currCanvasIndex = 0;
    document.body.focus();
    const pasteEvent = new ClipboardEvent('paste');
    ImageLoader.updateImageFromClipboardDirect((img) => {
        PrismProcessor.PrismDecoder.updateImage(img);
    });
}

// 从拖动加载图像
function decodeLoadImageFromDrag(event) {
    errorHandling.currCanvasIndex = 0;
    ImageLoader.dragDropLoadImage(event, (img) => {
        PrismProcessor.PrismDecoder.updateImage(img);
    });
}

// 设置阈值
const thresholdInput = document.getElementById('decodeThresholdInput');
function decodeSetThreshold(event) {
    PrismProcessor.PrismDecoder.threshold = parseInt(event.target.value, 10);
    thresholdInput.value = event.target.value;
    if (PrismProcessor.PrismDecoder.img) {
        PrismProcessor.PrismDecoder.processImage();
    }
}

let thresInputTimeout = null;
const thresholdRange = document.getElementById('decodeThresholdRange');
function decodeSetThresholdInput(event) {
    if (thresInputTimeout) {
        clearTimeout(thresInputTimeout);
    }

    thresInputTimeout = setTimeout(() => {
        if (event.target.value === '') {
            return;
        }
        let value = parseInt(event.target.value, 10);
        if (value < 0) {
            value = 0;
            event.target.value = 0;
        } else if (value > 255) {
            value = 255;
            event.target.value = 255;
        }
        PrismProcessor.PrismDecoder.threshold = value;
        thresholdRange.value = value;
        if (PrismProcessor.PrismDecoder.img) {
            PrismProcessor.PrismDecoder.processImage();
        }
    }, 500);
}

// 设置对比度
function decodeSetContrast(event) {
    PrismProcessor.PrismDecoder.contrast = parseInt(event.target.value, 10);
    if (PrismProcessor.PrismDecoder.img) {
        PrismProcessor.PrismDecoder.adjustContrast();
    }
}

// 重置对比度
function decodeResetContrast() {
    document.getElementById('decodeContrastRange').value = 50;
    PrismProcessor.PrismDecoder.contrast = 50;
    if (PrismProcessor.PrismDecoder.img) {
        PrismProcessor.PrismDecoder.adjustContrast();
    }
}

// 设置表图像素处理方式
function decodeSetCoverMethod(event) {
    PrismProcessor.PrismDecoder.coverProcessMethod = event.target.value;
    if (PrismProcessor.PrismDecoder.img) {
        PrismProcessor.PrismDecoder.processImage();
    }
}

// 设置反向隐写
function decodeSetReverse(event) {
    PrismProcessor.PrismDecoder.reverse = event.target.checked;
    if (PrismProcessor.PrismDecoder.img) {
        PrismProcessor.PrismDecoder.processImage();
    }
}

// 保存图像
function decodeSaveImage() {
    ImageLoader.saveImageFromCanvas('decodeCanvas');
}

// 保存原始图像
function decodeSaveSrcImage() {
    const canvas = document.createElement('canvas');
    canvas.id = 'temp_srcCanvas';
    canvas.width = PrismProcessor.PrismDecoder.img.width;
    canvas.height = PrismProcessor.PrismDecoder.img.height;
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    ctx.drawImage(PrismProcessor.PrismDecoder.img, 0, 0);
    document.body.appendChild(canvas);
    ImageLoader.saveImageFromCanvas('temp_srcCanvas', applicationState.isPng, false);
    canvas.remove();
}

// 设置解码事件监听器
function decodeSetupEventListeners() {
    // 读取元数据事件监听
    document.getElementById('isReadMetadataCheckBox').addEventListener('change', setReadMetadata);

    // 图像加载事件监听
    document.getElementById('decodeImageFileInput').addEventListener('change', decodeLoadImageFile);
    document.getElementById('decodeLoadImageButton').addEventListener('click', decodeLoadImageURL);
    if (!applicationState.isOnPhone) {
        window.addEventListener('paste', decodeLoadImageFromClipboard);
        document.body.addEventListener('drop', decodeLoadImageFromDrag);
    } else {
        document.getElementById('decodePasteButtonInput').addEventListener('click', decodeLoadImageFromPasteButton);

        // 禁用滚动
        // document.getElementById('decodeThresholdRange').addEventListener('touchstart', disableScroll);
        // document.getElementById('decodeContrastRange').addEventListener('touchstart', disableScroll);
    }
    // 参数调整事件监听
    document.getElementById('decodeThresholdRange').addEventListener('input', decodeSetThreshold);
    document.getElementById('decodeThresholdInput').addEventListener('input', decodeSetThresholdInput);
    document.getElementById('decodeMethodSelect').addEventListener('change', decodeSetCoverMethod);
    document.getElementById('decodeReverseInput').addEventListener('change', decodeSetReverse);
    document.getElementById('decodeContrastRange').addEventListener('input', decodeSetContrast);
    document.getElementById('decodeResetContrastButton').addEventListener('click', decodeResetContrast);

    // 保存图像
    document.getElementById('decodeSaveImageButton').addEventListener('click', decodeSaveImage);
    document.getElementById('decodeSaveSrcImageButton').addEventListener('click', decodeSaveSrcImage);
}

// 移除解码事件监听器
function decodeRemoveEventListeners() {
    document.getElementById('isReadMetadataCheckBox').removeEventListener('change', setReadMetadata);
    document.getElementById('decodeImageFileInput').removeEventListener('change', decodeLoadImageFile);
    document.getElementById('decodeLoadImageButton').removeEventListener('click', decodeLoadImageURL);
    if (!applicationState.isOnPhone) {
        window.removeEventListener('paste', decodeLoadImageFromClipboard);
        document.body.removeEventListener('drop', decodeLoadImageFromDrag);
    } else {
        document.getElementById('decodePasteButtonInput').removeEventListener('click', decodeLoadImageFromPasteButton);
        // document.getElementById('decodeThresholdRange').removeEventListener('touchstart', disableScroll);
        // document.getElementById('decodeContrastRange').removeEventListener('touchstart', disableScroll);
    }
    document.getElementById('decodeThresholdRange').removeEventListener('input', decodeSetThreshold);
    document.getElementById('decodeThresholdInput').removeEventListener('input', decodeSetThresholdInput);
    document.getElementById('decodeMethodSelect').removeEventListener('change', decodeSetCoverMethod);
    document.getElementById('decodeReverseInput').removeEventListener('change', decodeSetReverse);
    document.getElementById('decodeContrastRange').removeEventListener('input', decodeSetContrast);
    document.getElementById('decodeResetContrastButton').removeEventListener('click', decodeResetContrast);
    document.getElementById('decodeSaveImageButton').removeEventListener('click', decodeSaveImage);
    document.getElementById('decodeSaveSrcImageButton').removeEventListener('click', decodeSaveSrcImage);
}

// return {
//     decodeSetupEventListeners,
//     decodeRemoveEventListeners
// };
// }));

const DecodeListeners = {
    decodeSetupEventListeners,
    decodeRemoveEventListeners
};

export default DecodeListeners;
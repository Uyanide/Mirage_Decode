// 从文件加载图像
function decodeLoadImageFile(event) {
    const file = event.target.files[0];
    errorHandling.currCanvasIndex = 0;
    updateImageFromFile(file, (img) => {
        mirageProcessor.mirageDecoder.updateImage(img);
    });
    event.target.value = '';
}

// 从URL加载图像
function decodeLoadImageURL(event) {
    errorHandling.currCanvasIndex = 0;
    updateImageFromURL(event, (img) => {
        mirageProcessor.mirageDecoder.updateImage(img);
    });
    event.target.previousElementSibling.value = '';
}

// 从剪贴板加载图像
function decodeLoadImageFromClipboard(event) {
    errorHandling.currCanvasIndex = 0;
    updateImageFromClipboard(event, (img) => {
        mirageProcessor.mirageDecoder.updateImage(img);
    });
}

// 从粘贴按钮加载图像
function decodeLoadImageFromPasteButton() {
    errorHandling.currCanvasIndex = 0;
    document.body.focus();
    const pasteEvent = new ClipboardEvent('paste');
    updateImageFromClipboardDirect((img) => {
        mirageProcessor.mirageDecoder.updateImage(img);
    });
}

// 从拖动加载图像
function decodeLoadImageFromDrag(event) {
    errorHandling.currCanvasIndex = 0;
    dragDropLoadImage(event, (img) => {
        mirageProcessor.mirageDecoder.updateImage(img);
    });
}

// 设置阈值
function decodeSetThreshold(event) {
    mirageProcessor.mirageDecoder.threshold = parseInt(event.target.value, 10);
    if (mirageProcessor.mirageDecoder.img) {
        mirageProcessor.mirageDecoder.processImage();
    }
}

// 设置表图像素处理方式
function decodeSetCoverMethod(event) {
    mirageProcessor.mirageDecoder.coverProcessMethod = event.target.value;
    if (mirageProcessor.mirageDecoder.img) {
        mirageProcessor.mirageDecoder.processImage();
    }
}

// 设置反向隐写
function decodeSetReverse(event) {
    mirageProcessor.mirageDecoder.reverse = event.target.checked;
    if (mirageProcessor.mirageDecoder.img) {
        mirageProcessor.mirageDecoder.processImage();
    }
}

// 保存图像
function decodeSaveImage() {
    saveImageFromCanvas('decodeCanvas');
}

// 保存原始图像
function decodeSaveSrcImage() {
    const canvas = document.createElement('canvas');
    canvas.id = 'temp_srcCanvas';
    canvas.width = mirageProcessor.mirageDecoder.img.width;
    canvas.height = mirageProcessor.mirageDecoder.img.height;
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mirageProcessor.mirageDecoder.img, 0, 0);
    document.body.appendChild(canvas);
    saveImageFromCanvas('temp_srcCanvas', applicationState.isPng);
    canvas.remove();
}

// 设置解码事件监听器
function decodeSetupEventListeners() {
    // 图像加载事件监听
    document.getElementById('decodeImageFileInput').addEventListener('change', decodeLoadImageFile);
    document.getElementById('decodeLoadImageButton').addEventListener('click', decodeLoadImageURL);
    if (!applicationState.isOnPhone) {
        window.addEventListener('paste', decodeLoadImageFromClipboard);
        document.body.addEventListener('drop', decodeLoadImageFromDrag);
    } else {
        document.getElementById('decodePasteButtonInput').addEventListener('click', decodeLoadImageFromPasteButton);
    }
    // 参数调整事件监听
    document.getElementById('decodeThresholdRange').addEventListener('input', decodeSetThreshold);
    document.getElementById('decodeMethodSelect').addEventListener('change', decodeSetCoverMethod);
    document.getElementById('decodeReverseInput').addEventListener('change', decodeSetReverse);

    // 保存图像
    document.getElementById('decodeSaveImageButton').addEventListener('click', decodeSaveImage);
    document.getElementById('decodeSaveSrcImageButton').addEventListener('click', decodeSaveSrcImage);

    // 禁用滚动
    document.getElementById('decodeThresholdRange').addEventListener('mousedown', disableScroll);

    // 切换页面
    document.getElementById('encodeButton').addEventListener('click', switchPage);
}

// 移除解码事件监听器
function decodeRemoveEventListeners() {
    document.getElementById('decodeImageFileInput').removeEventListener('change', decodeLoadImageFile);
    document.getElementById('decodeLoadImageButton').removeEventListener('click', decodeLoadImageURL);
    if (!applicationState.isOnPhone) {
        window.removeEventListener('paste', decodeLoadImageFromClipboard);
        document.body.removeEventListener('drop', decodeLoadImageFromDrag);
    } else {
        document.getElementById('decodePasteButtonInput').removeEventListener('click', decodeLoadImageFromPasteButton);
    }
    document.getElementById('decodeThresholdRange').removeEventListener('input', decodeSetThreshold);
    document.getElementById('decodeMethodSelect').removeEventListener('change', decodeSetCoverMethod);
    document.getElementById('decodeReverseInput').removeEventListener('change', decodeSetReverse);
    document.getElementById('decodeSaveImageButton').removeEventListener('click', decodeSaveImage);
    document.getElementById('decodeSaveSrcImageButton').removeEventListener('click', decodeSaveSrcImage);
    document.getElementById('decodeThresholdRange').removeEventListener('mousedown', disableScroll);
    document.getElementById('encodeButton').removeEventListener('click', switchPage);
}
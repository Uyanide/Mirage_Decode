// 从文件加载里图
function encodeLoadInnerImageFile(event) {
    errorHandling.currCanvasIndex = 1;
    const file = event.target.files[0];
    updateImageFromFile(file, (img) => {
        mirageProcessor.mirageEncoder.updateInnerImage(img);
    });
    event.target.value = '';
}

// 从文件加载表图
function encodeLoadCoverImageFile(event) {
    errorHandling.currCanvasIndex = 2;
    const file = event.target.files[0];
    updateImageFromFile(file, (img) => {
        mirageProcessor.mirageEncoder.updateCoverImage(img);
    });
    event.target.value = '';
}

// 从剪贴板加载表里图
var mouseX = 0;
function updateMousePosition(event) {
    mouseX = event.clientX;
}
function encodeLoadImageFromClipboard(event) {
    if (mouseX < window.innerWidth / 2) {
        errorHandling.currCanvasIndex = 1;
        updateImageFromClipboard(event, (img) => {
            mirageProcessor.mirageEncoder.updateInnerImage(img);
        });
    } else {
        errorHandling.currCanvasIndex = 2;
        updateImageFromClipboard(event, (img) => {
            mirageProcessor.mirageEncoder.updateCoverImage(img);
        });
    }
}

// 从拖动加载里图
function encodeLoadInnerImageFromDrag(event) {
    errorHandling.currCanvasIndex = 1;
    dragDropLoadImage(event, (img) => {
        mirageProcessor.mirageEncoder.updateInnerImage(img);
    });
}

// 从拖动加载表图
function encodeLoadCoverImageFromDrag(event) {
    errorHandling.currCanvasIndex = 2;
    dragDropLoadImage(event, (img) => {
        mirageProcessor.mirageEncoder.updateCoverImage(img);
    });
}

// 设置里图色阶
function encodeSetInnerThreshold() {
    const slider = document.getElementById('innerThresholdRange');
    const text = document.getElementById('innerThresholdInput');
    mirageProcessor.mirageEncoder.innerThreshold = parseInt(slider.value, 10);
    text.value = mirageProcessor.mirageEncoder.innerThreshold;
    if (mirageProcessor.mirageEncoder.innerThreshold > mirageProcessor.mirageEncoder.coverThreshold) {
        mirageProcessor.mirageEncoder.innerThreshold = mirageProcessor.mirageEncoder.coverThreshold;
        slider.value = mirageProcessor.mirageEncoder.coverThreshold;
        text.value = mirageProcessor.mirageEncoder.coverThreshold;
        text.style.color = '#ff5e5e';
    } else {
        text.style.color = '#dfdfdf';
    }
    if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
        mirageProcessor.mirageEncoder.processImage();
    }
}

// 设置表图色阶
function encodeSetCoverThreshold() {
    const slider = document.getElementById('coverThresholdRange');
    const text = document.getElementById('coverThresholdInput');
    mirageProcessor.mirageEncoder.coverThreshold = parseInt(slider.value, 10);
    text.value = mirageProcessor.mirageEncoder.coverThreshold;
    if (mirageProcessor.mirageEncoder.innerThreshold > mirageProcessor.mirageEncoder.coverThreshold) {
        mirageProcessor.mirageEncoder.coverThreshold = mirageProcessor.mirageEncoder.innerThreshold;
        slider.value = mirageProcessor.mirageEncoder.innerThreshold;
        text.value = mirageProcessor.mirageEncoder.innerThreshold;
        text.style.color = '#ff5e5e';
    } else {
        text.style.color = '#dfdfdf';
    }
    if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
        mirageProcessor.mirageEncoder.processImage();
    }
}

// 设置里图色阶输入
let innerInputTimeout;
function encodeSetInnerThresholdInput() {
    clearTimeout(innerInputTimeout);
    setTimeout(function () {
        const input = document.getElementById('innerThresholdInput');
        const slider = document.getElementById('innerThresholdRange');
        input.style.color = '#dfdfdf';
        const inputVal = parseInt(input.value, 10);
        if (isNaN(inputVal)) {
            return;
        }
        mirageProcessor.mirageEncoder.innerThreshold = inputVal;
        if (mirageProcessor.mirageEncoder.innerThreshold > 128) {
            mirageProcessor.mirageEncoder.innerThreshold = 128;
            input.value = 128;
        } else if (mirageProcessor.mirageEncoder.innerThreshold < 0) {
            mirageProcessor.mirageEncoder.innerThreshold = 0;
            input.value = 0;
        }
        slider.value = mirageProcessor.mirageEncoder.innerThreshold;
        if (mirageProcessor.mirageEncoder.innerThreshold > mirageProcessor.mirageEncoder.coverThreshold) {
            mirageProcessor.mirageEncoder.innerThreshold = mirageProcessor.mirageEncoder.coverThreshold;
            slider.value = mirageProcessor.mirageEncoder.coverThreshold;
            input.value = mirageProcessor.mirageEncoder.coverThreshold;
        }
        if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
            mirageProcessor.mirageEncoder.processImage();
        }
    }, 500);
}

// 设置表图色阶输入
let coverInputTimeout;
function encodeSetCoverThresholdInput() {
    clearTimeout(coverInputTimeout);
    setTimeout(function () {
        const input = document.getElementById('coverThresholdInput');
        const slider = document.getElementById('coverThresholdRange');
        input.style.color = '#dfdfdf';
        const inputVal = parseInt(input.value, 10);
        if (isNaN(inputVal)) {
            return;
        }
        mirageProcessor.mirageEncoder.coverThreshold = inputVal;
        if (mirageProcessor.mirageEncoder.coverThreshold > 128) {
            mirageProcessor.mirageEncoder.coverThreshold = 128;
            input.value = 128;
        } else if (mirageProcessor.mirageEncoder.coverThreshold < 0) {
            mirageProcessor.mirageEncoder.coverrThreshold = 0;
            input.value = 0;
        }
        slider.value = mirageProcessor.mirageEncoder.coverThreshold;
        if (mirageProcessor.mirageEncoder.innerThreshold > mirageProcessor.mirageEncoder.coverThreshold) {
            mirageProcessor.mirageEncoder.coverThreshold = mirageProcessor.mirageEncoder.innerThreshold;
            slider.value = mirageProcessor.mirageEncoder.coverThreshold;
            input.value = mirageProcessor.mirageEncoder.coverThreshold;
        }
        if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
            mirageProcessor.mirageEncoder.processImage();
        }
    }, 500);
}

// 设置表图是否取灰度
function encodeSetCoverGray(event) {
    mirageProcessor.mirageEncoder.isCoverGray = event.target.checked;
    if (mirageProcessor.mirageEncoder.coverImg && mirageProcessor.mirageEncoder.innerImg) {
        mirageProcessor.mirageEncoder.updateCoverImage(mirageProcessor.mirageEncoder.coverImg);
    }
}

// 设置是否反向隐写
function encodeSetEncodeReverse(event) {
    mirageProcessor.mirageEncoder.isEncodeReverse = event.target.checked;
    if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
        mirageProcessor.mirageEncoder.processImage();
    }
}

// 设置像素混合方式
function encodeSetMethod(event) {
    mirageProcessor.mirageEncoder.method = event.target.value;
    if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
        mirageProcessor.mirageEncoder.updateInnerImage(mirageProcessor.mirageEncoder.innerImg);
    }
}

// 设置输出图像大小
let sizeInputTimeout;
function encodeSetSize(event) {
    clearTimeout(sizeInputTimeout);

    sizeInputTimeout = setTimeout(function () {
        mirageProcessor.mirageEncoder.size = parseInt(event.target.value, 10);
        if (isNaN(mirageProcessor.mirageEncoder.size)) {
            return;
        }
        if (mirageProcessor.mirageEncoder.size > 4000) {
            mirageProcessor.mirageEncoder.size = 4000;
            event.target.value = 4000;
        } else if (mirageProcessor.mirageEncoder.size < 100) {
            mirageProcessor.mirageEncoder.size = 100;
            event.target.value = 100;
        }
        if (mirageProcessor.mirageEncoder.innerImg) {
            mirageProcessor.mirageEncoder.updateInnerImage(mirageProcessor.mirageEncoder.innerImg);
        }
    }, 500);
}

// 设置保存类型
function setSaveType(event) {
    applicationState.isPng = event.target.checked;
}

// 保存图像
function encodeSaveImage() {
    saveImageFromCanvas('outputCanvas', applicationState.isPng);
}

// 以当前结果跳转显形界面
function jumpToDecode() {
    if (mirageProcessor.mirageEncoder.innerImg && mirageProcessor.mirageEncoder.coverImg) {
        document.getElementById('decodeReverseInput').checked = mirageProcessor.mirageEncoder.isEncodeReverse;
        mirageProcessor.mirageDecoder.reverse = mirageProcessor.mirageEncoder.isEncodeReverse;
        if (mirageProcessor.mirageDecoder.reverse) {
            document.getElementById('decodeThresholdRange').value = 255 - mirageProcessor.mirageEncoder.innerThreshold;
            mirageProcessor.mirageDecoder.threshold = 255 - mirageProcessor.mirageEncoder.innerThreshold;
        } else {
            document.getElementById('decodeThresholdRange').value = mirageProcessor.mirageEncoder.innerThreshold;
            mirageProcessor.mirageDecoder.threshold = mirageProcessor.mirageEncoder.innerThreshold;
        }
        const canvas = document.getElementById('outputCanvas');
        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        img.onload = function () {
            mirageProcessor.mirageDecoder.updateImage(img);
            switchPage();
        };
    }
}

// 设置编码事件监听器
function encodeSetUpEventListeners() {

    document.getElementById('decodeButton').addEventListener('click', switchPage);

    document.getElementById('innerSourceFileInput').addEventListener('change', encodeLoadInnerImageFile);
    document.getElementById('coverSourceFileInput').addEventListener('change', encodeLoadCoverImageFile);
    if (!applicationState.isOnPhone) {
        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('paste', encodeLoadImageFromClipboard);

        document.getElementById('innerCanvas').addEventListener('drop', encodeLoadInnerImageFromDrag);
        document.getElementById('coverCanvas').addEventListener('drop', encodeLoadCoverImageFromDrag);
    }

    document.getElementById('innerThresholdRange').addEventListener('input', encodeSetInnerThreshold);
    document.getElementById('coverThresholdRange').addEventListener('input', encodeSetCoverThreshold);
    document.getElementById('innerThresholdInput').addEventListener('input', encodeSetInnerThresholdInput);
    document.getElementById('coverThresholdInput').addEventListener('input', encodeSetCoverThresholdInput);
    document.getElementById('innerThresholdRange').addEventListener('mousedown', disableScroll);
    document.getElementById('coverThresholdRange').addEventListener('mousedown', disableScroll);

    document.getElementById('isCoverGrayCheckBox').addEventListener('change', encodeSetCoverGray);
    document.getElementById('isEncodeReverseCheckBox').addEventListener('change', encodeSetEncodeReverse);

    document.getElementById('encodeMethodSelect').addEventListener('change', encodeSetMethod);
    document.getElementById('encodeSizeInput').addEventListener('input', encodeSetSize);

    document.getElementById('isPngCheckBox').addEventListener('change', setSaveType);
    document.getElementById('jumpToDecodeButton').addEventListener('click', jumpToDecode);
    document.getElementById('encodeSaveImageButton').addEventListener('click', encodeSaveImage);
}

// 移除编码事件监听器
function encodeRemoveEventListeners() {
    document.getElementById('decodeButton').removeEventListener('click', switchPage);
    document.getElementById('innerSourceFileInput').removeEventListener('change', encodeLoadInnerImageFile);
    document.getElementById('coverSourceFileInput').removeEventListener('change', encodeLoadCoverImageFile);
    if (!applicationState.isOnPhone) {
        window.removeEventListener('mousemove', updateMousePosition);
        window.removeEventListener('paste', encodeLoadImageFromClipboard);
        document.getElementById('innerCanvas').removeEventListener('drop', encodeLoadInnerImageFromDrag);
        document.getElementById('coverCanvas').removeEventListener('drop', encodeLoadCoverImageFromDrag);
    }
    document.getElementById('innerThresholdRange').removeEventListener('input', encodeSetInnerThreshold);
    document.getElementById('coverThresholdRange').removeEventListener('input', encodeSetCoverThreshold);
    document.getElementById('innerThresholdInput').removeEventListener('input', encodeSetInnerThresholdInput);
    document.getElementById('coverThresholdInput').removeEventListener('input', encodeSetCoverThresholdInput);
    document.getElementById('innerThresholdRange').removeEventListener('mousedown', disableScroll);
    document.getElementById('coverThresholdRange').removeEventListener('mousedown', disableScroll);
    document.getElementById('isCoverGrayCheckBox').removeEventListener('change', encodeSetCoverGray);
    document.getElementById('isEncodeReverseCheckBox').removeEventListener('change', encodeSetEncodeReverse);
    document.getElementById('encodeMethodSelect').removeEventListener('change', encodeSetMethod);
    document.getElementById('encodeSizeInput').removeEventListener('input', encodeSetSize);
    document.getElementById('isPngCheckBox').removeEventListener('change', setSaveType);
    document.getElementById('jumpToDecodeButton').removeEventListener('click', jumpToDecode);
    document.getElementById('encodeSaveImageButton').removeEventListener('click', encodeSaveImage);
}
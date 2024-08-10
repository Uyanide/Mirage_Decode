import ImageLoader from './ImageLoader.js';

// 调整侧边栏宽度
function disableHorizontalScroll() {
    document.documentElement.style.overflowX = 'hidden';
}
function enableHorizontalScroll() {
    document.documentElement.style.overflowX = 'auto';
}
function hideSidebarFullscreen(event) {
    if (!document.getElementById('isDarkmodeContainer').contains(event.target) && (event.target.id == 'sidebarToggleButton' || !document.getElementById('sidebar').contains(event.target))) {
        hideSidebar();
    }
}
const showSidebar = () => {
    applicationState.sidebarVisible = true;
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('sidebarHide');
    sidebar.classList.add('sidebarShow');
    setTimeout(() => {
        document.addEventListener('click', hideSidebarFullscreen);
    }, 500);
    sidebar.removeEventListener('click', showSidebar);
}
const hideSidebar = () => {
    if (applicationState.dontCareSidebarClick) {
        applicationState.dontCareSidebarClick = false;
        return;
    }
    applicationState.sidebarVisible = false;
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('sidebarShow');
    sidebar.classList.add('sidebarHide');
    document.removeEventListener('click', hideSidebarFullscreen);
    setTimeout(() => {
        sidebar.addEventListener('click', showSidebar);
    }, 500);
}
function adjustSidebarWidth(event) {
    if (!applicationState.sidebarVisible) {
        showSidebar();
        return;
    }
    disableHorizontalScroll();
    const initWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
    const initX = event.clientX || event.touches[0].clientX;
    const parentWidth = document.documentElement.getBoundingClientRect().width;
    const minWidth = parentWidth * 0.1;
    const maxWidth = parentWidth * 0.7;
    let offset = 0;

    const adjustMouse = (event) => {
        applicationState.dontCareSidebarClick = true;
        offset = event.clientX - initX;
        const newWidth = Math.min((Math.max((parseInt(initWidth) - offset), minWidth)), maxWidth);
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const adjustTouch = (event) => {
        applicationState.dontCareSidebarClick = true;
        offset = event.touches[0].clientX - initX;
        const newWidth = Math.min((Math.max((parseInt(initWidth) - offset), minWidth)), maxWidth);
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const adjustEnd = () => {
        document.removeEventListener('mousemove', adjustMouse);
        document.removeEventListener('mouseup', adjustEnd);
        document.removeEventListener('touchmove', adjustTouch);
        document.removeEventListener('touchend', adjustEnd);
        enableHorizontalScroll();
    }

    applicationState.dontCareSidebarClick = false;
    if (!applicationState.isOnPhone) {
        document.addEventListener('mousemove', adjustMouse);
        document.addEventListener('mouseup', adjustEnd);
    } else {
        document.addEventListener('touchmove', adjustTouch);
        document.addEventListener('touchend', adjustEnd);
    }
}

// 设置是否读取元数据
function setReadMetadata(event) {
    applicationState.isReadMetadata = event.target.checked;
}

// 处理文件队列
async function decodeProcessList(fileList) {
    let first = PrismProcessor.DecodeList.getListLength();
    if (first >= applicationState.defaultArguments.maxListSize) {
        PrismProcessor.DecodeList.clear();
        first = 0;
    }
    const promises = fileList.map((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    PrismProcessor.DecodeList.appendList(img);
                    resolve();
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    await Promise.all(promises);
    if (fileList.length > 1) {
        showSidebar();
    }

    const canvas = document.getElementById(`nr${first}`);
    if (canvas) {
        canvas.dispatchEvent(new Event('click'));
    } else {
        PrismProcessor.PrismDecoder.clearCanvas();
    }
}

// 从文件加载图像
async function decodeLoadImageFile(event) {
    const fileList = event.target.files;
    if (fileList.length === 0) {
        return;
    }
    try {
        await decodeProcessList(Array.from(fileList));
        event.target.value = '';
    } catch (error) {
        console.error('Failed to load image:', error.stack, error.message);
        alert('加载图像失败！' + error.message);
    }
}

// 从URL加载图像
function decodeLoadImageURL(event) {
    errorHandling.currCanvasIndex = 0;
    ImageLoader.updateImageFromURL(event, (img) => {
        PrismProcessor.DecodeList.appendList(img);
        document.getElementById(`nr${PrismProcessor.DecodeList.getListLength() - 1}`).dispatchEvent(new Event('click'));
    });
    event.target.previousElementSibling.value = '';
}

// 从剪贴板加载图像
async function decodeLoadImageFromClipboard(event) {
    try {
        const files = [];
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                files.push(blob);
            }
        }
        if (files.length === 0) {
            return;
        }
        await decodeProcessList(files);
    } catch (error) {
        alert('图像加载失败：' + error.message);
        console.error('Failed to load image:', error.stack, error.message);
    }
}

// 从粘贴按钮加载图像
function decodeLoadImageFromPasteButton() {
    errorHandling.currCanvasIndex = 0;
    document.body.focus();
    ImageLoader.updateImageFromClipboardDirect((img) => {
        PrismProcessor.DecodeList.appendList(img);
        document.getElementById(`nr${PrismProcessor.DecodeList.getListLength() - 1}`).dispatchEvent(new Event('click'));
    });
}

// 从拖动加载图像
async function decodeLoadImageFromDrag(event) {
    try {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length === 0) {
            return;
        }
        await decodeProcessList(Array.from(files));
    } catch (error) {
        alert('图像加载失败：' + error.message);
        console.error('Failed to load image:', error.stack, error.message);
    }
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
    document.getElementById('optionSelect').addEventListener('change', decodeSetCoverMethod);
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
    document.getElementById('optionSelect').removeEventListener('change', decodeSetCoverMethod);
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
    decodeRemoveEventListeners,
    adjustSidebarWidth,
    showSidebar,
    hideSidebar
};

export default DecodeListeners;
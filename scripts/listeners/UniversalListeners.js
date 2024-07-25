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

applicationState.currCanvasIndex = 0;
function handleImageLoadError(error, callback) {
    console.error('图像加载失败:', error);
    alert('无法加载图像, 请确定文件类型和状态。');
    if (errorHandling.defaultImg[errorHandling.currCanvasIndex].src) {
        const img = new Image();
        img.src = copyImage(errorHandling.defaultImg[errorHandling.currCanvasIndex]);
        img.onload = () => {
            callback(img);
        };
    }
}

function setDecodeValues(isReverse, threshold) {
    document.getElementById('decodeReverseInput').checked = isReverse;
    mirageProcessor.mirageDecoder.reverse = isReverse;
    if (isReverse) {
        document.getElementById('decodeThresholdRange').value = 255 - threshold;
        mirageProcessor.mirageDecoder.threshold = 255 - threshold;
    } else {
        document.getElementById('decodeThresholdRange').value = threshold;
        mirageProcessor.mirageDecoder.threshold = threshold;
    }
}

function setDecodeValuesWithMetadata(img) {
    const exif = piexif.load(img.src);
    const infoString = exif['0th'][piexif.ImageIFD.Make];
    console.log('读取元数据:', infoString);
    if (infoString) {
        const isReverse = infoString[0] === '1';
        const innerThreshold = parseInt(infoString.slice(1), 16);
        if (isReverse && innerThreshold) {
            setDecodeValues(isReverse, innerThreshold);
        }
    }
}

// 从源加载图像并返回
async function loadImage(input, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let timer;

        img.onload = () => {
            clearTimeout(timer);
            if (errorHandling.currCanvasIndex === 0 && img.src.startsWith('data:image/jpeg;base64,')) {
                setDecodeValuesWithMetadata(img);
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
    loadImage(file).then((img) => {
        callback(img);
    }).catch((error) => {
        handleImageLoadError(error, callback);
    });
}

// 从URL加载图像，调用callback
async function updateImageFromURL(event, callback) {
    const imageUrl = event.target.previousElementSibling.value;
    loadImage(imageUrl).then((img) => {
        callback(img);
    }).catch((error) => {
        handleImageLoadError(error, callback);
    });
}

// 从剪贴板更新图像，调用callback
async function updateImageFromClipboard(event, callback) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            loadImage(blob).then((img) => {
                callback(img);
            }).catch((error) => {
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
                if (item.types.includes('image/png')) {
                    const blob = await item.getType('image/png');
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => {
                        callback(img);
                    };
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
                loadImage(file).then((img) => {
                    callback(img);
                }).catch((error) => {
                    handleImageLoadError(error, callback);
                });
            }
        }
    }
}

// 禁用滚动
applicationState.scrollPosition = 0;
function disableScroll() {
    document.addEventListener('mouseup', enableScroll);
    applicationState.scrollPosition = window.scrollY;
    window.onscroll = function () {
        window.scrollTo(0, applicationState.scrollPosition);
    };
}

// 恢复滚动
function enableScroll() {
    window.onscroll = null;
    document.removeEventListener('mouseup', enableScroll);
}

// 保存图像
function downloadFromLink(url, link, fileName) {
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function generateUrlFromCanvas(canvasId, isPng = true) {
    const canvas = document.getElementById(canvasId);
    if (isPng) {
        return canvas.toDataURL('image/png');
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
        return writeMetadata(
            `data:image/jpeg;base64,${btoa(binary)}`,
            mirageProcessor.mirageEncoder.isEncodeReverse,
            mirageProcessor.mirageEncoder.innerThreshold);
    }
}
function saveImageFromCanvas(canvasId, isPng = true) {
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    const canvas = document.getElementById(canvasId);
    const fileName = `output_${timestamp}.${isPng ? 'png' : 'jpg'}`;
    downloadFromLink(generateUrlFromCanvas(canvasId, isPng), link, fileName);
}

// 写入元数据（照相机信息）
function writeMetadata(imgURL, isReverse, innerThreshold) {
    const infoString = (isReverse ? '1' : '0') + innerThreshold.toString(16).padStart(2, '0');
    console.log('写入元数据:', infoString);
    let zeroth = {};
    zeroth[piexif.ImageIFD.Make] = infoString;
    const exifObj = { '0th': zeroth };
    const exifbytes = piexif.dump(exifObj);
    const inserted = piexif.insert(exifbytes, imgURL);
    return inserted;
}

// 切换页面显示
function switchPage() {
    var decodePage = document.getElementById('decodePage');
    var encodePage = document.getElementById('encodePage');
    var decodeButton = document.getElementById('decodeButton');
    var encodeButton = document.getElementById('encodeButton');
    if (applicationState.currPageId === 'decodePage') {
        encodePage.style.display = 'flex';
        decodePage.style.display = 'none';
        decodeButton.classList.remove('PageSwitchButtonSelected');
        decodeButton.classList.add('PageSwitchButtonUnselected');
        encodeButton.classList.remove('PageSwitchButtonUnselected');
        encodeButton.classList.add('PageSwitchButtonSelected');
        decodeRemoveEventListeners();
        encodeSetUpEventListeners();
        applicationState.currPageId = 'encodePage';
    } else {
        decodePage.style.display = 'flex';
        encodePage.style.display = 'none';
        decodeButton.classList.remove('PageSwitchButtonUnselected');
        decodeButton.classList.add('PageSwitchButtonSelected');
        encodeButton.classList.remove('PageSwitchButtonSelected');
        encodeButton.classList.add('PageSwitchButtonUnselected');
        decodeSetupEventListeners();
        encodeRemoveEventListeners();
        applicationState.currPageId = 'decodePage';
    }
}

function universalSetupEventListeners() {
    // 隐私政策按钮事件监听
    document.getElementById('togglePrivacyPolicy').addEventListener('click', (event) => {
        const privacyPolicy = document.getElementById('privacyPolicy');
        const state = window.getComputedStyle(privacyPolicy).display;
        if (state === 'none') {
            privacyPolicy.style.display = 'block';
            event.target.textContent = '隐藏使用须知';
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            privacyPolicy.style.display = 'none';
            event.target.textContent = '显示使用须知';
        }
    });

    // 禁用拖动默认事件
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
}
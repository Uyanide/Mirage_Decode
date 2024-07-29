errorHandling.userAgent = navigator.userAgent.toLowerCase();
applicationState.isOnPhone = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(errorHandling.userAgent);
applicationState.isDownloadNotSupported = applicationState.isOnPhone && /xiaomi|miui/i.test(errorHandling.userAgent);
applicationState.isOnTiebaBrowser = /tieba/i.test(errorHandling.userAgent);
// applicationState.isOnPhone = true;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (applicationState.isOnTiebaBrowser) {
            document.body.innerHTML = '<h1>请点击右上角<br>用浏览器打开</h1><img src="https://gsp0.baidu.com/5aAHeD3nKhI2p27j8IqW0jdnxx1xbK/tb/editor/images/client/image_emoticon1.png"></img>';
            return;
        }
        // 版本显示
        const versionInfoElement = document.getElementById('versionInfo');
        if (versionInfoElement) {
            versionInfoElement.innerHTML = `version: <b>${applicationState.version}</b>`;
        }

        // 加载默认参数
        let path = document.getElementById('jsonPath').getAttribute('data-json-path');
        path = path + '?v=' + applicationState.version;
        applicationState.defaultArguments = new DefaultArguments();
        await applicationState.defaultArguments.loadDefaultArguments(path);
        applicationState.defaultArguments.setDefaultValues();
        applicationState.isPng = applicationState.defaultArguments.isPng;
        applicationState.currPageId = applicationState.defaultArguments.defaultPageId;
        applicationState.isReadMetadata = applicationState.defaultArguments.isReadMetadata;

        // 实例化解码器和编码器
        PrismProcessor.PrismDecoder = new PrismDecoder('decodeCanvas', applicationState.defaultArguments);
        PrismProcessor.PrismEncoder = new PrismEncoder('innerCanvas', 'coverCanvas', 'outputCanvas', applicationState.defaultArguments);

        // 加载默认图像
        errorHandling.defaultImg = [];
        for (let i = 0; i < applicationState.defaultArguments.defaultSrc.length; i++) {
            errorHandling.defaultImg[i] = new Image();
            errorHandling.defaultImg[i].crossOrigin = 'anonymous';
            const timer = setTimeout(() => {
                errorHandling.defaultImg[i].src = '';
                errorHandling.defaultImg[i].onerror = null;
                console.error('加载默认图像超时: ' + applicationState.defaultArguments.defaultSrc[i]);
            }, 5000);
            errorHandling.defaultImg[i].onload = () => {
                clearTimeout(timer);
                switch (i) {
                    case 0:
                        PrismProcessor.PrismDecoder.updateImage(errorHandling.defaultImg[i]);
                        break;
                    case 1:
                        PrismProcessor.PrismEncoder.updateInnerImage(errorHandling.defaultImg[i]);
                        break;
                    case 2:
                        PrismProcessor.PrismEncoder.updateCoverImage(errorHandling.defaultImg[i]);
                        break;
                }
            };
            errorHandling.defaultImg[i].onerror = () => {
                clearTimeout(timer);
                console.error('无法加载默认图像: ' + applicationState.defaultArguments.defaultSrc[i]);
                errorHandling.defaultImg[i].src = '';
                errorHandling.defaultImg[i].onerror = null;
            };
            errorHandling.defaultImg[i].src = applicationState.defaultArguments.defaultSrc[i];
        }

        // 设置全局事件监听器
        universalSetupEventListeners();

        // 显示默认页面
        switch (applicationState.defaultArguments.defaultPageId) {
            case 'encodePage':
                encodeSetUpEventListeners();
                document.getElementById('decodePage').style.display = 'none';
                document.getElementById('encodePage').style.display = 'flex';
                document.getElementById('encodeButton').classList.add('PageSwitchButtonSelected');
                document.getElementById('decodeButton').classList.add('PageSwitchButtonUnselected');
                break;
            case 'decodePage':
                decodeSetupEventListeners();
                document.getElementById('encodePage').style.display = 'none';
                document.getElementById('decodePage').style.display = 'flex';
                document.getElementById('decodeButton').classList.add('PageSwitchButtonSelected');
                document.getElementById('encodeButton').classList.add('PageSwitchButtonUnselected');
                break;
        }

        if (applicationState.isOnPhone) {
            document.getElementById('decodePasteInput').style.display = 'none';
            document.getElementById('decodeDragInputHint').style.display = 'none';
            const elements = document.getElementsByClassName('encodeDrag');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
        } else {

            document.getElementById('decodePasteButton').style.display = 'none';
        }

        // byd小米浏览器另辟蹊径也下不了png, 幻影也用不了, 完大蛋
        if (applicationState.isDownloadNotSupported) {
            document.getElementById('isPng').style.display = 'none';
            document.getElementById('isCoverMirage').style.display = 'none';
            applicationState.isPng = false;
            PrismProcessor.PrismEncoder.isCoverMirage = false;
            const saveHints = document.getElementsByClassName('saveHint');
            for (let i = 0; i < saveHints.length; i++) {
                saveHints[i].innerText = '(请在弹出的窗口中长按保存)';
            }
        }
    } catch (error) {
        console.error('Failed to initialize: ' + error);
        alert('初始化失败: ' + error);
    }
});

errorHandling.scriptsLoaded.init = true;
import '../css/style.css';
import '../css/switch.css';

import PrismDecoder from './prismProcessor/PrismDecoder.js';
import PrismEncoder from './prismProcessor/PrismEncoder.js';
import UniversalListeners from './listeners/UniversalListeners.js';
import EncodeListeners from './listeners/EncodeListeners.js';
import DefaultArguments from './DefaultArguments.js';

import buta from '../res/buta.jpg';
import neko from '../res/neko.jpg';
import neta from '../res/neta.png';
import icon from '../res/neko.ico';

applicationState.defaultSrc = [neta, neko, buta];

errorHandling.userAgent = navigator.userAgent.toLowerCase();
applicationState.isOnPhone = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(errorHandling.userAgent);
applicationState.isDownloadNotSupported = applicationState.isOnPhone && /xiaomi|miui|ucbrowser|quark/i.test(errorHandling.userAgent);
applicationState.isDownloadNotPossible = applicationState.isOnPhone && /ucbrowser|quark/i.test(errorHandling.userAgent);
applicationState.isOnTiebaBrowser = /tieba/i.test(errorHandling.userAgent);
// applicationState.isOnPhone = true;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (applicationState.isOnTiebaBrowser) {
            document.body.innerHTML = '<h1>请点击右上角<br>用浏览器打开</h1><img src="https://gsp0.baidu.com/5aAHeD3nKhI2p27j8IqW0jdnxx1xbK/tb/editor/images/client/image_emoticon1.png"></img>';
            return;
        }
        if (applicationState.isDownloadNotPossible) {
            alert('由于浏览器限制，下载图片时可能会出现问题，建议使用其他浏览器，例如Chrome, Edge, Opera等');
        }

        // 显示图标
        const link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = icon;
        document.head.appendChild(link);

        // 版本显示
        const versionInfoElement = document.getElementById('versionInfo');
        if (versionInfoElement) {
            versionInfoElement.innerHTML = `version: <b>${applicationState.version}</b>`;
        }

        // 加载默认参数
        applicationState.defaultArguments = new DefaultArguments();
        await applicationState.defaultArguments.loadDefaultArguments();
        applicationState.defaultArguments.setDefaultValues();
        applicationState.isPng = applicationState.defaultArguments.isPng;
        applicationState.isReadMetadata = applicationState.defaultArguments.isReadMetadata;

        // 实例化解码器和编码器
        PrismProcessor.PrismDecoder = new PrismDecoder('decodeCanvas', applicationState.defaultArguments);
        PrismProcessor.PrismEncoder = new PrismEncoder('innerCanvas', 'coverCanvas', 'outputCanvas', applicationState.defaultArguments);

        // 加载默认图像
        errorHandling.defaultImg = [];
        for (let i = 0; i < applicationState.defaultSrc.length; i++) {
            errorHandling.defaultImg[i] = new Image();
            const timer = setTimeout(() => {
                errorHandling.defaultImg[i].src = '';
                errorHandling.defaultImg[i].onerror = null;
                console.error('加载默认图像超时: ' + applicationState.defaultSrc[i]);
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
                console.error('无法加载默认图像: ' + applicationState.defaultSrc[i]);
                errorHandling.defaultImg[i].src = '';
                errorHandling.defaultImg[i].onerror = null;
            };
            errorHandling.defaultImg[i].src = applicationState.defaultSrc[i];
        }

        // 设置全局事件监听器
        UniversalListeners.universalSetupEventListeners();

        // 显示默认页面
        applicationState.currPageId = applicationState.defaultArguments.defaultPageId === 'encodePage' ? 'decodePage' : 'encodePage';
        EncodeListeners.switchPage();

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
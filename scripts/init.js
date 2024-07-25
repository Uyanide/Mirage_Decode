applicationState.isOnPhone = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', async () => {
    try {
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
        applicationState.currPageId = applicationState.defaultArguments.defaultPageId;
        applicationState.isReadMetadata = applicationState.defaultArguments.isReadMetadata;

        // 实例化解码器和编码器
        mirageProcessor.mirageDecoder = new MirageDecoder('decodeCanvas', applicationState.defaultArguments);
        mirageProcessor.mirageEncoder = new MirageEncoder('innerCanvas', 'coverCanvas', 'outputCanvas', applicationState.defaultArguments);

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
                        mirageProcessor.mirageDecoder.updateImage(errorHandling.defaultImg[i]);
                        break;
                    case 1:
                        mirageProcessor.mirageEncoder.updateInnerImage(errorHandling.defaultImg[i]);
                        break;
                    case 2:
                        mirageProcessor.mirageEncoder.updateCoverImage(errorHandling.defaultImg[i]);
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
    } catch (error) {
        console.error('Failed to initialize: ' + error);
        alert('初始化失败: ' + error);
    }
});
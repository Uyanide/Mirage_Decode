import DecodeListeners from "./DecodeListeners";

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

    // 版本记录按钮事件监听
    document.getElementById('toggleVersionRecord').addEventListener('click', (event) => {
        const changelog = document.getElementById('versionRecordTable');
        const state = window.getComputedStyle(changelog).display;
        if (state === 'none') {
            changelog.style.display = 'block';
            event.target.textContent = '隐藏主要更新记录';
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            changelog.style.display = 'none';
            event.target.textContent = '显示主要更新记录';
        }
    });

    // 禁用拖动默认事件
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    // 切换明暗模式
    document.getElementById('isDarkmodeCheckbox').addEventListener('change', (event) => {
        const theme = event.target.checked ? 'dark' : 'light';
        applyTheme(theme);
    });

    document.getElementById('sidebarToggleButton').addEventListener(applicationState.isOnPhone ? 'touchstart' : 'mousedown', DecodeListeners.adjustSidebarWidth);
    document.getElementById('sidebar').addEventListener('click', DecodeListeners.showSidebar);

    document.getElementById('downloadHtmlLink').addEventListener('click', () => {
        PrismProcessor.DecodeList.clear();

        const currentHtml = document.documentElement.outerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHtml, 'text/html');
        const sourceElement = doc.getElementById('bodyContent');
        const newDoc = document.implementation.createHTMLDocument('Filtered Document');
        newDoc.head.innerHTML = doc.head.innerHTML;

        const script = newDoc.head.appendChild(newDoc.createElement('script'));
        script.innerHTML = 'applicationState.isOffline = true;';

        doc.body.classList.forEach(cls => newDoc.body.classList.add(cls));

        newDoc.body.appendChild(newDoc.importNode(sourceElement, true));

        const a = document.createElement('a');
        a.download = 'prism_uyanide.html';
        a.href = URL.createObjectURL(new Blob([newDoc.documentElement.outerHTML], { type: 'text/html' }));
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    });
}

const UniversalListeners = {
    universalSetupEventListeners,
};

export default UniversalListeners;
import DecodeListeners from './DecodeListeners';

function universalSetupEventListeners() {
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
}

const UniversalListeners = {
    universalSetupEventListeners,
};

export default UniversalListeners;

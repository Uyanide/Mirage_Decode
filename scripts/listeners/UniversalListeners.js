// (function (root, factory) {
//     if (typeof define === 'function' && define.amd) {
//         define([
//             './DecodeListeners.js',
//             './EncodeListeners.js'
//         ], factory);
//     }
//     else if (typeof module === 'object' && module.exports) {
//         module.exports = factory(
//             require(
//                 './DecodeListeners.js',
//                 './EncodeListeners.js'
//             ),
//         );
//     }
//     else {
//         root.UniversalListeners = factory(
//             root.DecodeListeners,
//             root.EncodeListeners
//         );
//     }
// }(typeof self !== 'undefined' ? self : this, function (DecodeListeners, EncodeListeners) {

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
}

//     return {
//         universalSetupEventListeners,
//     };

// }));

const UniversalListeners = {
    universalSetupEventListeners,
};

export default UniversalListeners;

errorHandling.scriptsLoaded.UniversalListeners = true;
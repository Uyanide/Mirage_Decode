import EncodeListeners from './EncodeListeners';
import ImageLoader from './ImageLoader.js';
import DecodeListeners from './DecodeListeners.js';

export default class DecodeList {
    constructor(sidebarContent, amountLabel, clearButton) {
        this._list = [];
        this._sidebarContent = document.getElementById(sidebarContent);
        this._amountLabel = document.getElementById(amountLabel);
        this._clearButton = document.getElementById(clearButton);
        this._clearButton.addEventListener('click', this.clear);
    }

    getListLength = () => {
        return this._list.length;
    };

    appendList = (img, params) => {
        const canvas = document.createElement('canvas');
        let pushed = false,
            append = false;
        try {
            canvas.id = `nr${this._list.length}`;
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
            if (applicationState.isReadMetaData) {
            }
            this._list.push({
                canvas: canvas,
                img: img,
                parameters: params,
            });
            pushed = true;
            this._sidebarContent.appendChild(canvas);
            append = true;
            canvas.addEventListener('click', this._decode);
            this._amountLabel.innerText = `数量: ${this._list.length}`;
        } catch (error) {
            if (pushed) {
                this._list.pop();
            }
            if (append) {
                this._sidebarContent.removeChild(canvas);
            }
            console.error('Append list failed:', error.stack, error.message);
            alert('图像加载失败！' + error.message ?? '');
        }
    };

    _decode = (event) => {
        if (applicationState.currPageId !== 'decodePage') {
            EncodeListeners.switchPage();
        }
        if (applicationState.isOnPhone) {
            DecodeListeners.hideSidebar();
        }
        try {
            const index = parseInt(event.target.id.slice(2));
            if (this._selected !== undefined) {
                const prev = document.getElementById('nr' + this._selected);
                if (prev) {
                    prev.classList.remove('canvasSelected');
                }
            }
            event.target.classList.add('canvasSelected');
            this._selected = index;
            ImageLoader.setDecodeValues(this._list[index].parameters);
            PrismProcessor.PrismDecoder.updateImage(this._list[event.target.id.slice(2)].img);
        } catch (error) {
            console.error('Decode from list failed:', error.stack, error.message);
            alert('加载失败！' + error.message ?? '');
        }
    };

    clear = () => {
        this._list.forEach((item) => {
            if (item.canvas !== undefined) {
                this._sidebarContent.removeChild(item.canvas);
            }
        });
        this._list = [];
        this._amountLabel.innerText = '数量: 0';
        this._selected = undefined;
    };
}

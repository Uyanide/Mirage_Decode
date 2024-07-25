class DefaultArguments {
    async loadDefaultArguments() {
        try {
            const response = await fetch('DefaultArguments.json?v=' + applicationState.version);
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            const defaultArguments = await response.json();
            this.isReadMetadata = defaultArguments.isReadMetadata;
            this.decodeThreshold = defaultArguments.decodeThreshold;
            this.isDecodeReverse = defaultArguments.isDecodeReverse;
            this.decodeMethod = defaultArguments.decodeMethod;
            this.innerThreshold = defaultArguments.innerThreshold;
            this.coverThreshold = defaultArguments.coverThreshold;
            this.isCoverGray = defaultArguments.isCoverGray;
            this.isEncodeReverse = defaultArguments.isEncodeReverse;
            this.isPng = defaultArguments.isPng;
            this.encodeMethod = defaultArguments.encodeMethod;
            this.size = defaultArguments.size;
            this.defaultPageId = defaultArguments.defaultPageId;
            this.defaultSrc = defaultArguments.defaultSrc;
        } catch (error) {
            console.error('加载默认参数失败:', error);
        }
    }

    setDefaultValues() {
        document.getElementById('isReadMetadataCheckBox').checked = this.isReadMetadata;
        document.getElementById('decodeThresholdRange').value = this.decodeThreshold;
        document.getElementById('decodeReverseInput').checked = this.isDecodeReverse;
        document.getElementById('optionSelect').value = this.decodeMethod;

        document.getElementById('innerThresholdRange').value = this.innerThreshold;
        document.getElementById('innerThresholdInput').value = this.innerThreshold;
        document.getElementById('coverThresholdRange').value = this.coverThreshold;
        document.getElementById('coverThresholdInput').value = this.coverThreshold;

        document.getElementById('isCoverGrayCheckBox').checked = this.isCoverGray;
        document.getElementById('isEncodeReverseCheckBox').checked = this.isEncodeReverse;
        document.getElementById('isPngCheckBox').checked = this.isPng;
        document.getElementById('encodeMethodSelect').value = this.encodeMethod;
        document.getElementById('encodeSizeInput').value = this.size;
    }
}
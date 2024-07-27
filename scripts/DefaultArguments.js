class DefaultArguments {
    async loadDefaultArguments(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            const defaultArguments = await response.json();
            this.isReadMetadata = defaultArguments.isReadMetadata;
            this.decodeThreshold = defaultArguments.decodeThreshold;
            this.isDecodeReverse = defaultArguments.isDecodeReverse;
            this.decodeMethod = defaultArguments.decodeMethod;
            this.decodeContrast = defaultArguments.decodeContrast;

            this.innerThreshold = defaultArguments.innerThreshold;
            this.coverThreshold = defaultArguments.coverThreshold;
            this.isCoverGray = defaultArguments.isCoverGray;
            this.isEncodeReverse = defaultArguments.isEncodeReverse;
            this.isPng = defaultArguments.isPng;
            this.encodeMethod = defaultArguments.encodeMethod;
            this.innerContrast = defaultArguments.innerContrast;
            this.coverContrast = defaultArguments.coverContrast;
            this.size = defaultArguments.size;
            this.minSize = defaultArguments.minSize;
            this.maxSize = defaultArguments.maxSize;
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
        document.getElementById('decodeContrastRange').value = this.decodeContrast;

        document.getElementById('innerThresholdRange').value = this.innerThreshold;
        document.getElementById('innerThresholdInput').value = this.innerThreshold;
        document.getElementById('coverThresholdRange').value = this.coverThreshold;
        document.getElementById('coverThresholdInput').value = this.coverThreshold;

        document.getElementById('innerContrastRange').value = this.innerContrast;
        document.getElementById('coverContrastRange').value = this.coverContrast;

        document.getElementById('isCoverGrayCheckBox').checked = this.isCoverGray;
        document.getElementById('isEncodeReverseCheckBox').checked = this.isEncodeReverse;
        document.getElementById('isPngCheckBox').checked = this.isPng;
        document.getElementById('encodeMethodSelect').value = this.encodeMethod;
        document.getElementById('encodeSizeInput').value = this.size;
    }
}

errorHandling.scriptsLoaded.DefaultArguments = true;
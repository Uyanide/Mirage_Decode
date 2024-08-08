import defaultArgumentsConfig from './DefaultArgumentsConfig.json';

class DefaultArguments {
    async loadDefaultArguments() {
        try {
            this.isReadMetadata = defaultArgumentsConfig.isReadMetadata;
            this.decodeThreshold = defaultArgumentsConfig.decodeThreshold;
            this.isDecodeReverse = defaultArgumentsConfig.isDecodeReverse;
            this.decodeMethod = defaultArgumentsConfig.decodeMethod;
            this.decodeContrast = defaultArgumentsConfig.decodeContrast;

            this.innerThreshold = defaultArgumentsConfig.innerThreshold;
            this.coverThreshold = defaultArgumentsConfig.coverThreshold;
            this.isCoverGray = defaultArgumentsConfig.isCoverGray;
            this.isEncodeReverse = defaultArgumentsConfig.isEncodeReverse;
            this.isCoverMirage = defaultArgumentsConfig.isCoverMirage;
            this.isPng = defaultArgumentsConfig.isPng;
            this.encodeMethod = defaultArgumentsConfig.encodeMethod;
            this.innerContrast = defaultArgumentsConfig.innerContrast;
            this.coverContrast = defaultArgumentsConfig.coverContrast;
            this.size = defaultArgumentsConfig.size;
            this.minSize = defaultArgumentsConfig.minSize;
            this.maxSize = defaultArgumentsConfig.maxSize;
            this.defaultPageId = defaultArgumentsConfig.defaultPageId;
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
        document.getElementById('isCoverMirageCheckBox').checked = this.isCoverMirage;
        document.getElementById('isPngCheckBox').checked = this.isPng;
        document.getElementById('encodeMethodSelect').value = this.encodeMethod;
        document.getElementById('encodeSizeInput').value = this.size;
    }
}

export default DefaultArguments;
import defaultArgumentsConfig from './DefaultArgumentsConfig.json';

class DefaultArguments {
    static loadDefaultArguments() {
        return defaultArgumentsConfig;
    }

    static setDefaultValues() {
        document.getElementById('isReadMetadataCheckBox').checked = defaultArgumentsConfig.isReadMetadata;
        document.getElementById('decodeThresholdRange').value = defaultArgumentsConfig.decodeThreshold;
        document.getElementById('decodeThresholdInput').value = defaultArgumentsConfig.decodeThreshold;
        document.getElementById('decodeReverseInput').checked = defaultArgumentsConfig.isDecodeReverse;
        document.getElementById('optionSelect').value = defaultArgumentsConfig.decodeMethod;
        document.getElementById('decodeContrastRange').value = defaultArgumentsConfig.decodeContrast;

        document.getElementById('innerThresholdRange').value = defaultArgumentsConfig.innerThreshold;
        document.getElementById('innerThresholdInput').value = defaultArgumentsConfig.innerThreshold;
        document.getElementById('coverThresholdRange').value = defaultArgumentsConfig.coverThreshold;
        document.getElementById('coverThresholdInput').value = defaultArgumentsConfig.coverThreshold;

        document.getElementById('innerContrastRange').value = defaultArgumentsConfig.innerContrast;
        document.getElementById('coverContrastRange').value = defaultArgumentsConfig.coverContrast;

        document.getElementById('isCoverGrayCheckBox').checked = defaultArgumentsConfig.isCoverGray;
        document.getElementById('isEncodeReverseCheckBox').checked = defaultArgumentsConfig.isEncodeReverse;
        document.getElementById('isCoverMirageCheckBox').checked = defaultArgumentsConfig.isCoverMirage;
        document.getElementById('isPngCheckBox').checked = defaultArgumentsConfig.isPng;
        document.getElementById('encodeMethodSelect').value = defaultArgumentsConfig.encodeMethod;
        document.getElementById('encodeSizeInput').value = defaultArgumentsConfig.size;
    }
}

export default DefaultArguments;

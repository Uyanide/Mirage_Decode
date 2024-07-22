
class DefaultArguments {
    constructor() {
        this.decodeThreshold = 32;
        this.isDecodeReverse = false;
        this.decodeMethod = 'lcopy';
        // this.decodeMethod = 'black';
        // this.decodeMethod = 'white';
        // this.decodeMethod = 'trans';

        this.innerThreshold = 24;
        this.coverThreshold = 42;
        this.isCoverGray = false;
        this.isEncodeReverse = false;
        this.isPng = false;

        this.method = 2;
        this.methodDisplay = 'chess'
        // this.method = 3;
        // this.methodDisplay = 'gap_2'
        // this.method = 4;
        // this.methodDisplay = 'gap_3'
        // this.method = 6;
        // this.methodDisplay = 'gap_5'

        this.size = 1200;

        this.defaultPageId = 'decodePage';
        // this.defaultPageId = 'encodePage';
    }

    setDefaultValues() {
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
        document.getElementById('encodeMethodSelect').value = this.methodDisplay;
        document.getElementById('encodeSizeInput').value = this.size;
    }
}
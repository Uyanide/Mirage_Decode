import piexif from './piexif';
import { binaryStringToUint8Array, uint8ArrayToBinaryString } from '../../utils/general';

export function decodeMetadata(fileData) {
  const binaryString = uint8ArrayToBinaryString(fileData);
  const exif = piexif.load(binaryString);
  const infoString = exif['0th'][piexif.ImageIFD.Make];
  return infoString;
}

export function encodeMetadata(fileData, metadata) {
  const binaryString = uint8ArrayToBinaryString(fileData);
  let zeroth = {};
  zeroth[piexif.ImageIFD.Make] = metadata;
  const exifObj = { '0th': zeroth };
  const exifbytes = piexif.dump(exifObj);
  const inserted = piexif.insert(exifbytes, binaryString);
  return binaryStringToUint8Array(inserted);
}

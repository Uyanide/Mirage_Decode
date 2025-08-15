import piexif from './piexif';

export function decodeMetadata(binaryString) {
  const exif = piexif.load(binaryString);
  const infoString = exif['0th'][piexif.ImageIFD.Make];
  return infoString;
}

export function encodeMetadata(binaryString, metadata) {
  let zeroth = {};
  zeroth[piexif.ImageIFD.Make] = metadata;
  const exifObj = { '0th': zeroth };
  const exifbytes = piexif.dump(exifObj);
  const inserted = piexif.insert(exifbytes, binaryString);
  return inserted;
}

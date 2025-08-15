import { PTTJPEG } from './pttjpeg.js';

let encoder = null;

export function encode(imageData) {
  if (!encoder) {
    encoder = new PTTJPEG();
  }

  const chunks = [];
  const bw = {
    write: (array, offset, length) => {
      chunks.push(array.slice(offset, offset + length));
    },
  };
  var inImage = new encoder.pttImage(imageData);
  encoder.encode(90, inImage, bw, '4:4:4');
  return new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
}

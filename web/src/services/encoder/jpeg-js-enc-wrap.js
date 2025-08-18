import { JPEGEncoder } from './jpeg-js-enc';

export function encode(imageData) {
  const encoder = new JPEGEncoder(100);
  return encoder.encode(imageData);
}

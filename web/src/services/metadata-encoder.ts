import { parseMimeType } from './image-mimetype.js';
import { encodeMake as encodePiexif } from './metadata/piexif-wrap.js';
import { encodetEXt as encodePNGChunk } from './metadata/png.js';

export function encodeMetadata(fileData: Uint8Array, metadata: string): Uint8Array {
  const mimeType = parseMimeType(fileData);
  const encoder = metadataEncoders[mimeType];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!encoder) {
    console.warn(`No metadata encoder found for MIME type: ${mimeType}`);
    return new Uint8Array(fileData);
  }
  return encoder(fileData, metadata);
}

const metadataEncoders: Record<string, (fileData: Uint8Array, meatadata: string) => Uint8Array> = {
  'image/jpeg': encodePiexif,
  'image/png': encodePNGChunk,
};

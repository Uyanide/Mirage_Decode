import { encodeMetadata as encodePiexif } from './metadata/piexif-wrap.js';
import { encodeMetadata as encodePNGChunk } from './metadata/png.js';

export function encodeMetadata(binaryString: string, mimeType: string, metadata: string): string {
  const encoder = metadataEncoders[mimeType];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!encoder) {
    console.warn(`No metadata encoder found for MIME type: ${mimeType}`);
    return binaryString;
  }
  return encoder(binaryString, metadata);
}

const metadataEncoders: Record<string, (binaryString: string, meatadata: string) => string> = {
  'image/jpeg': encodePiexif,
  'image/png': encodePNGChunk,
};

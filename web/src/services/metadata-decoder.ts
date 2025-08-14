import { parseMimeType } from './image-mimetype.js';
import { decodeMetadata as decodePiexif } from './metadata/piexif-wrap.js';
import { decodeMetadata as decodeMetadataPNGChunk } from './metadata/png.js';

export function decodeMetadata(fileData: ArrayBuffer): string {
  const mimeType = parseMimeType(fileData);
  const decoder = metadataDecoders[mimeType];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!decoder) {
    return '';
  }
  return decoder(fileData);
}

const metadataDecoders: Record<string, (fileData: ArrayBuffer) => string> = {
  'image/jpeg': decodeMetadataJPEG,
  'image/png': decodeMetadataPNG,
};

function decodeMetadataJPEG(fileData: ArrayBuffer): string {
  const binString = String.fromCharCode(...new Uint8Array(fileData));
  return decodePiexif(binString);
}

function decodeMetadataPNG(fileData: ArrayBuffer): string {
  const binString = String.fromCharCode(...new Uint8Array(fileData));
  return decodeMetadataPNGChunk(binString);
}

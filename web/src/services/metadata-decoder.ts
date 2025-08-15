import { parseMimeType } from './image-mimetype.js';
import { decodeMetadata as decodePiexif } from './metadata/piexif-wrap';
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
  return decodePiexif(binString(fileData));
}

function decodeMetadataPNG(fileData: ArrayBuffer): string {
  return decodeMetadataPNGChunk(binString(fileData));
}

function binString(fileData: ArrayBuffer): string {
  const bytes = new Uint8Array(fileData);
  return bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
}

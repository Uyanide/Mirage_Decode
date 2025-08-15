import { parseMimeType } from './image-mimetype.js';
import { decodeMetadata as decodePiexif } from './metadata/piexif-wrap';
import { decodeMetadata as decodeMetadataPNGChunk } from './metadata/png.js';

export function decodeMetadata(fileData: Uint8Array): string {
  const mimeType = parseMimeType(fileData);
  const decoder = metadataDecoders[mimeType];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!decoder) {
    return '';
  }
  return decoder(fileData);
}

const metadataDecoders: Record<string, (fileData: Uint8Array) => string> = {
  'image/jpeg': decodeMetadataJPEG,
  'image/png': decodeMetadataPNG,
};

function decodeMetadataJPEG(fileData: Uint8Array): string {
  return decodePiexif(fileData);
}

function decodeMetadataPNG(fileData: Uint8Array): string {
  return decodeMetadataPNGChunk(fileData);
}

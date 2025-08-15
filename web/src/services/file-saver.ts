import { saveAs } from 'file-saver';
import { mimeMap } from '../constants/mime-map';

export function saveFile(fileData: Uint8Array, mimeType: string): string {
  const blob = new Blob([fileData.buffer as ArrayBuffer], { type: mimeType || 'application/octet-stream' });
  const ext = mimeMap[mimeType] || 'bin';
  const name = `output_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;
  saveAs(blob, name);
  return name;
}

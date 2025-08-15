const signatures: Record<string, (s: string) => boolean> = {
  'image/jpeg': (s) => s.startsWith('\xFF\xD8'),
  'image/png': (s) => s.startsWith('\x89PNG\r\n\x1A\n'),
  'image/gif': (s) => s.startsWith('GIF87a') || s.startsWith('GIF89a'),
  'image/webp': (s) => s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP',
  'image/bmp': (s) => s.startsWith('BM'),
  'image/avif': (s) => s.slice(4, 8) === 'ftyp' && (s.slice(8, 12) === 'avif' || s.slice(8, 12) === 'avis'),
  'image/heic': (s) => s.slice(4, 8) === 'ftyp' && (s.slice(8, 12) === 'heic' || s.slice(8, 12) === 'heix'),
  'image/heif': (s) => s.slice(4, 8) === 'ftyp' && (s.slice(8, 12) === 'mif1' || s.slice(8, 12) === 'msf1'),
  'image/tiff': (s) => s.startsWith('II*\x00') || s.startsWith('MM\x00*'),
  'image/x-icon': (s) => s.startsWith('\x00\x00\x01\x00'),
  'image/svg+xml': (s) => s.includes('<svg') || (s.startsWith('<?xml') && s.includes('svg')),
  'image/jxl': (s) => s.startsWith('\xFF\x0A') || s.startsWith('\x00\x00\x00\x0CJXL \r\n\x87\n'),
};

export function parseMimeType(fileData: Uint8Array): string {
  const signature = String.fromCharCode(...fileData.slice(0, 20));
  for (const [mimeType, check] of Object.entries(signatures)) {
    if (check(signature)) {
      return mimeType;
    }
  }
  return '';
}

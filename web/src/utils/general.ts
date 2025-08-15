// get rid of eslint errors
export function constructError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function binaryStringToUint8Array(binaryString: string): Uint8Array {
  const uint8 = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8[i] = binaryString.charCodeAt(i);
  }
  return uint8;
}

export function uint8ArrayToBinaryString(uint8: Uint8Array): string {
  let str = '';
  for (let i = 0; i < uint8.length; i++) {
    str += String.fromCharCode(uint8[i]);
  }
  return str;
}

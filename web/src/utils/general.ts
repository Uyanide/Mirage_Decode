// get rid of eslint errors
export function constructError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

// piexif only accepts binary strings as input, so ...
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

// why not?
export type Ptr<T> = {
  v: T | null;
};
export function nullPtr<T>(): Ptr<T> {
  return { v: null };
}
// // useful when:
// function foo(obj: Ptr<ImageData>) {
//   obj.v = new ImageData(1, 1);
// }
// const obj: Ptr<ImageData> = { v: new ImageData(2, 2) };
// foo(obj);

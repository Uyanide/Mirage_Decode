export type PrismAdvancedEncodeInputConfig = {
  imageData: ImageData;
  lowerThreshold: number;
  higherThreshold: number;
  weight: number;
};

export type PrismAdvancedEncodeConfig = {
  inputs: PrismAdvancedEncodeInputConfig[];
  output: ImageData;
};

export function PrismAdvancedEncode({ inputs, output }: PrismAdvancedEncodeConfig): boolean {
  // All the validation works should be done by caller
  if (inputs.length === 0) {
    console.error('No input images provided for encoding.');
    return false;
  }
  const width = inputs[0].imageData.width;
  const height = inputs[0].imageData.height;
  const length = inputs[0].imageData.data.length;
  for (const input of inputs) {
    if (input.imageData.width !== width || input.imageData.height !== height) {
      console.error('All input images must have the same dimensions.');
      return false;
    }
  }
  if (output.width !== width || output.height !== height) {
    console.error('Output image must have the same dimensions as input images.');
    return false;
  }
  const outputData = output.data;
  const weightSum = inputs.reduce((sum, input) => sum + input.weight, 0);
  for (let i = 0, x = 0, y = 0; i < length; i += 4) {
    const input = selectInput(x, y, weightSum, inputs);
    const lowerThreshold = input.lowerThreshold;
    const higherThreshold = input.higherThreshold;

    const r = input.imageData.data[i];
    const g = input.imageData.data[i + 1];
    const b = input.imageData.data[i + 2];
    const a = input.imageData.data[i + 3];

    const scaledR = scale(r, lowerThreshold, higherThreshold);
    const scaledG = scale(g, lowerThreshold, higherThreshold);
    const scaledB = scale(b, lowerThreshold, higherThreshold);

    outputData[i] = scaledR;
    outputData[i + 1] = scaledG;
    outputData[i + 2] = scaledB;
    outputData[i + 3] = a;

    x++;
    if (x >= width) {
      x = 0;
      y++;
    }
  }
  return true;
}

function scale(v: number, l: number, h: number): number {
  return Math.floor(Math.max(l, Math.min((v * (h - l)) / 255 + l, h)));
}

function selectInput(x: number, y: number, weightSum: number, inputs: PrismAdvancedEncodeInputConfig[]) {
  const offset = (x + y) % weightSum;
  for (let i = 0, n = 0; i < inputs.length && n < weightSum; i++) {
    if (n + inputs[i].weight > offset) {
      return inputs[i];
    }
    n += inputs[i].weight;
  }
  return inputs[inputs.length - 1]; // Fallback to the last input if none matched // Which is (likely) unreachable :/
}

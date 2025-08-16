export function isCover(x: number, y: number, slope: number, gap: number, isRow: boolean): boolean {
  if (slope === 0) {
    return (isRow ? y : x) % (gap + 1) < gap;
  } else if (isRow) {
    return (y / slope + x) % (gap + 1) < gap;
  } else {
    return (x / slope + y) % (gap + 1) < gap;
  }
}

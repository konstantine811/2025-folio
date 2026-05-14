import { MathUtils } from "three";

export const normalizeRange = (value: number, start: number, end: number) =>
  MathUtils.clamp((value - start) / (end - start), 0, 1);

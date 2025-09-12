import { Matrix4 } from "three";

export type EncodedRaggedMeta = {
  rows: number;
  rowLengths: number[]; // довжина кожного рядка
  dtype: "f64";
  order: "column-major";
};

// -> Uint8Array (без base64): послідовно всі матриці як Float64
export function encodeRaggedToBytes(grid: Matrix4[][]): {
  bytes: Uint8Array;
  meta: EncodedRaggedMeta;
} {
  const rows = grid.length;
  const rowLengths = grid.map((r) => r.length);
  const total = rowLengths.reduce((a, b) => a + b, 0);
  const f64 = new Float64Array(total * 16);
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const e = grid[r][c].elements;
      for (let i = 0; i < 16; i++) f64[k++] = e[i];
    }
  }
  return {
    bytes: new Uint8Array(f64.buffer),
    meta: { rows, rowLengths, dtype: "f64", order: "column-major" },
  };
}

// <- з Uint8Array + meta назад у Matrix4[][]
export function decodeRaggedFromBytes(
  u8: Uint8Array,
  meta: EncodedRaggedMeta
): Matrix4[][] {
  const f64 = new Float64Array(
    u8.buffer,
    u8.byteOffset,
    Math.floor(u8.byteLength / 8)
  );
  const out: Matrix4[][] = Array.from({ length: meta.rows }, () => []);
  let k = 0;
  for (let r = 0; r < meta.rows; r++) {
    const len = meta.rowLengths[r];
    const row: Matrix4[] = new Array(len);
    for (let c = 0; c < len; c++) {
      row[c] = new Matrix4().fromArray(f64 as unknown as number[], k);
      k += 16;
    }
    out[r] = row;
  }
  return out;
}

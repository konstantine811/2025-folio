// quant-save.ts
import { Matrix4, Quaternion, Vector3 } from "three";

type PackedChunk = {
  origin: [number, number, number]; // мінімум по X/Y/Z або просто центр клітинки
  items: number[]; // плоский масив цілих: [px, pz, q0, q1, q2, qMeta, s, ...]
};

export type PackedPayload = {
  version: 2;
  scheme: "Q16_POS2_SMALLEST3_Q16_SCALE";
  cellSize: number; // наприклад 5
  yBase: number; // спільний Y (за потреби можна прибрати та зберігати dy)
  sRange: [number, number]; // [sMin, sMax] для шкалування Uint16
  chunks: PackedChunk[];
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// квантування float->uint16 з лінійним мепінгом
const q16 = (x: number) => Math.round(clamp01(x) * 65535);

// кодування кватерніона схемою “smallest-three” (3*int16 + 1 байт)
function encodeQuatSmallest3(q: Quaternion): [number, number, number, number] {
  // нормалізуємо
  const qq = q.normalize();
  const comps = [qq.x, qq.y, qq.z, qq.w];

  // знаходимо найбільшу за модулем компоненту (її НЕ зберігаємо)
  let maxIndex = 0;
  for (let i = 1; i < 4; i++)
    if (Math.abs(comps[i]) > Math.abs(comps[maxIndex])) maxIndex = i;

  // знак найбільшої компоненти — окремим бітом; решту три компоненти масштабуємо у [-1,1]
  const sign = comps[maxIndex] < 0 ? 1 : 0;
  const rest: number[] = [];
  for (let i = 0; i < 4; i++)
    if (i !== maxIndex) rest.push(comps[i] * (sign ? -1 : 1));

  // квантуємо 3 компоненти [-1,1] -> [-32767,32767] (симетричний int16)
  const toI16 = (v: number) =>
    Math.max(-32767, Math.min(32767, Math.round(v * 32767)));
  const a = toI16(rest[0]);
  const b = toI16(rest[1]);
  const c = toI16(rest[2]);

  // qMeta: 2 біти для maxIndex і 1 біт для sign, решта біти можна залишити 0
  const qMeta = (maxIndex & 0b11) | (sign << 2);

  // повертаємо як беззнакові 16-бітові числа + один байт метаданих
  const u = (n: number) => (n < 0 ? n + 65536 : n);
  return [u(a), u(b), u(c), qMeta];
}

// зворотній декодер (для парсера)
function decodeQuatSmallest3(
  a: number,
  b: number,
  c: number,
  qMeta: number
): Quaternion {
  const maxIndex = qMeta & 0b11;
  const sign = (qMeta >> 2) & 0b1;
  const fromI16 = (u: number) => (u > 32767 ? u - 65536 : u) / 32767;

  const rest = [fromI16(a), fromI16(b), fromI16(c)];
  const comps = [0, 0, 0, 0] as number[];

  let ri = 0;
  for (let i = 0; i < 4; i++) {
    if (i === maxIndex) continue;
    comps[i] = rest[ri++];
  }
  // відновлюємо найбільшу компоненту
  const sumSq = comps[0] * comps[0] + comps[1] * comps[1] + comps[2] * comps[2];
  comps[maxIndex] = Math.sqrt(Math.max(0, 1 - sumSq));
  if (sign) comps[maxIndex] = -comps[maxIndex];

  return new Quaternion(comps[0], comps[1], comps[2], comps[3]).normalize();
}

// ГОЛОВНА: зберегти упаковано у JSON
export function saveChunksPackedJSON(
  chunks: Matrix4[][],
  {
    cellSize = 5,
    yBase = 0, // якщо Y справді спільний — поклади його сюди
    sRange = [0.05, 2] as [number, number], // очікуваний діапазон масштабу
  } = {}
) {
  const [sMin, sMax] = sRange;
  const invSRange = 1 / (sMax - sMin);

  const outChunks: PackedChunk[] = [];

  const p = new Vector3(),
    s = new Vector3(),
    q = new Quaternion();

  for (const cell of chunks) {
    if (!cell.length) {
      outChunks.push({ origin: [0, yBase, 0], items: [] });
      continue;
    }

    // беремо origin по XZ (наприклад, мінімум), Y виносимо у хедер
    let minX = +Infinity,
      minZ = +Infinity;
    for (const m of cell) {
      m.decompose(p, q, s);
      if (p.x < minX) minX = p.x;
      if (p.z < minZ) minZ = p.z;
    }
    const origin: [number, number, number] = [minX, yBase, minZ];

    const items: number[] = [];
    for (const m of cell) {
      m.decompose(p, q, s);

      // позиції у межах клітинки: (p - origin) / cellSize → [0..1] → Uint16
      const px = q16((p.x - origin[0]) / cellSize);
      const pz = q16((p.z - origin[2]) / cellSize);

      // кватерніон → smallest-three (3x int16 + 1 byte)
      const [qa, qb, qc, qm] = encodeQuatSmallest3(q);

      // isotropic scale → Uint16 у [sMin..sMax]
      const ss = Math.max(sMin, Math.min(sMax, s.x)); // припускаємо Sx=Sy=Sz
      const su = q16((ss - sMin) * invSRange);

      // пакуємо у плоский масив
      items.push(px, pz, qa, qb, qc, qm, su);
    }

    outChunks.push({ origin, items });
  }

  const payload: PackedPayload = {
    version: 2,
    scheme: "Q16_POS2_SMALLEST3_Q16_SCALE",
    cellSize,
    yBase,
    sRange,
    chunks: outChunks,
  };

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chunks-packed.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function parsePackedJSON(payload: PackedPayload): Matrix4[][] {
  const { chunks, cellSize, yBase, sRange } = payload;
  const [sMin, sMax] = sRange;

  const out: Matrix4[][] = [];
  const p = new Vector3(),
    s = new Vector3(1, 1, 1),
    q = new Quaternion();

  for (const ch of chunks) {
    const arr = ch.items;
    const res: Matrix4[] = [];
    for (let i = 0; i < arr.length; i += 7) {
      const px = arr[i],
        pz = arr[i + 1];
      const qa = arr[i + 2],
        qb = arr[i + 3],
        qc = arr[i + 4],
        qm = arr[i + 5];
      const su = arr[i + 6];

      p.set(
        ch.origin[0] + (px / 65535) * cellSize,
        yBase,
        ch.origin[2] + (pz / 65535) * cellSize
      );
      q.copy(decodeQuatSmallest3(qa, qb, qc, qm));
      const sc = sMin + (su / 65535) * (sMax - sMin);
      s.setScalar(sc);

      const M = new Matrix4().compose(p, q, s);
      res.push(M);
    }
    out.push(res);
  }
  return out;
}

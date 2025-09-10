import { Matrix4, Quaternion, Vector3 } from "three";

export type JsonPayload = { chunks: number[][][] } | string; // якщо бандлер імпортує як рядок

function toMatrix4(arr: number[]): Matrix4 {
  const m = new Matrix4();
  if (arr.length === 16) {
    // M16
    return m.fromArray(arr);
  } else if (arr.length === 12) {
    // M12 -> дописуємо останній рядок [0,0,0,1]
    const full = [
      arr[0],
      arr[1],
      arr[2],
      0,
      arr[3],
      arr[4],
      arr[5],
      0,
      arr[6],
      arr[7],
      arr[8],
      0,
      arr[9],
      arr[10],
      arr[11],
      1,
    ];
    return m.fromArray(full);
  } else if (arr.length === 10) {
    // SQT: pos(3) + quat(4) + scale(3)
    const p = new Vector3(arr[0], arr[1], arr[2]);
    const q = new Quaternion(arr[3], arr[4], arr[5], arr[6]);
    const s = new Vector3(arr[7], arr[8], arr[9]);
    return m.compose(p, q, s);
  }
  throw new Error(`Unknown matrix format, length=${arr.length}`);
}

export function parseChunksJson(payload: JsonPayload): Matrix4[][] {
  const obj = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (!obj || !Array.isArray(obj.chunks)) {
    throw new Error("Invalid chunks JSON: missing 'chunks' array");
  }
  // obj.chunks: number[][][]
  return obj.chunks.map((cell: number[][]) => cell.map(toMatrix4));
}

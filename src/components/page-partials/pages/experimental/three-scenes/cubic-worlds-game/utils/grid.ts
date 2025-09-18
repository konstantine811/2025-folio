// grid.ts
import { Matrix4, Vector3 } from "three";

const _p = new Vector3();
function extractPos(m: Matrix4) {
  _p.setFromMatrixPosition(m);
  return _p;
}

export function buildGridCells(mats: Matrix4[], cellSize = 5): Matrix4[][] {
  const cells = new Map<string, Matrix4[]>();

  for (const m of mats) {
    const p = extractPos(m);
    const ix = Math.floor(p.x / cellSize);
    const iy = Math.floor(p.y / cellSize);
    const iz = Math.floor(p.z / cellSize);
    const key = `${ix},${iy},${iz}`;
    let arr = cells.get(key);
    if (!arr) {
      arr = [];
      cells.set(key, arr);
    }
    arr.push(m);
  }

  return [...cells.values()]; // масив чанків: Matrix4[] на кожен осередок
}

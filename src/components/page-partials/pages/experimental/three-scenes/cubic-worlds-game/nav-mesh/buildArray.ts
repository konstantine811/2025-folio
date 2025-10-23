// utils/buildArrays.ts
import { BufferGeometry, InstancedMesh, Matrix4, Mesh, Vector3 } from "three";

export type AnyMesh = Mesh | InstancedMesh;

export function buildPositionsAndIndices(input: AnyMesh[]) {
  // порахуємо загальну кількість вершин/індексів
  let totalVerts = 0;
  let totalIndices = 0;

  input.forEach((m) => {
    const g = m.geometry as BufferGeometry;
    const pos = g.getAttribute("position");
    if (!pos) return;
    const baseVerts = pos.count;
    const baseIndices = g.getIndex()?.count ?? baseVerts; // для non-indexed
    const instCount = (m as InstancedMesh).isInstancedMesh
      ? (m as InstancedMesh).count
      : 1;
    totalVerts += baseVerts * instCount;
    totalIndices += baseIndices * instCount;
  });

  const positions = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIndices);

  const tmpM = new Matrix4();
  const tmpMW = new Matrix4();
  const v = new Vector3();

  let vOffset = 0; // зсув вершини
  let iOffset = 0; // зсув індекса

  input.forEach((m) => {
    const g = m.geometry as BufferGeometry;
    const pos = g.getAttribute("position");
    if (!pos) return;

    const idx = g.getIndex();
    const hasIndex = !!idx;
    const baseVerts = pos.count;
    const baseIndices = hasIndex ? idx!.count : baseVerts;

    // гарантовано актуальні матриці
    m.updateWorldMatrix(true, true);

    const instanced = (m as InstancedMesh).isInstancedMesh;
    const instCount = instanced ? (m as InstancedMesh).count : 1;

    for (let inst = 0; inst < instCount; inst++) {
      // матриця трансформації інстансу
      if (instanced) {
        (m as InstancedMesh).getMatrixAt(inst, tmpM);
        tmpMW.multiplyMatrices(m.matrixWorld, tmpM);
      } else {
        tmpMW.copy(m.matrixWorld);
      }

      // записуємо позиції
      for (let i = 0; i < baseVerts; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(tmpMW);
        const p = (vOffset + i) * 3;
        positions[p] = v.x;
        positions[p + 1] = v.y;
        positions[p + 2] = v.z;
      }

      // записуємо індекси
      if (hasIndex) {
        const arr = idx!.array as Uint16Array | Uint32Array;
        for (let k = 0; k < baseIndices; k++) {
          indices[iOffset + k] = arr[k] + vOffset;
        }
      } else {
        // non-indexed: трикутники йдуть послідовно
        for (let k = 0; k < baseIndices; k++) {
          indices[iOffset + k] = vOffset + k;
        }
      }

      iOffset += baseIndices;
      vOffset += baseVerts;
    }
  });

  return { positions, indices };
}

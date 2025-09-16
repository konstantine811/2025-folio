import { BufferGeometry, Quaternion, Vector3 } from "three";

export type UpHint = "auto-normals" | "bbox" | "x" | "y" | "z" | Vector3;

export function computeUpAndPivot(
  geometry: BufferGeometry,
  hint: UpHint = "auto-normals"
): { up: Vector3; pivotToBottom: number; qPre: Quaternion } {
  // 1) знаходимо up-вектор
  const up = new Vector3();
  const pos = geometry.getAttribute("position");
  const hasIdx = !!geometry.getIndex();
  const idxArr = hasIdx
    ? (geometry.getIndex()!.array as unknown as number[])
    : null;

  const Y = new Vector3(0, 1, 0);

  const chooseByHint = () => {
    if (hint instanceof Vector3) {
      up.copy(hint).normalize();
      return;
    }
    if (hint === "x") {
      up.set(1, 0, 0);
      return;
    }
    if (hint === "y") {
      up.set(0, 1, 0);
      return;
    }
    if (hint === "z") {
      up.set(0, 0, 1);
      return;
    }
    if (hint === "bbox") {
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      const size = new Vector3().subVectors(bb.max, bb.min);
      if (size.y >= size.x && size.y >= size.z) up.set(0, 1, 0);
      else if (size.z >= size.x && size.z >= size.y) up.set(0, 0, 1);
      else up.set(1, 0, 0);
      return;
    }
    // "auto-normals" нижче
  };

  if (hint !== "auto-normals") {
    chooseByHint();
  } else {
    // площево-вагова сума нормалей трикутників
    const a = new Vector3(),
      b = new Vector3(),
      c = new Vector3();
    const e0 = new Vector3(),
      e1 = new Vector3(),
      n = new Vector3();
    const triCount = hasIdx ? idxArr!.length / 3 : pos.count / 3;
    for (let t = 0; t < triCount; t++) {
      const i0 = hasIdx ? idxArr![t * 3 + 0] : t * 3 + 0;
      const i1 = hasIdx ? idxArr![t * 3 + 1] : t * 3 + 1;
      const i2 = hasIdx ? idxArr![t * 3 + 2] : t * 3 + 2;
      a.set(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
      b.set(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
      c.set(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
      e0.subVectors(b, a);
      e1.subVectors(c, a);
      n.crossVectors(e0, e1); // НЕ нормалізуємо — довжина ~ площа
      up.add(n);
    }
    if (up.lengthSq() < 1e-10) {
      // фолбек — bbox
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      const size = new Vector3().subVectors(bb.max, bb.min);
      if (size.y >= size.x && size.y >= size.z) up.set(0, 1, 0);
      else if (size.z >= size.x && size.z >= size.y) up.set(0, 0, 1);
      else up.set(1, 0, 0);
    } else {
      up.normalize();
    }
  }

  // 2) зсув "до п’ятки": мінімальна проєкція вершин на up
  let minProj = +Infinity;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const d = v.dot(up);
    if (d < minProj) minProj = d;
  }
  const pivotToBottom = -minProj; // скільки підняти вздовж up, щоб «низ» був на 0

  // 3) кватерніон, що повертає up у +Y
  const qPre = new Quaternion().setFromUnitVectors(up, Y);

  return { up, pivotToBottom, qPre };
}

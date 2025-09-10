import { useEffect, useMemo, useState } from "react";
import {
  BoxGeometry,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Vector3,
} from "three";
import { mulberry32 } from "../../../utils/mulberry";
import { buildGridCells } from "../../../utils/grid";
import InstanceChunk from "./instance-chunk";

const EPS_NORMAL = 0.0001;

type Props = {
  strokes: Vector3[][];
  strokeNormals: Vector3[];
  seed: number;
  limit: number;
  density: number;
  radius: number;
  rotationDeg: number;
  offset: number;
  randomness: number;
  scale: number;
};

export default function AddBoxInstance({
  strokes,
  strokeNormals,
  seed,
  limit,
  density,
  radius,
  rotationDeg,
  offset,
  randomness,
  scale,
}: Props) {
  const dummy = useMemo(() => new Object3D(), []);

  // ⚠️ Реальна геометрія (а не порожній BufferGeometry)
  const sharedGeom = useMemo(() => {
    const g = new BoxGeometry(1, 1, 1);
    g.computeBoundingBox();
    return g;
  }, []);

  const sharedMat = useMemo(
    () => new MeshBasicMaterial({ color: "#8899ff" }),
    []
  );

  // підйом до «дна» моделі береться від boundingBox геометрії
  const pivotToBottom = useMemo(() => {
    const bb = sharedGeom.boundingBox!;
    return -bb.min.y; // для box = halfHeight
  }, [sharedGeom]);

  const tmp = useMemo(
    () => ({
      q: new Quaternion(),
      q2: new Quaternion(),
      pos: new Vector3(),
      n: new Vector3(0, 1, 0),
      t: new Vector3(1, 0, 0),
      b: new Vector3(0, 0, 1),
      plane: new Plane(),
    }),
    []
  );

  const [chunks, setChunks] = useState<Matrix4[][]>([]);

  useEffect(() => {
    const rng = mulberry32(seed);
    const allMatrices: Matrix4[] = [];
    let index = 0;

    for (let s = 0; s < strokes.length && index < limit; s++) {
      const stroke = strokes[s];
      const n0 = strokeNormals[s];
      if (!stroke?.length || !n0) continue;

      const n = n0.clone().normalize();
      tmp.plane.setFromNormalAndCoplanarPoint(n, stroke[0]);

      for (let i = 0; i < stroke.length && index < limit; i++) {
        const cur = stroke[i];
        const prev = stroke[i - 1] ?? cur;
        const next = stroke[i + 1] ?? cur;

        // дотична в площині штриха
        tmp.t.copy(next).sub(prev);
        if (tmp.t.lengthSq() < 1e-12) {
          tmp.t.set(1, 0, 0);
          if (Math.abs(tmp.t.dot(n)) > 0.95) tmp.t.set(0, 0, 1);
        }
        tmp.t.addScaledVector(n, -tmp.t.dot(n)).normalize();

        // бінормаль
        tmp.b.crossVectors(n, tmp.t).normalize();

        for (let k = 0; k < density && index < limit; k++) {
          const u = rng();
          const r = radius * Math.sqrt(u);
          const theta = 2 * Math.PI * rng();

          // позиція у площині (b, t) + поздовжній offset
          tmp.pos
            .copy(cur)
            .addScaledVector(tmp.b, Math.cos(theta) * r)
            .addScaledVector(tmp.t, Math.sin(theta) * r + offset);

          // тримаємо рівно на поверхні
          tmp.plane.projectPoint(tmp.pos, tmp.pos);

          // орієнтація: лише yaw навколо нормалі n
          tmp.q.identity();
          const yaw =
            (rotationDeg * Math.PI) / 180 +
            (rng() - 0.5) * 2 * Math.PI * randomness;
          tmp.q2.setFromAxisAngle(n, yaw);
          tmp.q.multiply(tmp.q2);

          // масштаб і підйом уздовж n
          const sScale = scale * (1 + (rng() - 0.5) * 2 * randomness);
          tmp.pos.addScaledVector(n, pivotToBottom * sScale + EPS_NORMAL);

          dummy.position.copy(tmp.pos);
          dummy.quaternion.copy(tmp.q);
          dummy.scale.setScalar(Math.max(0.001, sScale));
          dummy.updateMatrix();

          // ❗ Записуємо МАТРИЦЮ в масив, а не в instancedMesh
          allMatrices.push(dummy.matrix.clone());
          index++;
        }
      }
    }

    // Розбиваємо на осередки (чанки)
    const cellSize = 5; // налаштуй під сцену
    setChunks(buildGridCells(allMatrices, cellSize));
  }, [
    strokes,
    strokeNormals,
    seed,
    limit,
    density,
    radius,
    rotationDeg,
    offset,
    randomness,
    scale,
    dummy,
    tmp,
    pivotToBottom,
  ]);

  return (
    <group>
      {chunks.map((mats, i) => (
        <InstanceChunk
          key={i}
          matrices={mats}
          geometry={sharedGeom}
          material={sharedMat}
        />
      ))}
    </group>
  );
}

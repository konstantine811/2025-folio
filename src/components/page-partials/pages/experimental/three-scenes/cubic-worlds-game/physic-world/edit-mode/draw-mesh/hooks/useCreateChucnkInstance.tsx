import { useEffect, useMemo, useState } from "react";
import {
  BufferGeometry,
  Matrix4,
  NormalBufferAttributes,
  Object3D,
  Plane,
  Quaternion,
  Vector3,
} from "three";
import { mulberry32 } from "../../../../utils/mulberry";
import { buildGridCells } from "../../../../utils/grid";
import { computeUpAndPivot, UpHint } from "./useCreatePivotPoint";

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
  geometry: BufferGeometry<NormalBufferAttributes>;
  hint: UpHint;
};

const useCreateChunkInstance = ({
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
  geometry,
  hint = "auto-normals",
}: Props) => {
  const dummy = useMemo(() => new Object3D(), []);
  const [chunks, setChunks] = useState<Matrix4[][]>([]);

  // 2) ВИЗНАЧАЄМО ЛОКАЛЬНУ "ВГОРУ" МОДЕЛІ + ПРАВИЛЬНИЙ pivotToBottom + qPre
  const { pivotToBottom, qPre } = useMemo(
    () => computeUpAndPivot(geometry, /* наприклад */ hint),
    [geometry, hint]
  );

  const tmp = useMemo(
    () => ({
      qAlign: new Quaternion(),
      qYaw: new Quaternion(),
      qFinal: new Quaternion(),
      pos: new Vector3(),
      n: new Vector3(0, 1, 0),
      t: new Vector3(1, 0, 0),
      b: new Vector3(0, 0, 1),
      plane: new Plane(),
    }),
    []
  );

  useEffect(() => {
    if (!geometry) return;

    const rng = mulberry32(seed);
    const allMatrices: Matrix4[] = [];
    let index = 0;

    for (let s = 0; s < strokes.length && index < limit; s++) {
      const stroke = strokes[s];
      const n0 = strokeNormals[s];
      if (!stroke?.length || !n0) continue;

      // нормаль площини штриха
      const n = n0.clone().normalize();
      tmp.plane.setFromNormalAndCoplanarPoint(n, stroke[0]);

      for (let i = 0; i < stroke.length && index < limit; i++) {
        const cur = stroke[i];
        const prev = stroke[i - 1] ?? cur;
        const next = stroke[i + 1] ?? cur;

        // дотична у площині (t ⟂ n)
        tmp.t.copy(next).sub(prev);
        if (tmp.t.lengthSq() < 1e-12) {
          tmp.t.set(1, 0, 0);
          if (Math.abs(tmp.t.dot(n)) > 0.95) tmp.t.set(0, 0, 1);
        }
        tmp.t.addScaledVector(n, -tmp.t.dot(n)).normalize();

        // бінормаль b = n × t
        tmp.b.crossVectors(n, tmp.t).normalize();

        for (let k = 0; k < density && index < limit; k++) {
          // випадкове зміщення в диску
          const u = rng();
          const r = radius * Math.sqrt(u);
          const theta = 2 * Math.PI * rng();

          // позиція у площині (b, t) + поздовжній offset
          tmp.pos
            .copy(cur)
            .addScaledVector(tmp.b, Math.cos(theta) * r)
            .addScaledVector(tmp.t, Math.sin(theta) * r + offset);

          // тримаємо точку точно на площині
          tmp.plane.projectPoint(tmp.pos, tmp.pos);

          // базова позиція для "п’ятки" моделі — трохи від поверхні
          const basePos = tmp.pos.clone().addScaledVector(n, EPS_NORMAL);

          // базис у площині для yaw (навколо n)
          const up = n;
          const tmpAxis =
            Math.abs(up.y) < 0.999
              ? new Vector3(0, 1, 0)
              : new Vector3(1, 0, 0);
          const right = new Vector3().crossVectors(up, tmpAxis).normalize();
          const fwd = new Vector3().crossVectors(right, up).normalize();

          const yaw =
            (rotationDeg * Math.PI) / 180 +
            (rng() - 0.5) * 2 * Math.PI * randomness;

          const c = Math.cos(yaw),
            s = Math.sin(yaw);
          const right2 = right
            .clone()
            .multiplyScalar(c)
            .addScaledVector(fwd, s);
          const fwd2 = right.clone().multiplyScalar(-s).addScaledVector(fwd, c);

          // оберт, що вирівнює модель до площини (Y->n) і обертає в площині (yaw)
          tmp.qAlign.setFromRotationMatrix(
            new Matrix4().makeBasis(right2, up, fwd2)
          );

          // матриці трансформацій
          const sScale = scale * (1 + (rng() - 0.5) * 2 * randomness);

          const M_t = new Matrix4().makeTranslation(
            basePos.x,
            basePos.y,
            basePos.z
          ); // світова позиція п’ятки
          const M_rAlign = new Matrix4().makeRotationFromQuaternion(tmp.qAlign); // вирівнювання + yaw
          const M_s = new Matrix4().makeScale(sScale, sScale, sScale); // масштаб
          const M_pivot = new Matrix4().makeTranslation(0, pivotToBottom, 0); // підняти геометрію так, щоб п’ятка стала в локальний origin
          const M_pre = new Matrix4().makeRotationFromQuaternion(qPre); // преротейшн (локальна up -> +Y)

          // фінальна матриця інстанса: T * R_align * S * T(pivot) * R_pre
          const M_inst = new Matrix4()
            .multiply(M_t)
            .multiply(M_rAlign)
            .multiply(M_s)
            .multiply(M_pivot)
            .multiply(M_pre);

          allMatrices.push(M_inst.clone());
          index++;
        }
      }
    }

    const cellSize = 5; // підбери під сцену
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
    geometry,
    pivotToBottom,
    qPre,
  ]);

  return chunks;
};

export default useCreateChunkInstance;

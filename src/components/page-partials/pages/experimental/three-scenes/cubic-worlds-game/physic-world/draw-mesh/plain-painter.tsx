// PlanePainter.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Raycaster,
  Vector3,
} from "three";
import { randFloat } from "three/src/math/MathUtils.js";
import { useDrawMeshStore } from "../../store/useDrawMeshStore";
import { Line } from "@react-three/drei";

const EPS_NORMAL = 0.0001; // невеличкий підйом над поверхнею (щоб не мерехтіло)

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = {
  /** Максимальна кількість інстансів у буфері */
  limit?: number;
  /** Початковий розмір площини (геометрія 1x1, масштаб = розмір) */
  baseSize?: number;
  /** Показувати прев’ю-курсор (площина/коло) */
  showPreview?: boolean;
};

export default function PlanePainter({
  limit = 100_000,
  baseSize = 1,
  showPreview = true,
}: Props) {
  const { camera, pointer, gl, raycaster } = useThree();
  const targets = useDrawMeshStore((s) => s.targets); // об’єкти для малювання
  const setIsDraw = useDrawMeshStore((s) => s.setIsDrawing);

  // --- Leva: параметри "кисті"
  const {
    isDraw,
    density, // щільність (інстансів на метр шляху)
    previewCircle, // тип прев’ю (коло/площина)
    offset,
    projectToSurface,
    seed,
    radius,
    randomness,
    rotationDeg,
    scale,
    useNormalRotation,
    width,
    spacing,
  } = useControls("Plane Painter", {
    isDraw: false,
    previewCircle: true,
    width: { value: 0.6, min: 0.05, max: 5, step: 0.05 },
    spacing: { value: 0.15, min: 0.02, max: 1, step: 0.01 },
    density: { value: 1, min: 0.1, max: 100, step: 1 },
    radius: { value: 1, min: 0.05, max: 5, step: 0.05 },
    scale: { value: 0.3, min: 0.02, max: 5, step: 0.01 },
    randomness: { value: 0.8, min: 0, max: 1, step: 0.01 },
    useNormalRotation: false,
    rotationDeg: { value: 29, min: -180, max: 180, step: 1 },
    offset: { value: 0, min: -2, max: 2, step: 0.01 },
    projectToSurface: true,
    seed: { value: 0, min: 0, max: 9999, step: 1 },
  });

  // --- refs / стани
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const lastPoint = useRef<Vector3 | null>(null);
  const lastTangent = useRef<Vector3>(new Vector3(1, 0, 0));
  const isDown = useRef(false);
  const countRef = useRef(0);
  const previewRef = useRef<Object3D>(null!);
  const [strokes, setStrokes] = useState<Vector3[][]>([]);
  const [strokeNormals, setStrokeNormals] = useState<Vector3[]>([]);
  const [pivotToBottom, setPivotToBottom] = useState(0);
  const tmp = useMemo(
    () => ({
      q: new Quaternion(),
      q2: new Quaternion(),
      pos: new Vector3(),
      n: new Vector3(0, 1, 0),
      t: new Vector3(1, 0, 0),
      b: new Vector3(0, 0, 1),
      m: new Matrix4(),
      plane: new Plane(),
    }),
    []
  );
  useEffect(() => {
    setIsDraw(isDraw);
  }, [isDraw, setIsDraw]);

  // --- Прев’ю курсора
  useFrame((_, dt) => {
    if (!isDraw) return;
    raycaster.setFromCamera(pointer, camera);
    const list = Array.isArray(targets) ? targets : [targets];
    const intersects = raycaster.intersectObjects(list, true);
    const i = intersects[0];
    if (i) {
      const worldNormal = i.face
        ? i.face.normal.clone().transformDirection(i.object.matrixWorld)
        : new Vector3(0, 1, 0);
      const hit = {
        point: i.point.clone(),
        normal: worldNormal,
        object: i.object,
      };

      if (previewRef.current) {
        const target = hit.point
          .clone()
          .add(hit.normal.clone().normalize().multiplyScalar(0.01));
        previewRef.current.position.lerp(target, 1 - Math.pow(0.0001, dt)); // плавно
        // розвертаємо коло під нормаль поверхні (за замовч. up=(0,1,0))
        const q = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          hit.normal.clone().normalize()
        );
        previewRef.current.quaternion.slerp(q, 1 - Math.pow(0.0001, dt));
      }
    }
  });

  const onMove = useCallback(() => {
    if (!isDown.current || !previewRef.current) return;
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const p = previewRef.current.position.clone();
      const lastStroke = prev[prev.length - 1];
      const last = lastStroke[lastStroke.length - 1];
      if (last && last.distanceTo(p) < spacing) return prev;
      const next = prev.slice();
      next[next.length - 1] = [...lastStroke, p];
      return next;
    });
  }, [spacing]);

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: MouseEvent) => {
      if (!isDraw || e.button !== 0) return;
      isDown.current = true;
      lastPoint.current = null;

      setStrokes((prev) => [...prev, []]);

      // оновити ray по курсору
      raycaster.setFromCamera(pointer, camera);
      const list = Array.isArray(targets) ? targets : [targets];
      const hit = raycaster.intersectObjects(list, true)[0];
      const n = new Vector3(0, 1, 0);
      if (hit) {
        n.copy(hit.face!.normal)
          .transformDirection(hit.object.matrixWorld)
          .normalize();
        // якщо нормаль «дивиться» у той самий бік, що і промінь — розвернути
        if (n.dot(raycaster.ray.direction) > 0) n.multiplyScalar(-1);
      } else if (previewRef.current) {
        n.set(0, 0, 1)
          .applyQuaternion(previewRef.current.quaternion)
          .normalize();
      }
      setStrokeNormals((prev) => [...prev, n]);
    };

    const onUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown.current = false;
      lastPoint.current = null;
    };

    if (isDraw) {
      el.addEventListener("mousedown", onDown);
      el.addEventListener("mouseup", onUp);
      el.addEventListener("mousemove", onMove);
    } else {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    }

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    };
  }, [gl, isDraw, onMove, camera, raycaster, pointer, targets]);

  useEffect(() => {
    const g = meshRef.current?.geometry;
    if (!g) return;
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    setPivotToBottom(-bb.min.y); // для box = halfHeight
  }, []);

  // --- Побудова інстансів при зміні штрихів/параметрів
  useEffect(() => {
    const inst = meshRef.current;
    if (!inst) return;
    const rng = mulberry32(seed);

    // проходимо всі точки всіх штрихів
    // const EPS_NORMAL = 0.01;

    let index = 0;

    for (let s = 0; s < strokes.length && index < limit; s++) {
      const stroke = strokes[s];
      const n0 = strokeNormals[s];
      if (!stroke?.length || !n0) continue;

      const n = n0.clone().normalize();

      // площина штриха (нормаль n + перша точка як опорна)
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
          // випадкове зміщення в диску
          const u = rng();
          const r = radius * Math.sqrt(u);
          const theta = 2 * Math.PI * rng();

          // позиція у площині (b, t) + поздовжній offset
          tmp.pos
            .copy(cur)
            .addScaledVector(tmp.b, Math.cos(theta) * r)
            .addScaledVector(tmp.t, Math.sin(theta) * r + offset);

          // проєкція на площину — тримаємо рівно на поверхні
          tmp.plane.projectPoint(tmp.pos, tmp.pos);

          // ОРІЄНТАЦІЯ: тільки навколо нормалі
          // 1) вирівняти локальний Y моделі по нормалі n
          // 2) дозволити лише yaw навколо n (ручний + опційний випадковий)
          tmp.q.identity();
          // кут: фіксований + опціональний випадковий
          const yaw =
            (rotationDeg * Math.PI) / 180 +
            (rng() - 0.5) * 2 * Math.PI * randomness;
          tmp.q2.setFromAxisAngle(n, yaw);
          tmp.q.multiply(tmp.q2);

          // масштаб та підйом на половину висоти ВЗДОВЖ n
          const sScale = scale * (1 + (rng() - 0.5) * 2 * randomness);
          tmp.pos.addScaledVector(n, pivotToBottom * sScale + EPS_NORMAL);

          // запис інстанса
          dummy.position.copy(tmp.pos);
          dummy.quaternion.copy(tmp.q);
          dummy.scale.setScalar(Math.max(0.001, sScale));
          dummy.updateMatrix();
          inst.setMatrixAt(index++, dummy.matrix);
        }
      }
    }

    inst.count = index; // скільки реально інстансів намалювали
    inst.instanceMatrix.needsUpdate = true;
  }, [
    strokes,
    density,
    dummy,
    tmp,
    radius,
    scale,
    randomness,
    useNormalRotation,
    rotationDeg,
    offset,
    seed,
    limit,
    targets,
    raycaster,
    projectToSurface,
    strokeNormals,
    pivotToBottom,
  ]);

  return (
    <>
      {/* Прев’ю пензля */}
      {showPreview && isDraw && (
        <>
          <group ref={previewRef}>
            {previewCircle ? (
              <mesh>
                <circleGeometry args={[width * 0.5, 32]} />
                <meshBasicMaterial
                  color="#ff0000"
                  transparent
                  opacity={0.35}
                  depthWrite={false}
                />
              </mesh>
            ) : (
              <mesh>
                <planeGeometry args={[width, width]} />
                <meshBasicMaterial
                  color="#ff0000"
                  transparent
                  opacity={0.35}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        </>
      )}
      <group userData={{ camExcludeCollision: true }}>
        {strokes.map((pts, i) =>
          pts.length > 1 ? (
            <Line key={i} points={pts} color="red" lineWidth={2} />
          ) : null
        )}
      </group>
      {/* Інстанси — сюди підстав свій меш (трава/камінці тощо) */}
      <instancedMesh
        ref={meshRef}
        frustumCulled={false}
        args={[
          undefined as unknown as BufferGeometry,
          undefined as unknown as MeshBasicMaterial,
          limit,
        ]}
      >
        {/* приклад геометрії — заміни на свою */}
        <boxGeometry args={[baseSize, baseSize, baseSize]} />
        <meshBasicMaterial color={"#8899ff"} />
      </instancedMesh>
      {/* Інстансований меш площин */}
      {/* <instancedMesh
        ref={meshRef}
        args={[
          undefined as unknown as BufferGeometry,
          undefined as unknown as MeshBasicMaterial,
          limit,
        ]}
      >
        <planeGeometry args={[baseSize, baseSize]} />
        <meshBasicMaterial color={"#88cc66"} side={2} />
      </instancedMesh> */}
    </>
  );
}

// PlanePainter.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Raycaster,
  Vector3,
} from "three";
import { randFloat } from "three/src/math/MathUtils.js";
import { useDrawMeshStore } from "../../store/useDrawMeshStore";
import { Line } from "@react-three/drei";

const EPS_NORMAL = 0.02; // невеличкий підйом над поверхнею (щоб не мерехтіло)

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
    width, // ширина доріжки навколо шляху (м)
    spacing, // крок семплів уздовж шляху (м)
    density, // щільність (інстансів на метр шляху)
    sizeMin, // мін. масштаб (множник до baseSize)
    sizeMax, // макс. масштаб
    yawMinDeg, // мін. поворот навколо Y
    yawMaxDeg, // макс. поворот навколо Y
    jitter, // додатковий поперечний шум (м)
    previewCircle, // тип прев’ю (коло/площина)
  } = useControls("Plane Painter", {
    isDraw: false,
    previewCircle: true,
    width: { value: 0.6, min: 0.05, max: 5, step: 0.05 },
    spacing: { value: 0.15, min: 0.02, max: 1.0, step: 0.01 },
    density: { value: 6, min: 1, max: 50, step: 1 },
    sizeMin: { value: 0.7, min: 0.1, max: 5, step: 0.05 },
    sizeMax: { value: 1.3, min: 0.1, max: 5, step: 0.05 },
    yawMinDeg: { value: -45, min: -180, max: 180, step: 1 },
    yawMaxDeg: { value: 45, min: -180, max: 180, step: 1 },
    jitter: { value: 0.1, min: 0, max: 1, step: 0.01 },
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
          .add(hit.normal.clone().normalize().multiplyScalar(0.0001));
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

  // --- wheel -> змінюємо ширину кисті (зручно)
  //   useEffect(() => {
  //     const el = gl.domElement;
  //     const onWheel = (e: WheelEvent) => {
  //       if (!isDraw) return;
  //       e.preventDefault();
  //       // на жаль, Leva не змінюємо напряму; варіанти:
  //       // 1) винести width у локальний useState + показувати його в Leva через monitor
  //       // 2) залишити зміну ширини тільки через Leva
  //       // тут залишимо тільки Leva-контрол для простоти
  //     };
  //     el.addEventListener("wheel", onWheel, { passive: false });
  //     return () => el.removeEventListener("wheel", onWheel);
  //   }, [gl, isDraw, width]);

  //   --- mouse events

  const onMove = useCallback(() => {
    if (!isDown.current || !previewRef.current) return;

    setStrokes((prev) => {
      if (prev.length === 0 || !previewRef.current) return prev; // безпечна перевірка
      const p = previewRef.current.position.clone();

      // не додавати точки надто близько
      const lastStroke = prev[prev.length - 1];
      const last = lastStroke[lastStroke.length - 1];
      if (last && last.distanceTo(p) < spacing) return prev;

      // створюємо новий масив для останнього штриха (без мутації стану)
      const next = prev.slice();
      const updatedLast = lastStroke ? [...lastStroke, p] : [p];
      next[next.length - 1] = updatedLast;

      lastPoint.current = p;
      return next;
    });
  }, [spacing]);

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: MouseEvent) => {
      if (!isDraw || e.button !== 0) return; // лише ЛКМ
      isDown.current = true;
      lastPoint.current = null;

      // старт нового штриха
      setStrokes((prev) => [...prev, []]);
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
  }, [gl, isDraw, onMove]);

  // --- основний цикл малювання
  //   useFrame(() => {
  //     if (!isDraw || !isDown.current || !meshRef.current) return;

  //     localRay.setFromCamera(pointer, camera);
  //     const list = Array.isArray(targets) ? targets : [targets];
  //     const hit = localRay.intersectObjects(list, true)?.[0];
  //     if (!hit) return;

  //     const normal = hit.face
  //       ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
  //       : new Vector3(0, 1, 0);

  //     const point = hit.point.clone().addScaledVector(normal, EPS_NORMAL);

  //     // семплимо шлях рівномірно
  //     const lp = lastPoint.current;
  //     if (!lp) {
  //       lastPoint.current = point.clone();
  //       return;
  //     }
  //     const seg = point.distanceTo(lp);
  //     if (seg < spacing) return;

  //     // напрямок руху пензля (тангент)
  //     const tangent = point.clone().sub(lp).normalize();
  //     if (!isFinite(tangent.length())) tangent.set(1, 0, 0);
  //     lastTangent.current.copy(tangent);

  //     // "правий" вектор поперек шляху у площині поверхні
  //     const right = new Vector3().crossVectors(normal, tangent).normalize();
  //     if (right.lengthSq() < 1e-6) right.set(1, 0, 0);

  //     // скільки інстансів додати на цей крок
  //     // розуміння: density ≈ інстансів на метр шляху
  //     const instancesThisStep = Math.max(1, Math.round(density * seg));

  //     // кутові межі (рад)
  //     const yawMin = (yawMinDeg * Math.PI) / 180;
  //     const yawMax = (yawMaxDeg * Math.PI) / 180;

  //     // розкидання інстансів навколо центральної лінії з поперечним джитером
  //     for (let k = 0; k < instancesThisStep; k++) {
  //       // t уздовж сегмента (0..1) для рівномірності
  //       const t = (k + Math.random()) / instancesThisStep;
  //       const centerOnSeg = new Vector3().lerpVectors(lp, point, t);

  //       // поперечний зсув у діапазоні ширини кисті (±width/2)
  //       const lateral =
  //         (Math.random() - 0.5) * width + (Math.random() - 0.5) * jitter;
  //       const pos = centerOnSeg.clone().addScaledVector(right, lateral);

  //       // масштаб від і до (множник на baseSize)
  //       const s = randFloat(sizeMin, sizeMax) * baseSize;

  //       // орієнтація площини:
  //       // базово — вертикальна площина (XY) повертаємо в вертикаль (обертаємо -90° по X),
  //       // потім довільний оберт навколо Y у діапазоні
  //       const q = new Quaternion();
  //       const qPitch = new Quaternion().setFromAxisAngle(
  //         new Vector3(1, 0, 0),
  //         -Math.PI / 2
  //       ); // робимо її вертикальною
  //       const yaw = randFloat(yawMin, yawMax);
  //       const qYaw = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), yaw);
  //       q.multiply(qYaw).multiply(qPitch);

  //       // виставляємо матрицю інстансу
  //       dummy.position.copy(pos);
  //       dummy.quaternion.copy(q);
  //       dummy.scale.setScalar(s);
  //       dummy.updateMatrix();

  //       const i = countRef.current;
  //       if (i >= limit) continue; // буфер заповнений

  //       meshRef.current.setMatrixAt(i, dummy.matrix);
  //       countRef.current++;
  //     }

  //     meshRef.current.count = countRef.current;
  //     meshRef.current.instanceMatrix.needsUpdate = true;

  //     // посуваємо «останню» точку вперед — малюємо частіше на довгих сегментах
  //     const advance = spacing * Math.floor(seg / spacing);
  //     const nextBase = lp.clone().addScaledVector(tangent, advance);
  //     lastPoint.current = nextBase;
  //   });

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

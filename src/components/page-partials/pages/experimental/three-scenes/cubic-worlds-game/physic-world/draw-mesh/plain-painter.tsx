// PlanePainter.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Color, MeshBasicMaterial, Object3D, Quaternion, Vector3 } from "three";
import { useDrawMeshStore } from "../../store/useDrawMeshStore";
import { Line } from "@react-three/drei";
import AddWinderInstanceModel from "./add-winder-instance-model";
import "../../shaders/winder-shader";

type Props = {
  /** Максимальна кількість інстансів у буфері */
  limit?: number;
  /** Початковий розмір площини (геометрія 1x1, масштаб = розмір) */
  baseSize?: number;
  /** Показувати прев’ю-курсор (площина/коло) */
  showPreview?: boolean;
};

enum PainterColors {
  green = "green",
  red = "red",
}

export default function PlanePainter({
  limit = 100_000,
  showPreview = true,
}: Props) {
  const { camera, pointer, gl, raycaster } = useThree();
  const targets = useDrawMeshStore((s) => s.targets); // об’єкти для малювання
  const setIsEditMode = useDrawMeshStore((s) => s.setIsEditMode);
  const painterColor = useMemo(() => new Color(PainterColors.green), []);
  // --- Leva: параметри "кисті"
  const {
    isDraw,
    density, // щільність (інстансів на метр шляху)
    previewCircle, // тип прев’ю (коло/площина)
    offset,
    seed,
    radius,
    randomness,
    rotationDeg,
    scale,
    width,
    spacing,

    eraseRadius,
  } = useControls("Plane Painter", {
    drawingOptions: folder({
      isDraw: false,
      previewCircle: true,
      width: { value: 0.6, min: 0.05, max: 5, step: 0.05 },
      spacing: { value: 0.15, min: 0.02, max: 1, step: 0.01 },
    }),
    eraser: folder({
      eraseRadius: { value: 0.6, min: 0.05, max: 5, step: 0.05 },
    }),
    scatterOprionts: folder({
      density: { value: 1, min: 0.1, max: 100, step: 1 },
      radius: { value: 1, min: 0.05, max: 5, step: 0.05 },
      scale: { value: 0.3, min: 0.02, max: 5, step: 0.01 },
      randomness: { value: 0.8, min: 0, max: 1, step: 0.01 },
      rotationDeg: { value: 29, min: -180, max: 180, step: 1 },
      offset: { value: 0, min: -2, max: 2, step: 0.01 },
      seed: { value: 0, min: 0, max: 9999, step: 1 },
    }),
  });

  const lastPoint = useRef<Vector3 | null>(null);
  const isDown = useRef(false);
  const previewRef = useRef<Object3D>(null!);
  const [strokes, setStrokes] = useState<Vector3[][]>([]);
  const [strokeNormals, setStrokeNormals] = useState<Vector3[]>([]);

  const isErasing = useRef(false);
  const isKillStroke = useRef(false);

  const painterMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: painterColor,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    [painterColor]
  );

  const eraseAt = useCallback(
    (center: Vector3) => {
      setStrokes((prev) => {
        const newStrokes: Vector3[][] = [];
        const newNormals: Vector3[] = [];
        for (let s = 0; s < prev.length; s++) {
          const pts = prev[s];
          const n = strokeNormals[s];
          if (!pts?.length) continue;

          let seg: Vector3[] = [];
          for (let i = 0; i < pts.length; i++) {
            const keep = pts[i].distanceTo(center) > eraseRadius;
            if (keep) seg.push(pts[i]);
            else {
              if (seg.length > 1) {
                newStrokes.push(seg);
                newNormals.push(n);
              }
              seg = [];
            }
          }
          if (seg.length > 1) {
            newStrokes.push(seg);
            newNormals.push(n);
          }
        }
        setStrokeNormals(newNormals);
        return newStrokes;
      });
    },
    [eraseRadius, strokeNormals]
  );

  const killStrokeAt = useCallback(
    (center: Vector3) => {
      setStrokes((prev) => {
        const kept: Vector3[][] = [];
        const keptNormals: Vector3[] = [];
        for (let s = 0; s < prev.length; s++) {
          const pts = prev[s];
          let hit = false;
          for (let i = 0; i < pts.length && !hit; i++) {
            if (pts[i].distanceTo(center) <= eraseRadius) hit = true;
          }
          if (!hit) {
            kept.push(pts);
            keptNormals.push(strokeNormals[s]);
          }
        }
        setStrokeNormals(keptNormals);
        return kept;
      });
    },
    [eraseRadius, strokeNormals]
  );

  useEffect(() => {
    setIsEditMode(isDraw);
  }, [isDraw, setIsEditMode]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") isErasing.current = true;
      if (e.key === "v" || e.key === "V") isKillStroke.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") isErasing.current = false;
      if (e.key === "v" || e.key === "V") isKillStroke.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
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
    if (!previewRef.current) return;
    const p = previewRef.current.position.clone();

    if (isKillStroke.current) {
      painterColor.set(PainterColors.red);
      painterMaterial.color.set(painterColor);
      killStrokeAt(p);
      return;
    }

    if (isErasing.current) {
      painterColor.set(PainterColors.red);
      painterMaterial.color.set(painterColor);
      eraseAt(p);
      return;
    }
    // set default color
    painterColor.set(PainterColors.green);
    painterMaterial.color.set(painterColor);
    // звичайне малювання (як у тебе)
    if (!isDown.current) return;
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const p = previewRef.current?.position.clone();
      if (!p) return prev;
      const lastStroke = prev[prev.length - 1];
      const last = lastStroke[lastStroke.length - 1];
      if (last && last.distanceTo(p) < spacing) return prev;
      const next = prev.slice();
      next[next.length - 1] = [...lastStroke, p];
      return next;
    });
  }, [spacing, eraseAt, painterMaterial, painterColor, killStrokeAt]);

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

  // --- Побудова інстансів при зміні штрихів/параметрів

  return (
    <>
      {/* Прев’ю пензля */}
      {showPreview && isDraw && (
        <>
          <group ref={previewRef}>
            {previewCircle ? (
              <mesh material={painterMaterial}>
                <circleGeometry args={[width * 0.5, 32]} />
              </mesh>
            ) : (
              <mesh material={painterMaterial}>
                <planeGeometry args={[width, width]} />
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
      <AddWinderInstanceModel
        modelUrl="/3d-models/cubic-worlds-model/grass.glb"
        strokes={strokes}
        strokeNormals={strokeNormals}
        seed={seed}
        limit={limit}
        density={density}
        radius={radius}
        rotationDeg={rotationDeg}
        offset={offset}
        randomness={randomness}
        scale={scale}
      />
    </>
  );
}

// PlanePainter.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BufferGeometry,
  Color,
  Material,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { useEditModeStore } from "../../../store/useEditModeStore";
import { Line } from "@react-three/drei";
import ModelInstanceChunks from "../switch-load-models/model-instance-chuncks";
import { useEditPainterStore } from "../../../store/useEditPainterStore";
import { Key } from "@/config/key";
import { InstanceModelDraw, TypeModel } from "../../../config/3d-model.config";
import SwitchModelAdd from "../switch-load-models/switch-add-model";

type Props = {
  /** Максимальна кількість інстансів у буфері */
  limit?: number;
  /** Початковий розмір площини (геометрія 1x1, масштаб = розмір) */
  baseSize?: number;
  /** Показувати прев’ю-курсор (площина/коло) */
  onChunksCreated: (chunks: Matrix4[][]) => void;
  scatterModelDraw: InstanceModelDraw;
};

enum PainterColors {
  green = "green",
  red = "red",
}

const eraseRadius = 1;

export default function LinePainter({
  limit = 100_000,
  onChunksCreated,
  scatterModelDraw,
}: Props) {
  const { camera, pointer, gl, raycaster } = useThree();
  const targets = useEditModeStore((s) => s.targets); // об’єкти для малювання
  const painterColor = useMemo(() => new Color(PainterColors.green), []);
  const {
    spacing,
    density,
    radius,
    scale,
    randomness,
    rotationDeg,
    offset,
    seed,
  } = useEditPainterStore();

  const lastPoint = useRef<Vector3 | null>(null);
  const isDown = useRef(false);
  const previewRef = useRef<Object3D>(null!);
  const [strokes, setStrokes] = useState<Vector3[][]>([]);
  const [strokeNormals, setStrokeNormals] = useState<Vector3[]>([]);
  const [scatterModelType, setScatterModelType] = useState<{
    geom: BufferGeometry;
    material: Material | ShaderMaterial;
    type: TypeModel;
  } | null>(null);
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
    [strokeNormals]
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
    [strokeNormals, setStrokeNormals, setStrokes]
  );

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
      if (e.button !== 0) return;
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

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    };
  }, [gl, onMove, camera, raycaster, pointer, targets]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.code;
      if (key === Key.C) isErasing.current = true;
      if (key === Key.V) isKillStroke.current = true;
    };
    const up = (e: KeyboardEvent) => {
      const key = e.code;
      if (key === Key.C) isErasing.current = false;
      if (key === Key.V) isKillStroke.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // --- Побудова інстансів при зміні штрихів/параметрів

  // --- Прев’ю курсора
  useFrame((_, dt) => {
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

  return (
    <>
      {/* Прев’ю пензля */}
      <group ref={previewRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={painterMaterial}>
          <circleGeometry args={[radius, 32]} />
        </mesh>
      </group>
      <group userData={{ camExcludeCollision: true }}>
        {strokes.map((pts, i) =>
          pts.length > 1 ? (
            <Line key={i} points={pts} color="red" lineWidth={2} />
          ) : null
        )}
      </group>
      <SwitchModelAdd
        scatterModelDraw={scatterModelDraw}
        onCreateModelGeom={(geom, mat, type) => {
          setScatterModelType({ geom, material: mat, type });
        }}
      />
      {scatterModelType && (
        <ModelInstanceChunks
          geom={scatterModelType.geom}
          material={scatterModelType.material}
          type={scatterModelType.type}
          strokes={strokes}
          strokeNormals={strokeNormals}
          hint={scatterModelDraw.hintMode}
          seed={seed}
          limit={limit}
          density={density}
          radius={radius}
          rotationDeg={rotationDeg}
          offset={offset}
          randomness={randomness}
          isEditMode={false}
          scale={scale}
          onChunksCreated={onChunksCreated}
        />
      )}
    </>
  );
}

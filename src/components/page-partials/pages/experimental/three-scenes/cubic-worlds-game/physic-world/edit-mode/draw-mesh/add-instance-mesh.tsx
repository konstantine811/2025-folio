import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  NormalBufferAttributes,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { useEditModeStore } from "../../../store/useEditModeStore.tsx";
import { Key } from "@/config/key.ts";

type Props = {
  geom: BufferGeometry<NormalBufferAttributes>;
  material: Material | ShaderMaterial;
  onUpdateMatrices: (matrices: Matrix4[]) => void;
};

const AddInstanceMesh = ({ geom, material, onUpdateMatrices }: Props) => {
  const targets = useEditModeStore((s) => s.targets);
  // const setIsDraw = useEditModeStore((s) => s.setIsDrawing);
  const { camera, raycaster, pointer, gl } = useThree();
  const [placementPosition, setPlacementPosition] = useState<Matrix4[]>([]);
  const previewRef = useRef<InstancedMesh>(null!);
  const pointerMeshRef = useRef<Mesh>(null!);
  const [grabbing, setGrabbing] = useState(true);
  const [scaling, setScaling] = useState(false);
  const scaleStartDist = useRef(0); // стартова відстань курсора від центру (в NDC)
  const scaleStart = useRef(new Vector3(1, 1, 1)); // початковий scale інстанса на момент старту
  const scaleMin = 0.1; // clamp
  const scaleMax = 50.0; // clamp
  const scaleSensitivity = 1.5; // чутливість (множник)

  const listenMouseDowon = useCallback(() => {
    previewRef.current.updateMatrixWorld(true);
    const m = new Matrix4().copy(previewRef.current.matrixWorld);
    setPlacementPosition((prev) => [...prev, m]);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.code;
      // ==== SCALE (S) ====
      if (key === Key.S && previewRef.current) {
        scaleStart.current.copy(previewRef.current.scale);
        scaleStartDist.current = Math.hypot(pointer.x, pointer.y); // 0..~1.4
        setGrabbing(false);
        setScaling(true);
      }
    },
    [pointer]
  );

  const onResetHundle = useCallback(() => {
    setGrabbing(true);
    setScaling(false);
  }, []);

  useEffect(() => {
    onUpdateMatrices(placementPosition);
  }, [placementPosition, onUpdateMatrices]);

  useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("mousedown", listenMouseDowon);
    window.addEventListener("keypress", onKeyDown, { passive: true });
    window.addEventListener("keyup", onResetHundle, { passive: true });
    return () => {
      el.removeEventListener("mousedown", listenMouseDowon);
      window.removeEventListener("keypress", onKeyDown);
      window.removeEventListener("keyup", onResetHundle);
    };
  }, [gl, listenMouseDowon, onKeyDown, onResetHundle]);

  useFrame((_, dt) => {
    // ==== SCALE MODE ====
    if (scaling) {
      // 1) коефіцієнт відносно старту: >1 далі від центру, <1 ближче
      const dist = Math.hypot(pointer.x, pointer.y); // 0..~1.4
      // стабільний мультиплікатор: ratio^sensitivity
      const ratio = dist / Math.max(1e-6, scaleStartDist.current);
      const k = Math.pow(ratio, scaleSensitivity);

      // рівномірний масштаб (якщо треба неізотропний — розведи по осях)
      const next = scaleStart.current.clone().multiplyScalar(k);
      // clamp
      next.x = Math.min(scaleMax, Math.max(scaleMin, next.x));
      next.y = Math.min(scaleMax, Math.max(scaleMin, next.y));
      next.z = Math.min(scaleMax, Math.max(scaleMin, next.z));

      previewRef.current.scale.copy(next);
      pointerMeshRef.current.scale.copy(next).multiplyScalar(0.5);
    }

    if (grabbing) {
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
        if (previewRef.current && pointerMeshRef.current) {
          const target = hit.point
            .clone()
            .add(hit.normal.clone().normalize().multiplyScalar(0.001));
          previewRef.current.position.lerp(target, 1 - Math.pow(0.0001, dt)); // плавно
          pointerMeshRef.current.position.set(target.x, target.y, target.z);
          // розвертаємо коло під нормаль поверхні (за замовч. up=(0,1,0))
          const qY = new Quaternion().setFromUnitVectors(
            new Vector3(0, 1, 0),
            hit.normal.clone().normalize()
          );

          const qZ = new Quaternion().setFromUnitVectors(
            new Vector3(0, 0, 1),
            hit.normal.clone().normalize()
          );
          previewRef.current.quaternion.slerp(qY, 1 - Math.pow(0.0001, dt));
          pointerMeshRef.current.quaternion.set(qZ.x, qZ.y, qZ.z, qZ.w);
          pointerMeshRef.current.scale.set(
            previewRef.current.scale.x / 2,
            previewRef.current.scale.y / 2,
            previewRef.current.scale.z / 2
          );
        }
      }
    }
  });
  return (
    <>
      {
        <>
          <mesh ref={pointerMeshRef}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              transparent
              color={"red"}
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
          <instancedMesh
            ref={previewRef}
            args={[geom, material, 1]}
            receiveShadow
            frustumCulled={false}
          />
        </>
      }
    </>
  );
};

export default AddInstanceMesh;

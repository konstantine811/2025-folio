import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { Mesh, Quaternion, Vector3 } from "three";
import { useDrawMeshStore } from "../../store/useDrawMeshStore";
import { clamp } from "three/src/math/MathUtils.js";

const MIN_D = 0.1; // мінімальний діаметр
const MAX_D = 20; // максимальний діаметр
const STEP = 0.12; // чутливість скролу (логарифмічна)

const DrawMesh = () => {
  const { isDraw, isCircle } = useControls("Draw mesh", {
    isDraw: false,
    isCircle: false,
  });
  const targets = useDrawMeshStore((s) => s.targets);
  const setIsDraw = useDrawMeshStore((s) => s.setIsDrawing);
  const { camera, raycaster, pointer, gl } = useThree();
  const ref = useRef<Mesh>(null!);

  // діаметр (масштаб по X/Y; геометрія 1×1 → масштаб = діаметр)
  const [diameter, setDiameter] = useState(1);
  const dRef = useRef(diameter);

  useEffect(() => {
    dRef.current = diameter;
  }, [diameter]);

  // 1) Глобальний wheel: коли isDraw=true — змінюємо діаметр
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      if (!isDraw) return;
      e.preventDefault(); // важливо для OrbitControls
      e.stopPropagation();
      // гладке масштабування (експоненційно; коліщатко вгору — збільшити)
      const scaleFactor = Math.exp((e.deltaY / 100) * STEP);
      const next = clamp(dRef.current * scaleFactor, MIN_D, MAX_D);
      setDiameter(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [gl, isDraw]);

  useEffect(() => {
    setIsDraw(isDraw);
  }, [isDraw, setIsDraw]);

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
      if (ref.current) {
        const target = hit.point
          .clone()
          .add(hit.normal.clone().normalize().multiplyScalar(0.1));
        ref.current.position.lerp(target, 1 - Math.pow(0.0001, dt)); // плавно
        // розвертаємо коло під нормаль поверхні (за замовч. up=(0,1,0))
        const q = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          hit.normal.clone().normalize()
        );
        ref.current.quaternion.slerp(q, 1 - Math.pow(0.0001, dt));
      }
    }
  });
  return (
    <>
      {isDraw && (
        <mesh ref={ref}>
          {isCircle ? (
            <ringGeometry args={[0, diameter, 32]} />
          ) : (
            <planeGeometry args={[diameter, diameter]} />
          )}
          s
          <meshBasicMaterial
            transparent
            color={"red"}
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
};

export default DrawMesh;

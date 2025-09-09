import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mesh, Quaternion, Vector2, Vector3 } from "three";
import { useDrawMeshStore } from "../../store/useDrawMeshStore";
import { clamp } from "three/src/math/MathUtils.js";
import { useGLTF } from "@react-three/drei";
import { GrassSingle } from "./grass-single";
import { GrassField, GrassPlacement } from "./grass-placement";

import "../../shaders/winder-shader.ts";

const MIN_D = 0.1; // мінімальний діаметр
const MAX_D = 20; // максимальний діаметр
const STEP = 0.12; // чутливість скролу (логарифмічна)

const DrawMesh = () => {
  const { isDraw, isCircle } = useControls("Draw mesh", {
    isDraw: false,
    isCircle: false,
  });
  const targets = useDrawMeshStore((s) => s.targets);
  // const setIsDraw = useDrawMeshStore((s) => s.setIsDrawing);
  const { camera, raycaster, pointer, gl } = useThree();
  const [placementPosition, setPlacementPosition] = useState<GrassPlacement[]>(
    []
  );
  const ref = useRef<Mesh>(null!);
  const SCALE_GRASS = 5;
  // діаметр (масштаб по X/Y; геометрія 1×1 → масштаб = діаметр)
  const [diameter, setDiameter] = useState(1);
  const [centerMesh, setCenterMesh] = useState<Vector3>(new Vector3());
  const [rotationMesh, setRotationMesh] = useState<Quaternion>(
    new Quaternion()
  );
  const dRef = useRef(diameter);

  useEffect(() => {
    dRef.current = diameter;
  }, [diameter]);

  // 1) Глобальний wheel: коли isDraw=true — змінюємо діаметр
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // важливо для OrbitControls
      e.stopPropagation();
      // гладке масштабування (експоненційно; коліщатко вгору — збільшити)
      const scaleFactor = Math.exp((e.deltaY / 100) * STEP);
      const next = clamp(dRef.current * scaleFactor, MIN_D, MAX_D);
      setDiameter(next);
    };
    if (!isDraw) {
      el.removeEventListener("wheel", onWheel);
    } else {
      el.addEventListener("wheel", onWheel, { passive: false });
    }
    return () => el.removeEventListener("wheel", onWheel);
  }, [gl, isDraw]);

  // useEffect(() => {
  //   setIsDraw(isDraw);
  // }, [isDraw, setIsDraw]);

  const listenMouseDowon = useCallback(() => {
    if (isDraw) {
      setPlacementPosition((prev) => {
        return [
          ...prev,
          {
            center: centerMesh,
            rotation: rotationMesh,
            diameter: diameter * SCALE_GRASS,
          },
        ];
      });
    }
  }, [isDraw, centerMesh, rotationMesh, diameter]);

  useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("mousedown", listenMouseDowon);
    return () => {
      el.removeEventListener("mousedown", listenMouseDowon);
    };
  }, [gl, listenMouseDowon]);

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
        setCenterMesh(ref.current.position.clone());
        // розвертаємо коло під нормаль поверхні (за замовч. up=(0,1,0))
        const q = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          hit.normal.clone().normalize()
        );
        setRotationMesh(q);
        ref.current.quaternion.slerp(q, 1 - Math.pow(0.0001, dt));
      }
    }
  });
  return (
    <>
      {isDraw && (
        <>
          <mesh ref={ref}>
            {isCircle ? (
              <circleGeometry args={[diameter, 32]} />
            ) : (
              <planeGeometry args={[diameter, diameter]} />
            )}
            <meshBasicMaterial
              transparent
              color={"red"}
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
          <GrassSingle
            center={centerMesh}
            rotation={rotationMesh}
            diameter={diameter * SCALE_GRASS}
            modelUrl="/3d-models/cubic-worlds-model/grass.glb"
            materialProps={{
              _fallbackEdgeWidth: 10.5, // 0..0.5
              _fallbackEdgeDark: 2.01, // мін. яскравість краю
              uWindAmp: 0.03,
              transparency: 0.3,
              uWindFreq: 3.2,
              uWindDir: new Vector2(1.85, 1.2).normalize(),
              windDirNoiseScale: 0.5, // масштаб шуму напряму
              windStrNoiseScale: 0.25, // масштаб шуму сили
              gustStrength: 0.25, // поривчастість (shape)
              noiseScrollDir: 0.5, // “дрейф” карти вітру
            }}
            // yAt: за потреби — під рельєф
          />
        </>
      )}
      <GrassField
        placements={placementPosition}
        modelUrl="/3d-models/cubic-worlds-model/grass.glb"
        materialProps={{
          _fallbackEdgeWidth: 10.5, // 0..0.5
          _fallbackEdgeDark: 2.01, // мін. яскравість краю
          uWindAmp: 0.03,
          transparency: 0.3,
          uWindFreq: 3.2,
          uWindDir: new Vector2(1.85, 1.2).normalize(),
          windDirNoiseScale: 0.5, // масштаб шуму напряму
          windStrNoiseScale: 0.25, // масштаб шуму сили
          gustStrength: 0.25, // поривчастість (shape)
          noiseScrollDir: 0.5, // “дрейф” карти вітру
        }}
      />
    </>
  );
};

export default DrawMesh;
useGLTF.preload("/3d-models/cubic-worlds-model/grass.glb");

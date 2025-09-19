import {
  OrthographicCamera,
  TransformControls,
  useHelper,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SceneObjectName } from "../../character-controller/config/character.config";

type Props = {
  showHelpers?: boolean;
  enableLightGizmo?: boolean;
  enableTargetGizmo?: boolean;
};

export default function Lights({
  showHelpers = false,
  enableLightGizmo = true,
  enableTargetGizmo = true,
}: Props) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);
  const { scene } = useThree();

  /** -------------------- Helpers -------------------- */
  // 1) Хелпер для самого DirectionalLight
  useHelper(
    showHelpers ? lightRef : null,
    THREE.DirectionalLightHelper,
    5,
    "hotpink"
  );

  // 2) Хелпер для shadow-camera (ортографічної)
  useEffect(() => {
    if (!showHelpers || !lightRef.current?.shadow?.camera) return;
    const cam = lightRef.current.shadow.camera as THREE.OrthographicCamera;
    const camHelper = new THREE.CameraHelper(cam);
    scene.add(camHelper);
    // оновлювати, коли світло рухається
    const update = () => {
      cam.updateProjectionMatrix();
      camHelper.update();
    };
    update();
    return () => {
      scene.remove(camHelper);
      camHelper.dispose();
    };
  }, [showHelpers, scene]);

  /** -------------------- Target (напрямок світла) -------------------- */
  // Прив'язуємо реальний target об'єкт до ліхтаря
  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return;
    lightRef.current.target = targetRef.current;
    // target має бути в сцені
    if (!targetRef.current.parent) scene.add(targetRef.current);
    // щоб DirectionalLightHelper показувався вірно:
    lightRef.current.target.updateMatrixWorld();
    lightRef.current.updateMatrixWorld();
  }, [scene]);

  // Робочі стани для TransformControls (можна вимикати окремо)
  //   const [lightMode] = useState<"translate" | "rotate" | "scale">("translate");
  //   const [targetMode] = useState<"translate" | "rotate" | "scale">("translate");

  return (
    <>
      {/* Саме світло */}
      <directionalLight
        name={SceneObjectName.characterLight}
        ref={lightRef}
        position={[30, 50, 25]}
        intensity={0.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      >
        {/* Ортографічна камера тіней */}
        <OrthographicCamera
          attach="shadow-camera"
          left={-40}
          right={40}
          top={40}
          bottom={-40}
          near={1}
          far={120}
        />
      </directionalLight>

      {/* Видимий “маркер” таргета (для наочності) */}
      <mesh ref={targetRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="orange" />
      </mesh>

      {/* -------- TransformControls для світла -------- */}
      {/* {enableLightGizmo && lightRef.current && (
        <TransformControls
          object={lightRef.current}
          mode={lightMode}
          showX
          showY
          showZ
          onChange={() => {
            // при русі світла — оновити target матрицю
            lightRef.current?.target.updateMatrixWorld();
          }}
        />
      )} */}

      {/* -------- TransformControls для таргета -------- */}
      {/* {enableTargetGizmo && targetRef.current && (
        <TransformControls
          object={targetRef.current}
          mode={targetMode}
          showX
          showY
          showZ
          onChange={() => {
            lightRef.current?.target.updateMatrixWorld();
          }}
        />
      )} */}
    </>
  );
}

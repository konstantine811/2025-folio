import { CameraControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
// 2️⃣ Це клас з ACTION
import CameraControlsImpl from "camera-controls";
import { usePauseStore } from "../store/usePauseMode";
import { CatmullRomCurve3 } from "three";
import { useEditModeStore } from "../store/useEditModeStore";
import { useGameDataStore } from "../physic-world/character-controller/stores/game-data-store";
import { desktopCurveLine, desktopCurveLineLookAt } from "./config";
import useScrollFlyCamera from "./useScrollFlyCamera";

const FlyCameraControl = ({
  active,
  scrolledControl,
}: {
  active: boolean;
  scrolledControl: boolean;
}) => {
  const cameraControlRef = useRef<CameraControls | null>(null!);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const setCameraControls = useEditModeStore((s) => s.setCameraControls);

  const characterRb = useGameDataStore((s) => s.characterRigidBody);

  const curveLine = useMemo(() => [...desktopCurveLine], []);
  const curveLineLookAt = useMemo(() => [...desktopCurveLineLookAt], []);
  const curve = useMemo(
    () => new CatmullRomCurve3(curveLine, false, "catmullrom", 0.5),
    [curveLine]
  );
  // 45.25110153087106, y: 1.9843068863214892, z: 32.346953168643104
  const curveLookAt = useMemo(
    () => new CatmullRomCurve3(curveLineLookAt, false, "catmullrom", 0.5),
    [curveLineLookAt]
  );
  useScrollFlyCamera({
    scrolledControl,
    isGameStarted: !!isGameStarted,
    cameraControlRef,
    curveLine,
    curveLineLookAt,
  });
  useEffect(() => {
    const controls = cameraControlRef.current;
    if (!controls) return;
    setCameraControls(controls);
    if (!isGameStarted) {
      controls.setPosition(
        curve.points[0].x,
        curve.points[0].y,
        curve.points[0].z
      );
      controls.setTarget(
        curveLookAt.points[0].x,
        curveLookAt.points[0].y,
        curveLookAt.points[0].z
      );
    }
    controls.mouseButtons.left = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ROTATE;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY;
      }
      if (e.key === "Shift") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.TRUCK;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Shift") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ROTATE;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setCameraControls, isGameStarted, curveLookAt, curve]);

  useEffect(() => {
    const controls = cameraControlRef.current;
    if (!controls) return;
    if (active && characterRb) {
      const { x, y, z } = characterRb.translation();
      controls.setPosition(x + 2, y + 2, z + 2);
    }
  }, [active, characterRb]);

  return (
    <CameraControls
      ref={cameraControlRef}
      makeDefault
      enabled={active && isGameStarted}
      azimuthRotateSpeed={1}
      polarRotateSpeed={1}
      truckSpeed={1}
    />
  );
};

export default FlyCameraControl;

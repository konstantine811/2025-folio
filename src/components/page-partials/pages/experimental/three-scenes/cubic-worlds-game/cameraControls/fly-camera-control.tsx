import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
// 2️⃣ Це клас з ACTION
import CameraControlsImpl from "camera-controls";

const FlyCameraControl = ({ active }: { active: boolean }) => {
  const cameraControlRef = useRef<CameraControls | null>(null!);

  useEffect(() => {
    const controls = cameraControlRef.current;
    if (!controls) return;
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
  }, []);

  return (
    <CameraControls
      ref={cameraControlRef}
      makeDefault
      enabled={active}
      azimuthRotateSpeed={3}
      polarRotateSpeed={3}
      truckSpeed={5}
    />
  );
};

export default FlyCameraControl;

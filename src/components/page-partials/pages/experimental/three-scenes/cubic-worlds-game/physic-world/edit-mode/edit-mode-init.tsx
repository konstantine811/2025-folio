import { useThree } from "@react-three/fiber";
import { useEditModeStore } from "../../store/useEditModeStore";
import EditMode from "./edit-mode";
import { useCallback, useEffect } from "react";

const EditModeInit = () => {
  const isEditMode = useEditModeStore((s) => s.isEditMode);
  const { gl } = useThree();

  const pointerDownEvent = useCallback(
    (e: PointerEvent) => {
      if (isEditMode) return;
      const canvas = e.currentTarget as HTMLDivElement;
      if (canvas && "requestPointerLock" in canvas) {
        canvas.requestPointerLock();
      }
    },
    [isEditMode]
  );

  useEffect(() => {
    gl.domElement.addEventListener("pointerdown", pointerDownEvent);
    return () => {
      gl.domElement.removeEventListener("pointerdown", pointerDownEvent);
    };
  }, [gl, pointerDownEvent]);
  return <>{isEditMode && <EditMode />}</>;
};

export default EditModeInit;

import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo } from "react";
import { Object3D } from "three";

const CameraLessonSetup1 = () => {
  const { camera, scene } = useThree();

  const pivot = useMemo(() => new Object3D(), []);
  const followCam = useMemo(() => new Object3D(), []);

  const {
    pivotX,
    pivotY,
    pivotZ,
    pivotRotY,
    followY,
    followZ,
    followRotX,
    lookAtX,
    lookAtY,
    lookAtZ,
  } = useControls("Camera Step 1", {
    pivotX: { value: 0, min: -10, max: 10, step: 0.1 },
    pivotY: { value: 1, min: -10, max: 10, step: 0.1 },
    pivotZ: { value: 0, min: -10, max: 10, step: 0.1 },

    pivotRotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },

    followY: { value: 2, min: -10, max: 10, step: 0.1 },
    followZ: { value: -5, min: -20, max: 2, step: 0.1 },

    followRotX: { value: 0, min: -Math.PI / 2, max: Math.PI / 2, step: 0.01 },

    lookAtX: { value: 0, min: -10, max: 10, step: 0.1 },
    lookAtY: { value: 1, min: -10, max: 10, step: 0.1 },
    lookAtZ: { value: 0, min: -10, max: 10, step: 0.1 },
  });

  useEffect(() => {
    pivot.add(followCam);
    scene.add(pivot);

    return () => {
      pivot.remove(followCam);
      scene.remove(pivot);
    };
  }, [pivot, followCam, scene]);

  useFrame(() => {
    pivot.position.set(pivotX, pivotY, pivotZ);
    pivot.position.set(pivotX, pivotY, pivotZ);
    pivot.rotation.set(0, pivotRotY, 0);

    followCam.position.set(0, followY, followZ);
    followCam.rotation.set(followRotX, 0, 0);

    followCam.getWorldPosition(camera.position);
    camera.lookAt(lookAtX, lookAtY, lookAtZ);
  });

  return null;
};

export default CameraLessonSetup1;

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { Camera, Vector3 } from "three";

const defaultCameraRadius = 20;
const minCameraRadius = 2;
const maxCameraRadius = 40;

const minElevation = 0;
const maxElevation = 89;

const rotateSpeed = 0.5;
const zoomSpeed = 0.05;
const panSpeed = 0.002;

const updateCameraPosition = (
  camera: Camera,
  cameraAzimuth: number,
  cameraElevation: number,
  cameraRadius: number,
  cameraTarget: Vector3,
) => {
  const azimuthRad = (cameraAzimuth * Math.PI) / 180;
  const elevationRad = (cameraElevation * Math.PI) / 180;

  camera.position.x =
    cameraTarget.x +
    cameraRadius * Math.sin(azimuthRad) * Math.cos(elevationRad);

  camera.position.y = cameraTarget.y + cameraRadius * Math.sin(elevationRad);

  camera.position.z =
    cameraTarget.z +
    cameraRadius * Math.cos(azimuthRad) * Math.cos(elevationRad);

  camera.lookAt(cameraTarget);
  camera.updateMatrixWorld();
};

const CameraController = () => {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const cameraAzimuth = useRef(0);
  const cameraElevation = useRef(25);
  const cameraRadius = useRef(defaultCameraRadius);

  const cameraTarget = useRef(new Vector3(0, 0, 0));

  const isRotating = useRef(false);
  const isPanning = useRef(false);

  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);

  const updateCamera = useCallback(() => {
    updateCameraPosition(
      camera,
      cameraAzimuth.current,
      cameraElevation.current,
      cameraRadius.current,
      cameraTarget.current,
    );
  }, [camera]);

  const onMouseDown = useCallback((event: MouseEvent) => {
    prevMouseX.current = event.clientX;
    prevMouseY.current = event.clientY;

    // Left mouse button
    if (event.button === 0) {
      isRotating.current = true;
    }

    // Right mouse button
    if (event.button === 2) {
      isPanning.current = true;
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isRotating.current = false;
    isPanning.current = false;
  }, []);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const deltaX = event.clientX - prevMouseX.current;
      const deltaY = event.clientY - prevMouseY.current;

      if (isRotating.current) {
        cameraAzimuth.current += -deltaX * rotateSpeed;
        cameraElevation.current += deltaY * rotateSpeed;

        cameraElevation.current = Math.min(
          maxElevation,
          Math.max(minElevation, cameraElevation.current),
        );

        updateCamera();
      }

      if (isPanning.current) {
        const panDistance = cameraRadius.current * panSpeed;

        const cameraDirection = new Vector3();
        camera.getWorldDirection(cameraDirection);

        const cameraRight = new Vector3()
          .crossVectors(cameraDirection, camera.up)
          .normalize();

        const cameraUp = new Vector3()
          .crossVectors(cameraRight, cameraDirection)
          .normalize();

        cameraTarget.current.addScaledVector(
          cameraRight,
          -deltaX * panDistance,
        );
        cameraTarget.current.addScaledVector(cameraUp, deltaY * panDistance);

        updateCamera();
      }

      prevMouseX.current = event.clientX;
      prevMouseY.current = event.clientY;
    },
    [camera, updateCamera],
  );

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const zoomAmount = event.deltaY * zoomSpeed;

      cameraRadius.current += zoomAmount;

      cameraRadius.current = Math.min(
        maxCameraRadius,
        Math.max(minCameraRadius, cameraRadius.current),
      );

      updateCamera();
    },
    [updateCamera],
  );

  const onContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    updateCamera();
  }, [updateCamera]);

  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);

      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl, onMouseDown, onMouseUp, onMouseMove, onWheel, onContextMenu]);

  return null;
};

export default CameraController;

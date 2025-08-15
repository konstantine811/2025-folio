import { Euler, Object3D } from "three";

const normalizeAngle = (angle: number) => {
  while (angle > Math.PI) {
    angle -= Math.PI * 2;
  }
  while (angle < -Math.PI) {
    angle += Math.PI * 2;
  }
  return angle;
};

export const lerpAngle = (start: number, end: number, t: number) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);
  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += Math.PI * 2;
    } else {
      end += Math.PI * 2;
    }
  }
  return normalizeAngle(start + (end - start) * t);
};

export const getMovingDirection = (
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  cameraRotation: Euler
) => {
  if (!forward && !backward && !leftward && !rightward) return 0;
  if (forward && leftward) return cameraRotation.y - Math.PI / 4;
  if (forward && rightward) return cameraRotation.y + Math.PI / 4;
  if (backward && leftward) return cameraRotation.y + Math.PI / 4 + Math.PI;
  if (backward && rightward) return cameraRotation.y - Math.PI / 4 + Math.PI;
  if (backward) return cameraRotation.y;
  if (leftward) return cameraRotation.y - Math.PI / 2;
  if (rightward) return cameraRotation.y + Math.PI / 2;
  if (forward) return cameraRotation.y + Math.PI;
  return 0;
};

export const getPivotMovingDirection = (
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  pivot: Object3D
): number | null => {
  if (!forward && !backward && !leftward && !rightward) return null;
  if (forward && leftward) return pivot.rotation.y + Math.PI / 4;
  if (forward && rightward) return pivot.rotation.y - Math.PI / 4;
  if (backward && leftward) return pivot.rotation.y - Math.PI / 4 + Math.PI;
  if (backward && rightward) return pivot.rotation.y + Math.PI / 4 + Math.PI;
  if (backward) return pivot.rotation.y + Math.PI;
  if (leftward) return pivot.rotation.y + Math.PI / 2;
  if (rightward) return pivot.rotation.y - Math.PI / 2;
  if (forward) return pivot.rotation.y;

  return null;
};

import { MathUtils, Vector3 } from "three";

/** Orbit outside the player's body before approaching the screen from the front. */
export function sampleLaptopCameraPath(start: Vector3, end: Vector3, progress: number, result: Vector3) {
  const split = 0.72;
  const radius = Math.max(1.35, Math.hypot(end.x, end.z));
  if (progress <= split) {
    const t = MathUtils.smootherstep(progress / split, 0, 1);
    const angle = MathUtils.lerp(Math.atan2(start.x, start.z), 0, t);
    const distance = MathUtils.lerp(Math.hypot(start.x, start.z), radius, t);
    return result.set(Math.sin(angle) * distance, MathUtils.lerp(start.y, end.y + 0.12, t), Math.cos(angle) * distance);
  }
  const t = MathUtils.smootherstep((progress - split) / (1 - split), 0, 1);
  return result.set(MathUtils.lerp(0, end.x, t), MathUtils.lerp(end.y + 0.12, end.y, t), MathUtils.lerp(radius, end.z, t));
}

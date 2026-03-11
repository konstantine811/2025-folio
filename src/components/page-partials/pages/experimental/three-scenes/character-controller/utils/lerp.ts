export function lerpAngle(current: number, target: number, t: number) {
  let delta = target - current;

  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;

  return current + delta * t;
}

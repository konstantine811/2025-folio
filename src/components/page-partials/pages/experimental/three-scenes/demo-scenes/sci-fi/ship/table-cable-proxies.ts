import { useControls } from "leva";
import { Euler, Quaternion, Vector3 } from "three";
import type { ResolvedCableProxyBox } from "../character/sci-fi-cable-proxy-limbs";

export const TABLE_CABLE_PROXY_CONTROLS_PATH = "Sci-fi props / Table computer";

export type TableCableProxyTransform = {
  position: { x: number; y: number; z: number };
  rotationY: number;
  scale: number;
  cableProxyOnePosition: { x: number; y: number; z: number };
  cableProxyOneHalfExtents: { x: number; y: number; z: number };
  cableProxyTwoPosition: { x: number; y: number; z: number };
  cableProxyTwoHalfExtents: { x: number; y: number; z: number };
};

const tmpEuler = new Euler();
const tmpQuat = new Quaternion();
const tmpLocal = new Vector3();
const tmpCenter = new Vector3();

export function useSciFiTableCableProxyTransform(): TableCableProxyTransform {
  return useControls(TABLE_CABLE_PROXY_CONTROLS_PATH, {
    position: { value: { x: -2.35, y: 0.1, z: 9.18 }, step: 0.05 },
    rotationY: { value: 29, min: -180, max: 180, step: 1 },
    scale: { value: 0.93, min: 0.1, max: 3, step: 0.01 },
    cableProxyOnePosition: {
      value: { x: 0, y: 0.47, z: 0.02 },
      step: 0.01,
    },
    cableProxyOneHalfExtents: {
      value: { x: 1.26, y: 0.54, z: 0.33 },
      step: 0.01,
    },
    cableProxyTwoPosition: {
      value: { x: 0, y: 1.3, z: 0.08 },
      step: 0.01,
    },
    cableProxyTwoHalfExtents: {
      value: { x: 0.67, y: 0.32, z: 0.07 },
      step: 0.01,
    },
  });
}

export function resolveTableCableProxyBoxes(
  config: TableCableProxyTransform,
  out: ResolvedCableProxyBox[] = [],
): ResolvedCableProxyBox[] {
  const {
    position,
    rotationY,
    scale,
    cableProxyOnePosition,
    cableProxyOneHalfExtents,
    cableProxyTwoPosition,
    cableProxyTwoHalfExtents,
  } = config;

  tmpEuler.set(0, (rotationY * Math.PI) / 180, 0);
  tmpQuat.setFromEuler(tmpEuler);

  const proxies = [
    { position: cableProxyOnePosition, halfExtents: cableProxyOneHalfExtents },
    { position: cableProxyTwoPosition, halfExtents: cableProxyTwoHalfExtents },
  ] as const;

  out.length = 0;

  for (const proxy of proxies) {
    tmpLocal.set(
      proxy.position.x * scale,
      proxy.position.y * scale,
      proxy.position.z * scale,
    );
    tmpLocal.applyQuaternion(tmpQuat);

    tmpCenter.set(position.x, position.y, position.z).add(tmpLocal);

    const box =
      out[out.length] ??
      ({
        center: new Vector3(),
        halfExtents: new Vector3(),
        quaternion: new Quaternion(),
      } satisfies ResolvedCableProxyBox);

    box.center.copy(tmpCenter);
    box.halfExtents.set(
      proxy.halfExtents.x * scale,
      proxy.halfExtents.y * scale,
      proxy.halfExtents.z * scale,
    );
    box.quaternion.copy(tmpQuat);

    out.push(box);
  }

  return out;
}

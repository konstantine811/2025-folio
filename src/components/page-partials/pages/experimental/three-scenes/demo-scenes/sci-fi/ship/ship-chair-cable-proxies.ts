import { useControls } from "leva";
import { Matrix4, Quaternion, Vector3 } from "three";
import type { ResolvedCableProxyBox } from "../character/sci-fi-cable-proxy-limbs";

export const CHAIR_CONTROLS_PATH = "Sci-fi props / Chair";

export type ChairCableProxyPartConfig = {
  halfExtents: { x: number; y: number; z: number };
  localOffset: { x: number; y: number; z: number };
};

const tmpPosition = new Vector3();
const tmpQuaternion = new Quaternion();
const tmpScale = new Vector3();
const tmpCenter = new Vector3();

export type SciFiChairControls = ReturnType<typeof useSciFiChairControls>;

/** Always mounted from ship-container so the enable toggle stays in Leva when off. */
export function useSciFiChairControls() {
  return useControls(CHAIR_CONTROLS_PATH, {
    chairEnabled: {
      value: true,
      label: "Enable chair",
    },
    baseHalfExtents: {
      value: { x: 0.29, y: 0.24, z: 0.26 },
      step: 0.01,
      label: "Base half extents",
    },
    baseLocalOffset: {
      value: { x: 0, y: 0, z: 0 },
      step: 0.01,
      label: "Base local offset",
    },
    backHalfExtents: {
      value: { x: 0.26, y: 0.18, z: 0.04 },
      step: 0.01,
      label: "Back half extents",
    },
    backLocalOffset: {
      value: { x: 0, y: 0.4, z: 0.21 },
      step: 0.01,
      label: "Back local offset",
    },
    showWireframe: {
      value: false,
      label: "Show proxy wireframe",
    },
  });
}

function ensureProxyBox(out: ResolvedCableProxyBox[], index: number) {
  let box = out[index];
  if (!box) {
    box = {
      center: new Vector3(),
      halfExtents: new Vector3(),
      quaternion: new Quaternion(),
    };
    out[index] = box;
  }
  return box;
}

function pushChairProxyBox(
  colliderWorldMatrix: Matrix4,
  part: ChairCableProxyPartConfig,
  out: ResolvedCableProxyBox[],
) {
  colliderWorldMatrix.decompose(tmpPosition, tmpQuaternion, tmpScale);

  tmpCenter.set(part.localOffset.x, part.localOffset.y, part.localOffset.z);
  tmpCenter.applyQuaternion(tmpQuaternion);
  tmpCenter.add(tmpPosition);

  const index = out.length;
  const box = ensureProxyBox(out, index);
  box.center.copy(tmpCenter);
  box.halfExtents.set(
    part.halfExtents.x,
    part.halfExtents.y,
    part.halfExtents.z,
  );
  box.quaternion.copy(tmpQuaternion);
  out.length = index + 1;
}

/** Proxies in chair collider local space (offsets rotated by collider world orientation). */
export function resolveChairCableProxyBoxes(
  colliderWorldMatrix: Matrix4,
  parts: readonly ChairCableProxyPartConfig[],
  out: ResolvedCableProxyBox[] = [],
): ResolvedCableProxyBox[] {
  out.length = 0;
  for (const part of parts) {
    pushChairProxyBox(colliderWorldMatrix, part, out);
  }
  return out;
}

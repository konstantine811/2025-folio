import { Euler, Object3D, Quaternion, Vector3 } from "three";

type Vec3 = [number, number, number];

export const CABLE_PROXY_POINT_RADIUS = 0.01;

/** Bone-local proxy offsets were tuned for the old 0.011 armature export. */
export const SCI_FI_CABLE_PROXY_BONE_UNIT = 0.011;

export function toBoneLocalOffset(position?: Vec3) {
  const offset = new Vector3(...(position ?? [0, 0, 0]));
  return offset.multiplyScalar(SCI_FI_CABLE_PROXY_BONE_UNIT);
}

type SciFiCableProxyBase = {
  id: string;
  boneName: string;
  localPosition?: Vec3;
  /** Euler rotation in radians [x, y, z], applied in bone-local space. */
  localRotation?: Vec3;
};

export type SciFiCableProxyCapsuleConfig = SciFiCableProxyBase & {
  shape?: "capsule";
  halfHeight: number;
  radius: number;
};

export type SciFiCableProxyBoxConfig = SciFiCableProxyBase & {
  shape: "box";
  halfExtents: Vec3;
};

export type SciFiCableProxyLimbConfig =
  | SciFiCableProxyCapsuleConfig
  | SciFiCableProxyBoxConfig;

export function isCableProxyBoxConfig(
  config: SciFiCableProxyLimbConfig,
): config is SciFiCableProxyBoxConfig {
  return config.shape === "box";
}

export type ResolvedCableProxyCapsule = {
  center: Vector3;
  halfHeight: number;
  radius: number;
  quaternion: Quaternion;
};

export type ResolvedCableProxyBox = {
  center: Vector3;
  halfExtents: Vector3;
  quaternion: Quaternion;
};

export const sciFiCableProxyLimbs: SciFiCableProxyLimbConfig[] = [
  {
    id: "head",
    boneName: "mixamorigHead",
    halfHeight: 0.06,
    radius: 0.14,
    localPosition: [0, 10, 1],
  },
  {
    id: "torso",
    boneName: "mixamorigSpine2",
    halfHeight: 0.24,
    radius: 0.21,
    localPosition: [0, -16, 0],
  },
  {
    id: "left-upper-arm",
    boneName: "mixamorigLeftArm",
    halfHeight: 0.13,
    radius: 0.09,
    localPosition: [0, 12, 0],
  },
  {
    id: "left-forearm",
    boneName: "mixamorigLeftForeArm",
    halfHeight: 0.2,
    radius: 0.05,
    localPosition: [0, 16, 0],
  },
  {
    id: "right-upper-arm",
    boneName: "mixamorigRightArm",
    halfHeight: 0.13,
    radius: 0.09,
    localPosition: [0, 12, 0],
  },
  {
    id: "right-forearm",
    boneName: "mixamorigRightForeArm",
    halfHeight: 0.2,
    radius: 0.05,
    localPosition: [0, 16, 0],
  },
  {
    id: "left-thigh",
    boneName: "mixamorigLeftUpLeg",
    halfHeight: 0.24,
    radius: 0.093,
    localPosition: [0, 25, 0],
  },
  {
    id: "left-shin",
    boneName: "mixamorigLeftLeg",
    halfHeight: 0.2,
    radius: 0.08,
    localPosition: [0, 27, 0],
  },
  {
    id: "right-thigh",
    boneName: "mixamorigRightUpLeg",
    halfHeight: 0.24,
    radius: 0.093,
    localPosition: [0, 25, 0],
  },
  {
    id: "right-shin",
    boneName: "mixamorigRightLeg",
    halfHeight: 0.2,
    radius: 0.08,
    localPosition: [0, 27, 0],
  },
  {
    id: "left-foot",
    shape: "box",
    boneName: "mixamorigLeftFoot",
    halfExtents: [0.06, 0.16, 0.04],
    localPosition: [-1.5, 11, -1],
    localRotation: [0.5, 0, 0.3],
  },
  {
    id: "right-foot",
    shape: "box",
    boneName: "mixamorigRightFoot",
    halfExtents: [0.06, 0.16, 0.04],
    localPosition: [1.5, 11, -1],
    localRotation: [0.5, 0, -0.3],
  },
];

const tmpCenter = new Vector3();
const tmpAxis = new Vector3(0, 1, 0);
const tmpSegment = new Vector3();
const tmpClosest = new Vector3();
const tmpPush = new Vector3();
const tmpRotationOffset = new Quaternion();

function findBone(root: Object3D, boneName: string): Object3D | null {
  let found: Object3D | null = null;

  root.traverse((child) => {
    if (child.name === boneName) {
      found = child;
    }
  });

  return found;
}

export function resolveCableProxyCapsules(
  skeletonRoot: Object3D,
  limbs: SciFiCableProxyLimbConfig[] = sciFiCableProxyLimbs,
  out: ResolvedCableProxyCapsule[] = [],
): ResolvedCableProxyCapsule[] {
  out.length = 0;

  for (const config of limbs) {
    if (isCableProxyBoxConfig(config)) continue;

    const bone = findBone(skeletonRoot, config.boneName);
    if (!bone) continue;

    bone.updateWorldMatrix(true, false);

    tmpCenter.copy(toBoneLocalOffset(config.localPosition));
    bone.localToWorld(tmpCenter);
    bone.getWorldQuaternion(tmpRotationOffset);

    if (config.localRotation) {
      tmpRotationOffset.multiply(
        new Quaternion().setFromEuler(new Euler(...config.localRotation)),
      );
    }

    out.push({
      center: tmpCenter.clone(),
      halfHeight: config.halfHeight,
      radius: config.radius,
      quaternion: tmpRotationOffset.clone(),
    });
  }

  return out;
}

export function resolveCableProxyBoxes(
  skeletonRoot: Object3D,
  limbs: SciFiCableProxyLimbConfig[] = sciFiCableProxyLimbs,
  out: ResolvedCableProxyBox[] = [],
): ResolvedCableProxyBox[] {
  out.length = 0;

  for (const config of limbs) {
    if (!isCableProxyBoxConfig(config)) continue;

    const bone = findBone(skeletonRoot, config.boneName);
    if (!bone) continue;

    bone.updateWorldMatrix(true, false);

    tmpCenter.copy(toBoneLocalOffset(config.localPosition));
    bone.localToWorld(tmpCenter);
    bone.getWorldQuaternion(tmpRotationOffset);

    if (config.localRotation) {
      tmpRotationOffset.multiply(
        new Quaternion().setFromEuler(new Euler(...config.localRotation)),
      );
    }

    out.push({
      center: tmpCenter.clone(),
      halfExtents: new Vector3(...config.halfExtents),
      quaternion: tmpRotationOffset.clone(),
    });
  }

  return out;
}

const tmpCapsuleA = new Vector3();
const tmpCapsuleB = new Vector3();

export function pushPointOutOfCapsule(
  point: Vector3,
  capsule: ResolvedCableProxyCapsule,
  pointRadius = CABLE_PROXY_POINT_RADIUS,
) {
  tmpAxis.set(0, 1, 0).applyQuaternion(capsule.quaternion);
  tmpCapsuleA
    .copy(capsule.center)
    .addScaledVector(tmpAxis, -capsule.halfHeight);
  tmpCapsuleB.copy(capsule.center).addScaledVector(tmpAxis, capsule.halfHeight);

  tmpSegment.subVectors(tmpCapsuleB, tmpCapsuleA);
  const abLenSq = tmpSegment.lengthSq();

  if (abLenSq === 0) {
    tmpClosest.copy(capsule.center);
  } else {
    const t = Math.max(
      0,
      Math.min(
        1,
        tmpPush.copy(point).sub(tmpCapsuleA).dot(tmpSegment) / abLenSq,
      ),
    );
    tmpClosest.copy(tmpCapsuleA).addScaledVector(tmpSegment, t);
  }

  tmpPush.subVectors(point, tmpClosest);
  const distance = tmpPush.length();
  const minDistance = capsule.radius + pointRadius;

  if (distance > 0 && distance < minDistance) {
    tmpPush.multiplyScalar(minDistance / distance);
    point.copy(tmpClosest).add(tmpPush);
  } else if (distance === 0) {
    point.copy(tmpClosest).addScaledVector(tmpAxis, minDistance);
  }
}

const tmpBoxLocal = new Vector3();
const tmpBoxPrevLocal = new Vector3();
const tmpBoxClosestLocal = new Vector3();
const tmpBoxDelta = new Vector3();
const tmpBoxNormalLocal = new Vector3();
const tmpBoxNormalWorld = new Vector3();
const tmpBoxInvQuat = new Quaternion();

const isInsideExpandedBox = (
  point: Vector3,
  halfExtentsX: number,
  halfExtentsY: number,
  halfExtentsZ: number,
) =>
  Math.abs(point.x) < halfExtentsX &&
  Math.abs(point.y) < halfExtentsY &&
  Math.abs(point.z) < halfExtentsZ;

const clipSegmentToExpandedBoxEntry = (
  start: Vector3,
  end: Vector3,
  halfExtentsX: number,
  halfExtentsY: number,
  halfExtentsZ: number,
) => {
  let tMin = 0;
  let tMax = 1;

  const clipAxis = (
    origin: number,
    delta: number,
    minBound: number,
    maxBound: number,
  ) => {
    if (Math.abs(delta) < 1e-8) {
      return origin >= minBound && origin <= maxBound;
    }

    const inverseDelta = 1 / delta;
    let t0 = (minBound - origin) * inverseDelta;
    let t1 = (maxBound - origin) * inverseDelta;

    if (t0 > t1) {
      const swap = t0;
      t0 = t1;
      t1 = swap;
    }

    tMin = Math.max(tMin, t0);
    tMax = Math.min(tMax, t1);
    return tMin <= tMax;
  };

  if (
    !clipAxis(start.x, end.x - start.x, -halfExtentsX, halfExtentsX) ||
    !clipAxis(start.y, end.y - start.y, -halfExtentsY, halfExtentsY) ||
    !clipAxis(start.z, end.z - start.z, -halfExtentsZ, halfExtentsZ)
  ) {
    return null;
  }

  if (tMin > tMax || tMax < 0 || tMin > 1) {
    return null;
  }

  return Math.max(0, Math.min(1, tMin));
};

const resolveBoxContactNormalWorld = (
  worldPoint: Vector3,
  box: ResolvedCableProxyBox,
  out: Vector3,
) => {
  tmpBoxInvQuat.copy(box.quaternion).invert();
  tmpBoxLocal.copy(worldPoint).sub(box.center).applyQuaternion(tmpBoxInvQuat);

  const hx = box.halfExtents.x;
  const hy = box.halfExtents.y;
  const hz = box.halfExtents.z;

  tmpBoxClosestLocal.set(
    Math.max(-hx, Math.min(hx, tmpBoxLocal.x)),
    Math.max(-hy, Math.min(hy, tmpBoxLocal.y)),
    Math.max(-hz, Math.min(hz, tmpBoxLocal.z)),
  );

  tmpBoxNormalLocal.subVectors(tmpBoxLocal, tmpBoxClosestLocal);

  if (tmpBoxNormalLocal.lengthSq() < 1e-10) {
    const penX = hx - Math.abs(tmpBoxLocal.x);
    const penY = hy - Math.abs(tmpBoxLocal.y);
    const penZ = hz - Math.abs(tmpBoxLocal.z);

    if (penX <= penY && penX <= penZ) {
      tmpBoxNormalLocal.set(Math.sign(tmpBoxLocal.x || 1), 0, 0);
    } else if (penY <= penZ) {
      tmpBoxNormalLocal.set(0, Math.sign(tmpBoxLocal.y || 1), 0);
    } else {
      tmpBoxNormalLocal.set(0, 0, Math.sign(tmpBoxLocal.z || 1));
    }
  } else {
    tmpBoxNormalLocal.normalize();
  }

  out.copy(tmpBoxNormalLocal).applyQuaternion(box.quaternion).normalize();
};

const dampPointVelocityAgainstBox = (
  current: Vector3,
  previous: Vector3,
  box: ResolvedCableProxyBox,
  friction = 0.62,
) => {
  resolveBoxContactNormalWorld(current, box, tmpBoxNormalWorld);

  tmpBoxDelta.subVectors(current, previous);
  const normalSpeed = tmpBoxDelta.dot(tmpBoxNormalWorld);

  if (normalSpeed < 0) {
    previous.copy(current).addScaledVector(tmpBoxNormalWorld, -normalSpeed);
  }

  tmpBoxDelta.subVectors(current, previous);
  tmpBoxDelta.multiplyScalar(friction);
  previous.copy(current).sub(tmpBoxDelta);
};

const sweepPointOutOfBox = (
  current: Vector3,
  previous: Vector3,
  box: ResolvedCableProxyBox,
  pointRadius: number,
) => {
  tmpBoxInvQuat.copy(box.quaternion).invert();

  tmpBoxLocal.copy(current).sub(box.center).applyQuaternion(tmpBoxInvQuat);
  tmpBoxPrevLocal.copy(previous).sub(box.center).applyQuaternion(tmpBoxInvQuat);

  const expandedX = box.halfExtents.x + pointRadius;
  const expandedY = box.halfExtents.y + pointRadius;
  const expandedZ = box.halfExtents.z + pointRadius;

  const currentInside = isInsideExpandedBox(
    tmpBoxLocal,
    expandedX,
    expandedY,
    expandedZ,
  );

  if (!currentInside) {
    return false;
  }

  const previousInside = isInsideExpandedBox(
    tmpBoxPrevLocal,
    expandedX,
    expandedY,
    expandedZ,
  );

  if (!previousInside) {
    const entryT = clipSegmentToExpandedBoxEntry(
      tmpBoxPrevLocal,
      tmpBoxLocal,
      expandedX,
      expandedY,
      expandedZ,
    );

    if (entryT !== null) {
      tmpBoxLocal.lerpVectors(tmpBoxPrevLocal, tmpBoxLocal, entryT);
      tmpBoxLocal.applyQuaternion(box.quaternion);
      current.copy(box.center).add(tmpBoxLocal);
    }
  }

  return true;
};

export function pushPointOutOfBox(
  point: Vector3,
  box: ResolvedCableProxyBox,
  pointRadius = CABLE_PROXY_POINT_RADIUS,
) {
  tmpBoxInvQuat.copy(box.quaternion).invert();

  tmpBoxLocal.copy(point).sub(box.center).applyQuaternion(tmpBoxInvQuat);

  const hx = box.halfExtents.x;
  const hy = box.halfExtents.y;
  const hz = box.halfExtents.z;

  tmpBoxClosestLocal.set(
    Math.max(-hx, Math.min(hx, tmpBoxLocal.x)),
    Math.max(-hy, Math.min(hy, tmpBoxLocal.y)),
    Math.max(-hz, Math.min(hz, tmpBoxLocal.z)),
  );

  const insideX = Math.abs(tmpBoxLocal.x) < hx;
  const insideY = Math.abs(tmpBoxLocal.y) < hy;
  const insideZ = Math.abs(tmpBoxLocal.z) < hz;

  if (insideX && insideY && insideZ) {
    const penX = hx - Math.abs(tmpBoxLocal.x);
    const penY = hy - Math.abs(tmpBoxLocal.y);
    const penZ = hz - Math.abs(tmpBoxLocal.z);

    if (penX <= penY && penX <= penZ) {
      tmpBoxLocal.x = Math.sign(tmpBoxLocal.x || 1) * (hx + pointRadius);
    } else if (penY <= penZ) {
      tmpBoxLocal.y = Math.sign(tmpBoxLocal.y || 1) * (hy + pointRadius);
    } else {
      tmpBoxLocal.z = Math.sign(tmpBoxLocal.z || 1) * (hz + pointRadius);
    }

    tmpBoxDelta.copy(tmpBoxLocal).applyQuaternion(box.quaternion);
    point.copy(box.center).add(tmpBoxDelta);
    return;
  }

  tmpBoxDelta.subVectors(tmpBoxLocal, tmpBoxClosestLocal);
  const distance = tmpBoxDelta.length();

  if (distance > 0 && distance < pointRadius) {
    tmpBoxDelta.multiplyScalar(pointRadius / distance);
    tmpBoxClosestLocal.add(tmpBoxDelta);
  } else if (distance === 0) {
    tmpBoxClosestLocal.y = hy + pointRadius;
  } else {
    return;
  }

  tmpBoxClosestLocal.applyQuaternion(box.quaternion);
  point.copy(box.center).add(tmpBoxClosestLocal);
}

/** Swept + positional box resolve; damps Verlet velocity into the surface. */
export function pushPointOutOfBoxWithMotion(
  current: Vector3,
  previous: Vector3,
  box: ResolvedCableProxyBox,
  pointRadius = CABLE_PROXY_POINT_RADIUS,
) {
  const beforeX = current.x;
  const beforeY = current.y;
  const beforeZ = current.z;

  sweepPointOutOfBox(current, previous, box, pointRadius);
  pushPointOutOfBox(current, box, pointRadius);

  if (
    current.x !== beforeX ||
    current.y !== beforeY ||
    current.z !== beforeZ
  ) {
    dampPointVelocityAgainstBox(current, previous, box);
  }
}

/** Reduces segment tunneling by resolving the segment midpoint against boxes. */
export function pushSegmentOutOfBoxes(
  pointA: Vector3,
  pointB: Vector3,
  boxes: readonly ResolvedCableProxyBox[],
  pointRadius = CABLE_PROXY_POINT_RADIUS,
) {
  if (boxes.length === 0) return;

  tmpClosest.lerpVectors(pointA, pointB, 0.5);
  const beforeX = tmpClosest.x;
  const beforeY = tmpClosest.y;
  const beforeZ = tmpClosest.z;

  for (const box of boxes) {
    pushPointOutOfBox(tmpClosest, box, pointRadius);
  }

  if (
    tmpClosest.x === beforeX &&
    tmpClosest.y === beforeY &&
    tmpClosest.z === beforeZ
  ) {
    return;
  }

  tmpBoxDelta.set(
    tmpClosest.x - beforeX,
    tmpClosest.y - beforeY,
    tmpClosest.z - beforeZ,
  ).multiplyScalar(0.5);

  pointA.add(tmpBoxDelta);
  pointB.add(tmpBoxDelta);
}

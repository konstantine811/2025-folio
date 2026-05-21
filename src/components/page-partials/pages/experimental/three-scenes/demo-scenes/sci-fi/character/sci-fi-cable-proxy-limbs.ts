import { Euler, Object3D, Quaternion, Vector3 } from "three";

type Vec3 = [number, number, number];

export const CABLE_PROXY_POINT_RADIUS = 0.01;

export type SciFiCableProxyLimbConfig = {
  id: string;
  boneName: string;
  halfHeight: number;
  radius: number;
  localPosition?: Vec3;
  localRotation?: Vec3;
};

export type ResolvedCableProxyCapsule = {
  center: Vector3;
  halfHeight: number;
  radius: number;
  quaternion: Quaternion;
};

export const sciFiCableProxyLimbs: SciFiCableProxyLimbConfig[] = [
  {
    id: "head",
    boneName: "mixamorigHead",
    halfHeight: 0.08,
    radius: 0.14,
    localPosition: [0, 10, 1],
  },
  {
    id: "torso",
    boneName: "mixamorigSpine2",
    halfHeight: 0.14,
    radius: 0.25,
    localPosition: [0, -10, 0],
  },
  {
    id: "left-upper-arm",
    boneName: "mixamorigLeftArm",
    halfHeight: 0.11,
    radius: 0.065,
    localPosition: [0, 12, 0],
  },
  {
    id: "left-forearm",
    boneName: "mixamorigLeftForeArm",
    halfHeight: 0.1,
    radius: 0.035,
    localPosition: [0, 11, 0],
  },
  {
    id: "right-upper-arm",
    boneName: "mixamorigRightArm",
    halfHeight: 0.11,
    radius: 0.065,
    localPosition: [0, 12, 0],
  },
  {
    id: "right-forearm",
    boneName: "mixamorigRightForeArm",
    halfHeight: 0.1,
    radius: 0.035,
    localPosition: [0, 11, 0],
  },
  {
    id: "left-thigh",
    boneName: "mixamorigLeftUpLeg",
    halfHeight: 0.16,
    radius: 0.085,
    localPosition: [0, 22, 0],
  },
  {
    id: "left-shin",
    boneName: "mixamorigLeftLeg",
    halfHeight: 0.14,
    radius: 0.08,
    localPosition: [0, 25, 0],
  },
  {
    id: "right-thigh",
    boneName: "mixamorigRightUpLeg",
    halfHeight: 0.36,
    radius: 0.085,
    localPosition: [0, 22, 0],
  },
  {
    id: "right-shin",
    boneName: "mixamorigRightLeg",
    halfHeight: 0.14,
    radius: 0.08,
    localPosition: [0, 25, 0],
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
    const bone = findBone(skeletonRoot, config.boneName);
    if (!bone) continue;

    bone.updateWorldMatrix(true, false);

    tmpCenter.set(...(config.localPosition ?? [0, 0, 0]));
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

const tmpCapsuleA = new Vector3();
const tmpCapsuleB = new Vector3();

export function pushPointOutOfCapsule(
  point: Vector3,
  capsule: ResolvedCableProxyCapsule,
  pointRadius = CABLE_PROXY_POINT_RADIUS,
) {
  tmpAxis.set(0, 1, 0).applyQuaternion(capsule.quaternion);
  tmpCapsuleA.copy(capsule.center).addScaledVector(tmpAxis, -capsule.halfHeight);
  tmpCapsuleB.copy(capsule.center).addScaledVector(tmpAxis, capsule.halfHeight);

  tmpSegment.subVectors(tmpCapsuleB, tmpCapsuleA);
  const abLenSq = tmpSegment.lengthSq();

  if (abLenSq === 0) {
    tmpClosest.copy(capsule.center);
  } else {
    const t = Math.max(
      0,
      Math.min(1, tmpPush.copy(point).sub(tmpCapsuleA).dot(tmpSegment) / abLenSq),
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

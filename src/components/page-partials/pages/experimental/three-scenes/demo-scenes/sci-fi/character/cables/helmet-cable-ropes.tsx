import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import {
  cableNeonOrbDefaults,
  cableNeonOrbInstanceCount,
  cableNeonOrbMaxPerCable,
  getCableNeonOrbSizeFactor,
} from "./cable-neon-orbs.config";
import {
  pushPointOutOfBox,
  pushPointOutOfCapsule,
  resolveCableProxyBoxes,
  resolveCableProxyCapsules,
  ResolvedCableProxyBox,
  ResolvedCableProxyCapsule,
} from "../sci-fi-cable-proxy-limbs";

type HelmetCableRopesProps = {
  head: Object3D;
  skeletonRoot?: Object3D;
  bodyProxyCollisionsEnabled?: boolean;
  helmetPosition: [number, number, number];
  helmetRotation: [number, number, number];
  helmetScale: number;
};

type RopePoint = {
  current: Vector3;
  previous: Vector3;
};

type RopeState = {
  initialized: boolean;
  points: RopePoint[];
  previousAnchor: Vector3;
};

type FloorScatterConfig = {
  sideSlope: number;
  backSlope: number;
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
};

const cableRadius = 0.015;
const floorY = 0.057;
const gravity = new Vector3(0, -9.8, 0);
const segmentCount = 94;
const segmentLength = 0.13;
const constraintIterations = 5;
const damping = 0.91;
const floorFriction = 0.98;
const floorContactEpsilon = 0.03;
const pinnedArcPhysicsPointCount = 10;
const pinnedArcRenderPointCount = 30;
const pinnedArcStartOffset: [number, number, number] = [0, 0, 0];
const pinnedArcBackDistance = -0.112;
const pinnedArcLift = 0.015;
const pinnedArcEndDrop = 0.05;
const pinnedArcRoundness = 1.2;
const helmetColliderRadius = 0.16;
const helmetCollisionPlaneRadius = 0.12;
const initialFloorBackSlope = 0.18;
const initialFloorDirection = 1;
const helmetCenteredOrigin: [number, number, number] = [0, -2.067, -6.745];
const helmetCollisionPlanePosition: [number, number, number] = [
  -0.019, 1.58, 6.563,
];
const helmetCollisionPlaneRotation: [number, number, number] = [
  1.575, -0.025, -3.124,
];

const connectorLocalPositions: [number, number, number][] = [
  [-0.107, 2.159, 6.636],
  [-0.101, 2.145, 6.595],
  [-0.055, 2.163, 6.587],
  [-0.001, 2.165, 6.582],
  [0.059, 2.164, 6.589],
  [0.09, 2.169, 6.605],
  [0.107, 2.163, 6.684],
  [-0.116, 2.138, 6.712],
];

const floorScatterConfigs: FloorScatterConfig[] = [
  {
    sideSlope: -0.52,
    backSlope: 0.72,
    waveAmplitude: 0.18,
    waveFrequency: 1.4,
    wavePhase: 0.2,
  },
  {
    sideSlope: -0.34,
    backSlope: 0.94,
    waveAmplitude: 0.22,
    waveFrequency: 1.8,
    wavePhase: 1.1,
  },
  {
    sideSlope: -0.16,
    backSlope: 0.58,
    waveAmplitude: 0.14,
    waveFrequency: 2.2,
    wavePhase: 2.4,
  },
  {
    sideSlope: 0.06,
    backSlope: 1.08,
    waveAmplitude: 0.2,
    waveFrequency: 1.6,
    wavePhase: 3.2,
  },
  {
    sideSlope: 0.22,
    backSlope: 0.66,
    waveAmplitude: 0.16,
    waveFrequency: 2,
    wavePhase: 4.1,
  },
  {
    sideSlope: 0.42,
    backSlope: 0.9,
    waveAmplitude: 0.24,
    waveFrequency: 1.5,
    wavePhase: 5,
  },
  {
    sideSlope: 0.58,
    backSlope: 0.5,
    waveAmplitude: 0.2,
    waveFrequency: 1.9,
    wavePhase: 5.8,
  },
  {
    sideSlope: -0.7,
    backSlope: 0.44,
    waveAmplitude: 0.26,
    waveFrequency: 1.7,
    wavePhase: 2.9,
  },
];

const tmpHeadCenter = new Vector3();
const tmpAnchor = new Vector3();
const tmpAnchorDelta = new Vector3();
const tmpFollowDelta = new Vector3();
const tmpDelta = new Vector3();
const tmpDirection = new Vector3();
const tmpPlanePoint = new Vector3();
const tmpPlaneNormal = new Vector3();
const tmpArcPoint = new Vector3();
const tmpQuat = new Quaternion();
const tmpPlaneQuat = new Quaternion();
const tmpScale = new Vector3();
const tmpOrbPosition = new Vector3();
const tmpOrbMatrix = new Matrix4();
const tmpOrbQuaternion = new Quaternion();

const smoothStep = (value: number) => value * value * (3 - 2 * value);

const getOrbVisibility = (
  curveT: number,
  spawnFade: number,
  absorbFade: number,
) => {
  const spawn = smoothStep(Math.min((1 - curveT) / spawnFade, 1));
  const absorb = smoothStep(Math.min(curveT / absorbFade, 1));
  return spawn * absorb;
};

const getFloorScatterOffset = (ropeIndex: number, floorDistance: number) => {
  const config = floorScatterConfigs[ropeIndex % floorScatterConfigs.length];
  const wave =
    Math.sin(floorDistance * config.waveFrequency + config.wavePhase) *
    config.waveAmplitude;

  return {
    x: floorDistance * config.sideSlope + wave,
    z: floorDistance * config.backSlope,
  };
};

const getPinnedArcLocalPoint = (t: number, ropeIndex: number) => {
  const easedT = smoothStep(t);
  const roundT = Math.sin(t * Math.PI) * pinnedArcRoundness;
  const ropeSpread =
    (ropeIndex - (connectorLocalPositions.length - 1) / 2) * 0.012;

  return tmpArcPoint.set(
    pinnedArcStartOffset[0] + ropeSpread * roundT,
    pinnedArcStartOffset[1] +
      roundT * pinnedArcLift -
      easedT * pinnedArcEndDrop,
    pinnedArcStartOffset[2] + easedT * pinnedArcBackDistance,
  );
};

const pinArcPoints = (
  points: RopePoint[],
  anchorWorldMatrix: Matrix4,
  ropeIndex: number,
) => {
  for (let index = 0; index < pinnedArcPhysicsPointCount; index += 1) {
    const t = index / (pinnedArcPhysicsPointCount - 1);
    const point = points[index];
    const arcPoint = getPinnedArcLocalPoint(t, ropeIndex).applyMatrix4(
      anchorWorldMatrix,
    );

    point.current.copy(arcPoint);
    point.previous.copy(arcPoint);
  }
};

const resetDynamicTail = (points: RopePoint[], ropeIndex: number) => {
  const tailAnchor = points[pinnedArcPhysicsPointCount - 1].current;
  const spread = (ropeIndex - (connectorLocalPositions.length - 1) / 2) * 0.035;
  const floorPointY = floorY + cableRadius;
  const dropDistance = Math.max(tailAnchor.y - floorPointY, 0);

  for (
    let index = pinnedArcPhysicsPointCount;
    index < points.length;
    index += 1
  ) {
    const distanceAlongCable =
      segmentLength * (index - pinnedArcPhysicsPointCount + 1);
    const isOnFloor = distanceAlongCable > dropDistance;
    const floorDistance = Math.max(distanceAlongCable - dropDistance, 0);
    const floorScatter = getFloorScatterOffset(ropeIndex, floorDistance);
    const point = tmpDirection.set(
      tailAnchor.x + spread + floorScatter.x,
      isOnFloor ? floorPointY : tailAnchor.y - distanceAlongCable,
      tailAnchor.z +
        Math.min(distanceAlongCable, dropDistance) *
          initialFloorBackSlope *
          initialFloorDirection +
        floorScatter.z,
    );

    points[index].current.copy(point);
    points[index].previous.copy(point);
  }
};

const createPinnedArcRenderPoints = (
  anchorWorldMatrix: Matrix4,
  ropeIndex: number,
) =>
  Array.from({ length: pinnedArcRenderPointCount }, (_, index) => {
    const t = index / (pinnedArcRenderPointCount - 1);

    return getPinnedArcLocalPoint(t, ropeIndex)
      .applyMatrix4(anchorWorldMatrix)
      .clone();
  });

type HelmetTransform = {
  position: Vector3;
  quaternion: Quaternion;
  scale: number;
  centeredOrigin: Vector3;
  connectorLocals: Vector3[];
  collisionPlaneLocal: Vector3;
  collisionPlaneRotation: Euler;
};

const syncConnectorTransform = (
  head: Object3D,
  connectorLocal: Vector3,
  helmet: HelmetTransform,
  outPosition: Vector3,
  outMatrix: Matrix4,
) => {
  head.updateWorldMatrix(true, false);

  outPosition
    .copy(helmet.centeredOrigin)
    .add(connectorLocal)
    .multiplyScalar(helmet.scale)
    .applyQuaternion(helmet.quaternion)
    .add(helmet.position);
  head.localToWorld(outPosition);

  head.getWorldQuaternion(tmpQuat);
  tmpQuat.multiply(helmet.quaternion);
  outMatrix.compose(outPosition, tmpQuat, tmpScale.set(1, 1, 1));
};

const syncCollisionPlane = (
  head: Object3D,
  helmet: HelmetTransform,
  outPoint: Vector3,
  outNormal: Vector3,
) => {
  head.updateWorldMatrix(true, false);

  outPoint
    .copy(helmet.centeredOrigin)
    .add(helmet.collisionPlaneLocal)
    .multiplyScalar(helmet.scale)
    .applyQuaternion(helmet.quaternion)
    .add(helmet.position);
  head.localToWorld(outPoint);

  head.getWorldQuaternion(tmpQuat);
  tmpQuat.multiply(helmet.quaternion);
  tmpPlaneQuat.setFromEuler(helmet.collisionPlaneRotation);
  tmpQuat.multiply(tmpPlaneQuat);
  outNormal.set(0, 0, 1).applyQuaternion(tmpQuat);
};

const createInitialPoints = (anchor: Vector3, index: number) => {
  const spread = (index - (connectorLocalPositions.length - 1) / 2) * 0.035;
  const floorPointY = floorY + cableRadius;
  const dropDistance = Math.max(anchor.y - floorPointY, 0);

  return Array.from({ length: segmentCount }, (_, pointIndex) => {
    const distanceAlongCable = segmentLength * pointIndex;
    const isOnFloor = distanceAlongCable > dropDistance;
    const floorDistance = Math.max(distanceAlongCable - dropDistance, 0);
    const floorScatter = getFloorScatterOffset(index, floorDistance);
    const point = new Vector3(
      anchor.x + spread + floorScatter.x,
      isOnFloor ? floorPointY : anchor.y - distanceAlongCable,
      anchor.z +
        Math.min(distanceAlongCable, dropDistance) *
          initialFloorBackSlope *
          initialFloorDirection +
        floorScatter.z,
    );

    return {
      current: point.clone(),
      previous: point.clone(),
    };
  });
};

const satisfyDistance = (
  a: RopePoint,
  b: RopePoint,
  targetDistance: number,
) => {
  tmpDelta.subVectors(b.current, a.current);
  const distance = tmpDelta.length();

  if (distance === 0) {
    return;
  }

  const correction = (distance - targetDistance) / distance;
  tmpDelta.multiplyScalar(correction * 0.5);
  a.current.add(tmpDelta);
  b.current.sub(tmpDelta);
};

export function HelmetCableRopes({
  head,
  skeletonRoot,
  bodyProxyCollisionsEnabled = false,
  helmetPosition,
  helmetRotation,
  helmetScale,
}: HelmetCableRopesProps) {
  const { scene, clock } = useThree();
  const meshRefs = useRef<(Mesh | null)[]>([]);
  const orbMeshRef = useRef<InstancedMesh>(null);
  const neonMaterialColor = useRef(new Color(cableNeonOrbDefaults.color));

  const {
    neonOrbsEnabled,
    neonOrbsPerCable,
    neonOrbSpeed,
    neonOrbRadius,
    neonOrbColor,
    neonOrbEmissive,
    neonOrbSpawnFade,
    neonOrbAbsorbFade,
  } = useControls("Cable neon orbs", {
    neonOrbsEnabled: {
      value: cableNeonOrbDefaults.enabled,
      label: "Enabled",
    },
    neonOrbsPerCable: {
      value: cableNeonOrbDefaults.orbsPerCable,
      min: 1,
      max: cableNeonOrbMaxPerCable,
      step: 1,
      label: "Orbs per cable",
    },
    neonOrbSpeed: {
      value: cableNeonOrbDefaults.speed,
      min: 0.03,
      max: 0.5,
      step: 0.01,
      label: "Flow speed",
    },
    neonOrbRadius: {
      value: cableNeonOrbDefaults.radius,
      min: 0.01,
      max: 0.05,
      step: 0.001,
      label: "Orb radius",
    },
    neonOrbColor: {
      value: cableNeonOrbDefaults.color,
      label: "Color",
    },
    neonOrbEmissive: {
      value: cableNeonOrbDefaults.emissiveIntensity,
      min: 1,
      max: 12,
      step: 0.1,
      label: "Emissive",
    },
    neonOrbSpawnFade: {
      value: cableNeonOrbDefaults.spawnFade,
      min: 0.02,
      max: 0.2,
      step: 0.01,
      label: "Floor spawn fade",
    },
    neonOrbAbsorbFade: {
      value: cableNeonOrbDefaults.absorbFade,
      min: 0.02,
      max: 0.2,
      step: 0.01,
      label: "Helmet absorb fade",
    },
  });
  const bodyCapsules = useRef<ResolvedCableProxyCapsule[]>([]);
  const bodyBoxes = useRef<ResolvedCableProxyBox[]>([]);
  const anchorWorldMatrices = useRef(
    connectorLocalPositions.map(() => new Matrix4()),
  );
  const ropeStates = useRef<RopeState[]>(
    connectorLocalPositions.map(() => ({
      initialized: false,
      points: [],
      previousAnchor: new Vector3(),
    })),
  );
  const helmetTransform = useMemo((): HelmetTransform => {
    const position = new Vector3(...helmetPosition);
    const quaternion = new Quaternion().setFromEuler(
      new Euler(...helmetRotation),
    );
    const centeredOrigin = new Vector3(...helmetCenteredOrigin);
    const connectorLocals = connectorLocalPositions.map(
      (position) => new Vector3(...position),
    );
    const collisionPlaneLocal = new Vector3(...helmetCollisionPlanePosition);
    const collisionPlaneRotationEuler = new Euler(
      ...helmetCollisionPlaneRotation,
    );

    return {
      position,
      quaternion,
      scale: helmetScale,
      centeredOrigin,
      connectorLocals,
      collisionPlaneLocal,
      collisionPlaneRotation: collisionPlaneRotationEuler,
    };
  }, [helmetPosition, helmetRotation, helmetScale]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#101217",
        roughness: 0.85,
        metalness: 0.15,
      }),
    [],
  );
  const orbGeometry = useMemo(() => new SphereGeometry(1, 12, 12), []);
  const orbMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: cableNeonOrbDefaults.color,
        emissive: cableNeonOrbDefaults.color,
        emissiveIntensity: cableNeonOrbDefaults.emissiveIntensity,
        toneMapped: false,
        transparent: true,
        opacity: 1,
      }),
    [],
  );
  const placeholderGeometries = useMemo(
    () =>
      connectorLocalPositions.map(
        () =>
          new TubeGeometry(
            new CatmullRomCurve3([new Vector3(), new Vector3(0, -0.01, 0)]),
            1,
            cableRadius,
            6,
          ),
      ),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);

    head.getWorldPosition(tmpHeadCenter);
    syncCollisionPlane(head, helmetTransform, tmpPlanePoint, tmpPlaneNormal);

    if (bodyProxyCollisionsEnabled && skeletonRoot) {
      resolveCableProxyCapsules(skeletonRoot, undefined, bodyCapsules.current);
      resolveCableProxyBoxes(skeletonRoot, undefined, bodyBoxes.current);
    } else {
      bodyCapsules.current.length = 0;
      bodyBoxes.current.length = 0;
    }

    connectorLocalPositions.forEach((_, ropeIndex) => {
      const mesh = meshRefs.current[ropeIndex];
      if (!mesh) return;

      const anchorWorldMatrix = anchorWorldMatrices.current[ropeIndex];
      syncConnectorTransform(
        head,
        helmetTransform.connectorLocals[ropeIndex],
        helmetTransform,
        tmpAnchor,
        anchorWorldMatrix,
      );

      const rope = ropeStates.current[ropeIndex];

      if (!rope.initialized) {
        rope.points = createInitialPoints(tmpAnchor, ropeIndex);
        pinArcPoints(rope.points, anchorWorldMatrix, ropeIndex);
        resetDynamicTail(rope.points, ropeIndex);
        rope.previousAnchor.copy(tmpAnchor);
        rope.initialized = true;
      }

      const { points } = rope;
      tmpAnchorDelta.subVectors(tmpAnchor, rope.previousAnchor);

      if (tmpAnchorDelta.lengthSq() > 0) {
        const floorPointY = floorY + cableRadius;

        points.forEach((point, pointIndex) => {
          const isPinnedPoint = pointIndex < pinnedArcPhysicsPointCount;
          const isOnFloor =
            point.current.y <= floorPointY + floorContactEpsilon;

          if (!isPinnedPoint && isOnFloor) {
            return;
          }

          tmpFollowDelta.copy(tmpAnchorDelta);
          point.current.add(tmpFollowDelta);
          point.previous.add(tmpFollowDelta);
        });

        rope.previousAnchor.copy(tmpAnchor);
      }

      pinArcPoints(points, anchorWorldMatrix, ropeIndex);

      for (
        let index = pinnedArcPhysicsPointCount;
        index < points.length;
        index += 1
      ) {
        const point = points[index];
        const velocity = tmpDelta
          .subVectors(point.current, point.previous)
          .multiplyScalar(damping);

        point.previous.copy(point.current);
        point.current.add(velocity).addScaledVector(gravity, dt * dt);
      }

      for (
        let iteration = 0;
        iteration < constraintIterations;
        iteration += 1
      ) {
        pinArcPoints(points, anchorWorldMatrix, ropeIndex);

        for (
          let index = pinnedArcPhysicsPointCount - 1;
          index < points.length - 1;
          index += 1
        ) {
          if (index === pinnedArcPhysicsPointCount - 1) {
            tmpDelta.subVectors(
              points[index + 1].current,
              points[index].current,
            );
            const distance = tmpDelta.length();

            if (distance > 0) {
              tmpDelta.multiplyScalar((distance - segmentLength) / distance);
              points[index + 1].current.sub(tmpDelta);
            }
          } else {
            satisfyDistance(points[index], points[index + 1], segmentLength);
          }
        }

        for (
          let index = pinnedArcPhysicsPointCount;
          index < points.length;
          index += 1
        ) {
          const point = points[index];
          const floorPointY = floorY + cableRadius;

          if (point.current.y < floorPointY) {
            tmpDelta.subVectors(point.current, point.previous);
            tmpDelta.x *= floorFriction;
            tmpDelta.z *= floorFriction;

            point.current.y = floorPointY;
            point.previous.set(
              point.current.x - tmpDelta.x,
              floorPointY,
              point.current.z - tmpDelta.z,
            );
          }

          tmpDirection.subVectors(point.current, tmpHeadCenter);
          const helmetDistance = tmpDirection.length();

          if (
            helmetDistance > 0 &&
            helmetDistance < helmetColliderRadius + cableRadius
          ) {
            tmpDirection.multiplyScalar(
              (helmetColliderRadius + cableRadius) / helmetDistance,
            );
            point.current.copy(tmpHeadCenter).add(tmpDirection);
          }

          tmpDirection.subVectors(point.current, tmpPlanePoint);
          const planeDistance = tmpDirection.dot(tmpPlaneNormal);
          const radialDistance = tmpDirection.length();

          if (
            radialDistance < helmetCollisionPlaneRadius &&
            planeDistance < cableRadius
          ) {
            point.current.addScaledVector(
              tmpPlaneNormal,
              cableRadius - planeDistance,
            );
          }

          for (const capsule of bodyCapsules.current) {
            pushPointOutOfCapsule(point.current, capsule, cableRadius);
          }

          for (const box of bodyBoxes.current) {
            pushPointOutOfBox(point.current, box, cableRadius);
          }
        }
      }

      const curve = new CatmullRomCurve3([
        ...createPinnedArcRenderPoints(anchorWorldMatrix, ropeIndex),
        ...points
          .slice(pinnedArcPhysicsPointCount)
          .map(({ current }) => current.clone()),
      ]);
      const geometry = new TubeGeometry(curve, 80, cableRadius, 7);

      mesh.geometry.dispose();
      mesh.geometry = geometry;

      const orbMesh = orbMeshRef.current;
      if (!neonOrbsEnabled || !orbMesh) return;

      neonMaterialColor.current.set(neonOrbColor);
      orbMaterial.color.copy(neonMaterialColor.current);
      orbMaterial.emissive.copy(neonMaterialColor.current);
      orbMaterial.emissiveIntensity = neonOrbEmissive;

      for (let orbIndex = 0; orbIndex < cableNeonOrbMaxPerCable; orbIndex += 1) {
        const instanceIndex = ropeIndex * cableNeonOrbMaxPerCable + orbIndex;
        const isActiveOrb = orbIndex < neonOrbsPerCable;

        if (!isActiveOrb) {
          tmpOrbMatrix.compose(
            tmpOrbPosition.set(0, -100, 0),
            tmpOrbQuaternion.identity(),
            tmpScale.set(0, 0, 0),
          );
          orbMesh.setMatrixAt(instanceIndex, tmpOrbMatrix);
          continue;
        }

        const phase = orbIndex / neonOrbsPerCable + ropeIndex * 0.137;
        const progress = (clock.elapsedTime * neonOrbSpeed + phase) % 1;
        const curveT = 1 - progress;

        curve.getPointAt(curveT, tmpOrbPosition);

        const visibility = getOrbVisibility(
          curveT,
          neonOrbSpawnFade,
          neonOrbAbsorbFade,
        );
        const sizeFactor = getCableNeonOrbSizeFactor(orbIndex);
        const scale = neonOrbRadius * sizeFactor * visibility;

        tmpOrbMatrix.compose(
          tmpOrbPosition,
          tmpOrbQuaternion.identity(),
          tmpScale.set(scale, scale, scale),
        );
        orbMesh.setMatrixAt(instanceIndex, tmpOrbMatrix);
      }
    });

    const orbMesh = orbMeshRef.current;
    if (orbMesh) {
      orbMesh.instanceMatrix.needsUpdate = true;
      orbMesh.visible = neonOrbsEnabled;
    }
  });

  return createPortal(
    <>
      {connectorLocalPositions.map((_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshRefs.current[index] = mesh;
          }}
          castShadow
          receiveShadow
          frustumCulled={false}
          geometry={placeholderGeometries[index]}
          material={material}
        />
      ))}
      <instancedMesh
        ref={orbMeshRef}
        args={[orbGeometry, orbMaterial, cableNeonOrbInstanceCount]}
        frustumCulled={false}
        visible={neonOrbsEnabled}
      />
    </>,
    scene,
  );
}

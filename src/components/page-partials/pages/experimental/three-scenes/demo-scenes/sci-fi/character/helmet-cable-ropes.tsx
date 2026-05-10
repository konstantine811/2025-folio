import { createPortal, useFrame } from "@react-three/fiber";
import { createRef, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";

type HelmetCableRopesProps = {
  head: Object3D;
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
};

type FloorScatterConfig = {
  sideSlope: number;
  backSlope: number;
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
};

const cableRadius = 0.01;
const floorY = 0.08;
const gravity = new Vector3(0, -9.8, 0);
const segmentCount = 94;
const segmentLength = 0.1;
const constraintIterations = 5;
const damping = 0.93;
const pinnedArcPhysicsPointCount = 10;
const pinnedArcRenderPointCount = 30;
const pinnedArcStartOffset: [number, number, number] = [0, 0, 0];
const pinnedArcBackDistance = -0.112;
const pinnedArcLift = 0.115;
const pinnedArcEndDrop = 0.4;
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
const tmpDelta = new Vector3();
const tmpDirection = new Vector3();
const tmpPlanePoint = new Vector3();
const tmpPlaneNormal = new Vector3();
const tmpArcPoint = new Vector3();

const smoothStep = (value: number) => value * value * (3 - 2 * value);

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
  anchor: Group,
  ropeIndex: number,
) => {
  for (let index = 0; index < pinnedArcPhysicsPointCount; index += 1) {
    const t = index / (pinnedArcPhysicsPointCount - 1);
    const point = points[index];
    const arcPoint = getPinnedArcLocalPoint(t, ropeIndex).applyMatrix4(
      anchor.matrixWorld,
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

const createPinnedArcRenderPoints = (anchor: Group, ropeIndex: number) =>
  Array.from({ length: pinnedArcRenderPointCount }, (_, index) => {
    const t = index / (pinnedArcRenderPointCount - 1);

    return getPinnedArcLocalPoint(t, ropeIndex)
      .applyMatrix4(anchor.matrixWorld)
      .clone();
  });

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
  helmetPosition,
  helmetRotation,
  helmetScale,
}: HelmetCableRopesProps) {
  const anchorRefs = useRef(
    connectorLocalPositions.map(() => createRef<Group>()),
  );
  const collisionPlaneRef = useRef<Group>(null);
  const meshRefs = useRef<(Mesh | null)[]>([]);
  const ropeStates = useRef<RopeState[]>(
    connectorLocalPositions.map(() => ({
      initialized: false,
      points: [],
    })),
  );
  const helmetEuler = useMemo(
    () => new Euler(...helmetRotation),
    [helmetRotation],
  );
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#101217",
        roughness: 0.85,
        metalness: 0.15,
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
    collisionPlaneRef.current?.getWorldPosition(tmpPlanePoint);
    tmpPlaneNormal
      .set(0, 0, 1)
      .transformDirection(
        collisionPlaneRef.current?.matrixWorld ?? head.matrixWorld,
      );

    anchorRefs.current.forEach((anchorRef, ropeIndex) => {
      const anchor = anchorRef.current;
      const mesh = meshRefs.current[ropeIndex];

      if (!anchor || !mesh) {
        return;
      }

      anchor.getWorldPosition(tmpAnchor);

      const rope = ropeStates.current[ropeIndex];

      if (!rope.initialized) {
        rope.points = createInitialPoints(tmpAnchor, ropeIndex);
        pinArcPoints(rope.points, anchor, ropeIndex);
        resetDynamicTail(rope.points, ropeIndex);
        rope.initialized = true;
      }

      const { points } = rope;
      pinArcPoints(points, anchor, ropeIndex);

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
        pinArcPoints(points, anchor, ropeIndex);

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

          if (point.current.y < floorY + cableRadius) {
            point.current.y = floorY + cableRadius;
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
        }
      }

      const curve = new CatmullRomCurve3([
        ...createPinnedArcRenderPoints(anchor, ropeIndex),
        ...points
          .slice(pinnedArcPhysicsPointCount)
          .map(({ current }) => current.clone()),
      ]);
      const geometry = new TubeGeometry(curve, 80, cableRadius, 7);

      mesh.geometry.dispose();
      mesh.geometry = geometry;
    });
  });

  return (
    <>
      {createPortal(
        <group
          position={helmetPosition}
          rotation={helmetEuler}
          scale={helmetScale}
        >
          <group position={helmetCenteredOrigin}>
            {connectorLocalPositions.map((position, index) => (
              <group
                key={index}
                ref={anchorRefs.current[index]}
                position={position}
              />
            ))}
            <group
              ref={collisionPlaneRef}
              position={helmetCollisionPlanePosition}
              rotation={helmetCollisionPlaneRotation}
            />
          </group>
        </group>,
        head,
      )}
      {connectorLocalPositions.map((_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshRefs.current[index] = mesh;
          }}
          castShadow
          receiveShadow
          geometry={placeholderGeometries[index]}
          material={material}
        />
      ))}
    </>
  );
}

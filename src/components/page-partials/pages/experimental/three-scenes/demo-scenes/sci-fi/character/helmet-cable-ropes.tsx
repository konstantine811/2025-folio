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

const cableRadius = 0.018;
const floorY = 0.08;
const gravity = new Vector3(0, -5.5, 0);
const segmentCount = 64;
const segmentLength = 0.14;
const constraintIterations = 5;
const damping = 0.965;
const helmetColliderRadius = 0.16;
const helmetCollisionPlaneRadius = 0.22;
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
  [-0.117, 2.089, 6.636],
  [-0.101, 2.115, 6.565],
  [-0.055, 2.133, 6.547],
  [-0.001, 2.135, 6.542],
  [0.059, 2.134, 6.549],
  [0.116, 2.089, 6.605],
  [0.117, 2.093, 6.684],
  [-0.116, 2.138, 6.712],
];

const tmpHeadCenter = new Vector3();
const tmpAnchor = new Vector3();
const tmpDelta = new Vector3();
const tmpDirection = new Vector3();
const tmpPlanePoint = new Vector3();
const tmpPlaneNormal = new Vector3();

const createInitialPoints = (anchor: Vector3, index: number) => {
  const spread = (index - (connectorLocalPositions.length - 1) / 2) * 0.035;
  const floorPointY = floorY + cableRadius;
  const dropDistance = Math.max(anchor.y - floorPointY, 0);

  return Array.from({ length: segmentCount }, (_, pointIndex) => {
    const distanceAlongCable = segmentLength * pointIndex;
    const isOnFloor = distanceAlongCable > dropDistance;
    const floorDistance = Math.max(distanceAlongCable - dropDistance, 0);
    const point = new Vector3(
      anchor.x + spread,
      isOnFloor ? floorPointY : anchor.y - distanceAlongCable,
      anchor.z +
        (Math.min(distanceAlongCable, dropDistance) * initialFloorBackSlope +
          floorDistance) *
          initialFloorDirection,
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
      .transformDirection(collisionPlaneRef.current?.matrixWorld ?? head.matrixWorld);

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
        rope.initialized = true;
      }

      const { points } = rope;
      points[0].current.copy(tmpAnchor);
      points[0].previous.copy(tmpAnchor);

      for (let index = 1; index < points.length; index += 1) {
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
        points[0].current.copy(tmpAnchor);

        for (let index = 0; index < points.length - 1; index += 1) {
          if (index === 0) {
            tmpDelta.subVectors(points[1].current, points[0].current);
            const distance = tmpDelta.length();

            if (distance > 0) {
              tmpDelta.multiplyScalar((distance - segmentLength) / distance);
              points[1].current.sub(tmpDelta);
            }
          } else {
            satisfyDistance(points[index], points[index + 1], segmentLength);
          }
        }

        for (let index = 1; index < points.length; index += 1) {
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

      const curve = new CatmullRomCurve3(
        points.map(({ current }) => current.clone()),
      );
      const geometry = new TubeGeometry(curve, 18, cableRadius, 7);

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

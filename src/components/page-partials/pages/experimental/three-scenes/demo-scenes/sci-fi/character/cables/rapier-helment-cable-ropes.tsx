import { useFrame } from "@react-three/fiber";
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  interactionGroups,
  useRopeJoint,
} from "@react-three/rapier";
import {
  CatmullRomCurve3,
  Euler,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";
import { RefObject, createRef, useMemo, useRef } from "react";

type Vec3 = [number, number, number];

type RapierHelmetCableProps = {
  head: Object3D;
  connectorLocalPosition: Vec3;
  helmetCenteredOrigin: Vec3;
  helmetPosition: Vec3;
  helmetRotation: Vec3;
  helmetScale: number;
  ropeIndex: number;
  ropeCount: number;
};

type CableJointProps = {
  bodyARef: RefObject<RapierRigidBody>;
  bodyBRef: RefObject<RapierRigidBody>;
  length: number;
};

const cableRadius = 0.018;
const colliderRadius = 0.032;
const visualSegments = 28;
const cableCollisionGroup = 4;
const cableFloorCollisionGroup = 5;
const helmetCollisionGroup = 6;
const cableFloorContactY = 0.115 + colliderRadius;
const helmetArcSegmentCount = 8;
const helmetArcSegmentLength = 0.35;
const tailSegmentCount = 18;
const tailSegmentLength = 0.36;
const floorTailSpread = 0.65;
const floorTailBackSpread = 1.2;
const floorTailSettleStrength = 0.0008;
const floorTailContactEpsilon = 0.04;

const settleFrames = 30;

const createRigidBodyRef = () =>
  createRef<RapierRigidBody>() as RefObject<RapierRigidBody>;

function CableJoint({ bodyARef, bodyBRef, length }: CableJointProps) {
  useRopeJoint(bodyARef, bodyBRef, [[0, 0, 0], [0, 0, 0], length]);

  return null;
}

export function RapierHelmetCable({
  head,
  connectorLocalPosition,
  helmetCenteredOrigin,
  helmetPosition,
  helmetRotation,
  helmetScale,
  ropeIndex,
  ropeCount,
}: RapierHelmetCableProps) {
  const anchorBodyRef = useRef<RapierRigidBody>(null!);
  const initializedRef = useRef(false);
  const meshRef = useRef<Mesh>(null);
  const frameIndexRef = useRef(0);

  const segmentLengths = useMemo(
    () => [
      ...Array.from(
        { length: helmetArcSegmentCount },
        () => helmetArcSegmentLength,
      ),
      ...Array.from({ length: tailSegmentCount }, () => tailSegmentLength),
    ],
    [],
  );
  const segmentDistances = useMemo(() => {
    let distance = 0;

    return segmentLengths.map((length) => {
      distance += length;

      return distance;
    });
  }, [segmentLengths]);

  const segmentBodyRefs = useRef<RefObject<RapierRigidBody>[]>(
    Array.from({ length: segmentLengths.length }, createRigidBodyRef),
  );

  const helmetEuler = useMemo(
    () => new Euler(...helmetRotation),
    [helmetRotation],
  );
  const helmetPositionVector = useMemo(
    () => new Vector3(...helmetPosition),
    [helmetPosition],
  );
  const connectorPoint = useMemo(
    () =>
      new Vector3(...helmetCenteredOrigin).add(
        new Vector3(...connectorLocalPosition),
      ),
    [connectorLocalPosition, helmetCenteredOrigin],
  );
  const anchorWorld = useMemo(() => new Vector3(), []);
  const anchorLocal = useMemo(() => new Vector3(), []);
  const points = useMemo(
    () =>
      Array.from({ length: segmentLengths.length + 1 }, () => new Vector3()),
    [segmentLengths.length],
  );
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#101217",
        roughness: 0.82,
        metalness: 0.12,
      }),
    [],
  );
  const placeholderGeometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3([new Vector3(), new Vector3(0, -0.1, 0)]),
        2,
        cableRadius,
        6,
      ),
    [],
  );
  const settleFrameRef = useRef(0);
  const anchorReadyRef = useRef(false);
  const smoothedAnchorWorld = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if (!anchorBodyRef.current || !meshRef.current) return;

    head.updateWorldMatrix(true, false);
    anchorLocal
      .copy(connectorPoint)
      .multiplyScalar(helmetScale)
      .applyEuler(helmetEuler)
      .add(helmetPositionVector);
    anchorWorld.copy(anchorLocal);
    head.localToWorld(anchorWorld);

    if (!anchorReadyRef.current) {
      smoothedAnchorWorld.copy(anchorWorld);
      anchorReadyRef.current = true;
    } else {
      const smoothing = 1 - Math.exp((-12 * 1) / 60);
      smoothedAnchorWorld.lerp(anchorWorld, smoothing);
    }

    anchorBodyRef.current.setNextKinematicTranslation(smoothedAnchorWorld);

    if (!initializedRef.current) {
      const sideOffset = (ropeIndex - (ropeCount - 1) / 2) * 0.014;

      anchorBodyRef.current.setTranslation(smoothedAnchorWorld, true);
      anchorBodyRef.current.setNextKinematicTranslation(smoothedAnchorWorld);

      segmentBodyRefs.current.forEach((bodyRef, index) => {
        const body = bodyRef.current;
        if (!body) return;

        const distance = segmentDistances[index];
        const isHelmetArc = index < helmetArcSegmentCount;

        const dropToFloor = Math.max(
          smoothedAnchorWorld.y - cableFloorContactY,
          0,
        );
        const floorDistance = Math.max(distance - dropToFloor, 0);
        const floorT = Math.min(
          floorDistance / (tailSegmentLength * tailSegmentCount),
          1,
        );

        const arcT = Math.min((index + 1) / helmetArcSegmentCount, 1);
        const arcLift = Math.sin(arcT * Math.PI) * 0.09;

        const floorSide =
          (ropeIndex - (ropeCount - 1) / 2) *
          (floorTailSpread / Math.max(ropeCount - 1, 1));

        const floorWave = Math.sin(ropeIndex * 1.7 + floorT * Math.PI) * 0.04;

        const x =
          smoothedAnchorWorld.x + sideOffset + (floorSide + floorWave) * floorT;

        const y = isHelmetArc
          ? Math.max(
              smoothedAnchorWorld.y - distance * 0.28 + arcLift,
              cableFloorContactY,
            )
          : cableFloorContactY;

        const z =
          smoothedAnchorWorld.z -
          distance * (isHelmetArc ? 0.9 : 0.25) -
          floorDistance * (0.35 + floorTailBackSpread * floorT);

        body.setTranslation({ x, y, z }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      });

      initializedRef.current = true;
      settleFrameRef.current = settleFrames;
    }

    anchorBodyRef.current.setNextKinematicTranslation(anchorWorld);

    segmentBodyRefs.current.forEach((bodyRef, index) => {
      const body = bodyRef.current;
      if (!body) return;

      const translation = body.translation();

      if (translation.y < cableFloorContactY) {
        const velocity = body.linvel();
        body.setTranslation(
          {
            x: translation.x,
            y: cableFloorContactY,
            z: translation.z,
          },
          true,
        );
        body.setLinvel({ x: velocity.x, y: 0, z: velocity.z }, true);
      }

      if (
        index < helmetArcSegmentCount ||
        translation.y > cableFloorContactY + floorTailContactEpsilon
      ) {
        return;
      }

      const distance = segmentDistances[index];
      const dropToFloor = Math.max(anchorWorld.y - cableFloorContactY, 0);
      const floorDistance = Math.max(distance - dropToFloor, 0);
      const floorT = Math.min(
        floorDistance / (tailSegmentLength * tailSegmentCount),
        1,
      );

      if (floorT <= 0) return;

      const floorSide =
        (ropeIndex - (ropeCount - 1) / 2) *
        (floorTailSpread / Math.max(ropeCount - 1, 1));
      const floorWave = Math.sin(ropeIndex * 1.7 + floorT * Math.PI) * 0.08;
      const targetX = anchorWorld.x + floorSide * floorT + floorWave * floorT;
      const targetZ =
        anchorWorld.z -
        distance * 0.35 -
        floorDistance * (0.45 + floorTailBackSpread * floorT);
      const velocity = body.linvel();

      body.setLinvel(
        {
          x: velocity.x + (targetX - translation.x) * floorTailSettleStrength,
          y: velocity.y,
          z: velocity.z + (targetZ - translation.z) * floorTailSettleStrength,
        },
        true,
      );
    });

    frameIndexRef.current += 1;
    if (frameIndexRef.current % 2 !== 0) return;

    points[0].copy(anchorWorld);

    segmentBodyRefs.current.forEach((bodyRef, index) => {
      const translation = bodyRef.current?.translation();
      if (!translation) return;

      points[index + 1].set(translation.x, translation.y, translation.z);
    });

    const curve = new CatmullRomCurve3(points);
    const geometry = new TubeGeometry(curve, visualSegments, cableRadius, 6);

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = geometry;
  });

  return (
    <>
      <RigidBody
        ref={anchorBodyRef}
        type="kinematicPosition"
        colliders={false}
        position={[0, 0, 0]}
      />

      <CableJoint
        bodyARef={anchorBodyRef}
        bodyBRef={segmentBodyRefs.current[0]}
        length={segmentLengths[0]}
      />

      {segmentBodyRefs.current.map((bodyRef, index) => (
        <RigidBody
          key={index}
          ref={bodyRef}
          colliders={false}
          ccd
          canSleep={false}
          enabledRotations={[false, false, false]}
          linearDamping={10}
          angularDamping={12}
          gravityScale={1}
          additionalSolverIterations={16}
          position={[0, -segmentLengths[index] * index, 0]}
        >
          <BallCollider
            args={[colliderRadius]}
            collisionGroups={interactionGroups(cableCollisionGroup, [
              cableFloorCollisionGroup,
              helmetCollisionGroup,
            ])}
            friction={2.1}
            restitution={0.7}
            density={1.4}
          />
        </RigidBody>
      ))}

      {segmentBodyRefs.current.slice(0, -1).map((bodyRef, index) => (
        <CableJoint
          key={index}
          bodyARef={bodyRef}
          bodyBRef={segmentBodyRefs.current[index + 1]}
          length={segmentLengths[index + 1]}
        />
      ))}

      <mesh
        ref={meshRef}
        geometry={placeholderGeometry}
        material={material}
        frustumCulled={false}
        renderOrder={10}
      />
    </>
  );
}

import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  useSphericalJoint,
} from "@react-three/rapier";
import { RefObject, createRef, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";

type Vec3 = [number, number, number];

type SimpleRapierHelmetCableProps = {
  head: Object3D;
  helmetPosition: Vec3;
  helmetRotation: Vec3;
  helmetScale: number;
};

type JointProps = {
  bodyA: RefObject<RapierRigidBody>;
  bodyB: RefObject<RapierRigidBody>;
  anchorA: Vec3;
  anchorB: Vec3;
};

const helmetCenteredOrigin: Vec3 = [0, -2.067, -6.745];

const connectorLocalPosition: Vec3 = [-0.107, 2.159, 6.636];

const segmentCount = 8;
const segmentLength = 0.12;
const cableRadius = 0.035;

const tmpAnchorWorld = new Vector3();

function CableJoint({ bodyA, bodyB, anchorA, anchorB }: JointProps) {
  useSphericalJoint(bodyA, bodyB, [anchorA, anchorB]);

  return null;
}

export default function SimpleRapierHelmetCable({
  head,
  helmetPosition,
  helmetRotation,
  helmetScale,
}: SimpleRapierHelmetCableProps) {
  const { scene } = useThree();

  /**
   * Invisible anchor на шоломі.
   * Він живе всередині head.
   */
  const anchorRef = useRef<Group>(null);

  /**
   * Kinematic body — фізична точка, яка буде слідувати за anchorRef.
   */
  const anchorBodyRef = useRef<RapierRigidBody>(null);

  /**
   * Dynamic bodies — шматочки кабелю.
   */
  const segmentBodyRefs = useRef<RefObject<RapierRigidBody>[]>(
    Array.from({ length: segmentCount }, () => createRef<RapierRigidBody>()),
  );

  const cableMeshRef = useRef<Mesh>(null);
  const debugAnchorMeshRef = useRef<Mesh>(null);

  const initializedRef = useRef(false);

  const helmetEuler = useMemo(
    () => new Euler(...helmetRotation),
    [helmetRotation],
  );

  const cableMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "red",
      }),
    [],
  );

  const debugAnchorMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "lime",
      }),
    [],
  );

  const placeholderCableGeometry = useMemo(() => {
    return new TubeGeometry(
      new CatmullRomCurve3([new Vector3(), new Vector3(0, -0.2, 0)]),
      4,
      cableRadius,
      8,
    );
  }, []);

  const debugSphereGeometry = useMemo(() => {
    return new SphereGeometry(0.08, 16, 16);
  }, []);

  useFrame(() => {
    const anchor = anchorRef.current;
    const anchorBody = anchorBodyRef.current;
    const cableMesh = cableMeshRef.current;
    const debugAnchorMesh = debugAnchorMeshRef.current;

    if (!anchor || !anchorBody || !cableMesh || !debugAnchorMesh) return;

    /**
     * Node 01
     * Оновлюємо matrix, бо anchor живе всередині createPortal(head).
     */
    head.updateWorldMatrix(true, true);
    anchor.updateWorldMatrix(true, false);

    /**
     * Node 02
     * Беремо реальну world-position точки на шоломі.
     */
    anchor.getWorldPosition(tmpAnchorWorld);

    /**
     * Node 03
     * Debug sphere показує точку кріплення.
     */
    debugAnchorMesh.position.copy(tmpAnchorWorld);

    /**
     * Node 04
     * Kinematic body слідує за anchor-ом.
     * Саме за нього буде триматися кабель.
     */
    anchorBody.setNextKinematicTranslation({
      x: tmpAnchorWorld.x,
      y: tmpAnchorWorld.y,
      z: tmpAnchorWorld.z,
    });

    /**
     * Node 05
     * Перший раз розставляємо dynamic bodies вниз від anchor-а.
     * Без цього вони можуть стартувати в [0,0,0].
     */
    if (!initializedRef.current) {
      segmentBodyRefs.current.forEach((bodyRef, index) => {
        const body = bodyRef.current;
        if (!body) return;

        body.setTranslation(
          {
            x: tmpAnchorWorld.x,
            y: tmpAnchorWorld.y - segmentLength * (index + 1),
            z: tmpAnchorWorld.z,
          },
          true,
        );

        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      });

      initializedRef.current = true;
    }

    /**
     * Node 06
     * Беремо позиції physics bodies і малюємо по них TubeGeometry.
     */
    const points: Vector3[] = [tmpAnchorWorld.clone()];

    segmentBodyRefs.current.forEach((bodyRef) => {
      const body = bodyRef.current;
      if (!body) return;

      const position = body.translation();

      points.push(new Vector3(position.x, position.y, position.z));
    });

    if (points.length < 2) return;

    const curve = new CatmullRomCurve3(points);
    const geometry = new TubeGeometry(curve, 48, cableRadius, 8);

    cableMesh.geometry.dispose();
    cableMesh.geometry = geometry;
  });

  return (
    <>
      {/**
       * Anchor на шоломі.
       * Це не physics body, а просто точка, з якої ми беремо world-position.
       */}
      {createPortal(
        <group
          position={helmetPosition}
          rotation={helmetEuler}
          scale={helmetScale}
        >
          <group position={helmetCenteredOrigin}>
            <group ref={anchorRef} position={connectorLocalPosition} />
          </group>
        </group>,
        head,
      )}

      {/**
       * Physics bodies і видимі mesh-и краще тримати у scene/world-space.
       */}
      {createPortal(
        <>
          {/* Debug sphere на anchor-і */}
          <mesh
            ref={debugAnchorMeshRef}
            geometry={debugSphereGeometry}
            material={debugAnchorMaterial}
          />

          {/* Kinematic physics anchor */}
          <RigidBody
            ref={anchorBodyRef}
            type="kinematicPosition"
            colliders={false}
            position={[0, 0, 0]}
          >
            <BallCollider args={[0.03]} />
          </RigidBody>

          {/* Dynamic physics segments */}
          {segmentBodyRefs.current.map((bodyRef, index) => (
            <RigidBody
              key={`cable-segment-${index}`}
              ref={bodyRef}
              colliders={false}
              position={[0, -segmentLength * (index + 1), 0]}
              linearDamping={1.8}
              angularDamping={2.5}
            >
              <BallCollider args={[0.04]} />
            </RigidBody>
          ))}

          {/* Joint: anchor body -> first segment */}
          <CableJoint
            bodyA={anchorBodyRef}
            bodyB={segmentBodyRefs.current[0]}
            anchorA={[0, 0, 0]}
            anchorB={[0, 0, 0]}
          />

          {/* Joints: segment -> segment */}
          {segmentBodyRefs.current.slice(0, -1).map((bodyRef, index) => (
            <CableJoint
              key={`cable-joint-${index}`}
              bodyA={bodyRef}
              bodyB={segmentBodyRefs.current[index + 1]}
              anchorA={[0, 0, 0]}
              anchorB={[0, 0, 0]}
            />
          ))}

          {/* Visual cable */}
          <mesh
            ref={cableMeshRef}
            geometry={placeholderCableGeometry}
            material={cableMaterial}
            castShadow
            receiveShadow
          />
        </>,
        scene,
      )}
    </>
  );
}

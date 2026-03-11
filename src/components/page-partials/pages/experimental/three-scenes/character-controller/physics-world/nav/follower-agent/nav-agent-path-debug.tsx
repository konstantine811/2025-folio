import { useFrame } from "@react-three/fiber";
import { RefObject, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Mesh,
  Object3D,
} from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { Vec3 } from "../../../models/character-controller.model";

type AgentPathState = {
  path: { x: number; y: number; z: number }[];
  pathIndex: number;
  lastPathMs: number;
  lastTargetPos: Vec3 | null;
};

type Props = {
  rigidBodyRef: RefObject<RapierRigidBody | null>;
  pathStateRef: RefObject<AgentPathState>;
};

const MAX_POINTS = 128;

export default function AgentPathDebugSingle({
  rigidBodyRef,
  pathStateRef,
}: Props) {
  const pointsRef = useRef<InstancedMesh>(null);
  const currentPointRef = useRef<Mesh>(null);
  const lineStartPointRef = useRef<Mesh>(null);
  const lastSignatureRef = useRef("");

  const linePositions = useMemo(() => new Float32Array(MAX_POINTS * 3), []);
  const tempObject = useMemo(() => new Object3D(), []);

  const lineGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(linePositions, 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, [linePositions]);

  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ color: "green" }),
    [],
  );

  const lineObject = useMemo(
    () => new Line(lineGeometry, lineMaterial),
    [lineGeometry, lineMaterial],
  );

  useFrame(() => {
    const rb = rigidBodyRef.current;
    const state = pathStateRef.current;

    if (!rb || !state) return;

    const bodyPos = rb.translation();
    const path = state.path ?? [];
    const pathIndex = state.pathIndex ?? 0;

    const signature =
      `${bodyPos.x.toFixed(2)},${bodyPos.y.toFixed(2)},${bodyPos.z.toFixed(2)}|` +
      `${pathIndex}|${path.length}|` +
      path
        .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`)
        .join(";");

    if (signature === lastSignatureRef.current) return;
    lastSignatureRef.current = signature;

    const pointsMesh = pointsRef.current;
    const currentMesh = currentPointRef.current;
    const startMesh = lineStartPointRef.current;
    if (!pointsMesh || !currentMesh || !startMesh) return;

    const visiblePathCount = Math.min(path.length, MAX_POINTS - 1);
    const totalVisiblePoints = Math.min(visiblePathCount + 1, MAX_POINTS);

    // Перша точка лінії — поточна позиція rigidbody
    linePositions[0] = bodyPos.x;
    linePositions[1] = bodyPos.y + 0.08;
    linePositions[2] = bodyPos.z;

    startMesh.visible = true;
    startMesh.position.set(bodyPos.x, bodyPos.y + 0.08, bodyPos.z);
    startMesh.scale.setScalar(1);

    // Інші точки — path
    for (let i = 0; i < visiblePathCount; i++) {
      const p = path[i];
      const idx = i + 1;

      linePositions[idx * 3 + 0] = p.x;
      linePositions[idx * 3 + 1] = p.y + 0.08;
      linePositions[idx * 3 + 2] = p.z;

      tempObject.position.set(p.x, p.y + 0.1, p.z);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      pointsMesh.setMatrixAt(i, tempObject.matrix);
    }

    // Ховаємо зайві instance точки
    for (let i = visiblePathCount; i < MAX_POINTS - 1; i++) {
      tempObject.position.set(0, -9999, 0);
      tempObject.scale.setScalar(0.0001);
      tempObject.updateMatrix();
      pointsMesh.setMatrixAt(i, tempObject.matrix);
    }

    // Чистимо зайві вершини лінії
    for (let i = totalVisiblePoints; i < MAX_POINTS; i++) {
      linePositions[i * 3 + 0] = 0;
      linePositions[i * 3 + 1] = -9999;
      linePositions[i * 3 + 2] = 0;
    }

    const positionAttr = lineGeometry.getAttribute(
      "position",
    ) as BufferAttribute;
    positionAttr.needsUpdate = true;
    lineGeometry.setDrawRange(0, totalVisiblePoints);
    lineGeometry.computeBoundingSphere();

    lineObject.visible = totalVisiblePoints > 1;

    pointsMesh.count = visiblePathCount;
    pointsMesh.visible = visiblePathCount > 0;
    pointsMesh.instanceMatrix.needsUpdate = true;

    const current = path[pathIndex];
    if (current) {
      currentMesh.visible = true;
      currentMesh.position.set(current.x, current.y + 0.12, current.z);
      currentMesh.scale.setScalar(1.4);
    } else {
      currentMesh.visible = false;
    }
  });

  return (
    <group>
      <primitive object={lineObject} />

      {/* Всі path точки */}
      <instancedMesh
        ref={pointsRef}
        args={[undefined, undefined, MAX_POINTS - 1]}
        visible={false}
      >
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshBasicMaterial color="orange" />
      </instancedMesh>

      {/* Поточний waypoint */}
      <mesh ref={currentPointRef} visible={false}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="red" />s
      </mesh>

      {/* Старт лінії = позиція агента */}
      <mesh ref={lineStartPointRef} visible={false}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshBasicMaterial color="cyan" />
      </mesh>
    </group>
  );
}

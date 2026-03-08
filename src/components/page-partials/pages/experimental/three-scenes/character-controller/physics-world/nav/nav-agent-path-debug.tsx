import { useFrame } from "@react-three/fiber";
import { RefObject, useMemo, useRef } from "react";
import { AgentPathState } from "../../models/nav-path.model";
import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Mesh,
  Object3D,
} from "three";

type Props = {
  pathStatesRef: RefObject<AgentPathState[]>;
  agentIndex: number;
};

const MAX_POINTS = 128;

export default function AgentPathDebug({ pathStatesRef, agentIndex }: Props) {
  const pointsRef = useRef<InstancedMesh>(null);
  const currentPointRef = useRef<Mesh>(null);
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
    const state = pathStatesRef?.current?.[agentIndex];
    if (!state) return;

    const path = state.path ?? [];
    const pathIndex = state.pathIndex ?? 0;

    const signature =
      `${pathIndex}|${path.length}|` +
      path
        .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`)
        .join(";");

    if (signature === lastSignatureRef.current) return;
    lastSignatureRef.current = signature;

    const pointsMesh = pointsRef.current;
    const currentMesh = currentPointRef.current;
    if (!pointsMesh || !currentMesh) return;

    const visibleCount = Math.min(path.length, MAX_POINTS);

    for (let i = 0; i < visibleCount; i++) {
      const p = path[i];

      linePositions[i * 3 + 0] = p.x;
      linePositions[i * 3 + 1] = p.y + 0.08;
      linePositions[i * 3 + 2] = p.z;

      tempObject.position.set(p.x, p.y + 0.1, p.z);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      pointsMesh.setMatrixAt(i, tempObject.matrix);
    }

    for (let i = visibleCount; i < MAX_POINTS; i++) {
      linePositions[i * 3 + 0] = 0;
      linePositions[i * 3 + 1] = -9999;
      linePositions[i * 3 + 2] = 0;

      tempObject.position.set(0, -9999, 0);
      tempObject.scale.setScalar(0.0001);
      tempObject.updateMatrix();
      pointsMesh.setMatrixAt(i, tempObject.matrix);
    }

    const positionAttr = lineGeometry.getAttribute(
      "position",
    ) as BufferAttribute;
    positionAttr.needsUpdate = true;
    lineGeometry.setDrawRange(0, visibleCount);
    lineGeometry.computeBoundingSphere();

    lineObject.visible = visibleCount > 0;

    pointsMesh.count = visibleCount;
    pointsMesh.visible = visibleCount > 0;
    pointsMesh.instanceMatrix.needsUpdate = true;

    const current = path[pathIndex];
    if (current) {
      currentMesh.visible = true;
      currentMesh.position.set(current.x, current.y + 0.1, current.z);
      currentMesh.scale.setScalar(1.4);
    } else {
      currentMesh.visible = false;
    }
  });

  return (
    <group>
      <primitive object={lineObject} />

      <instancedMesh
        ref={pointsRef}
        args={[undefined, undefined, MAX_POINTS]}
        visible={false}
      >
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshBasicMaterial color="orange" />
      </instancedMesh>

      <mesh ref={currentPointRef} visible={false}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
}

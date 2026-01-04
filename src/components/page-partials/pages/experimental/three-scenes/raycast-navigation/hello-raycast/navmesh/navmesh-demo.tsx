import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNavMeshPositionsAndIndices,
  init,
  NavMesh,
  NavMeshQuery,
} from "recast-navigation";
import { generateSoloNavMesh } from "recast-navigation/generators";
import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from "three";

let _initPromise: Promise<void> | null = null;
function ensureRecastInit() {
  if (!_initPromise) {
    _initPromise = init();
  }
  return _initPromise;
}

function collectGeometryFromObject(root: Object3D) {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  const tempVec = new Vector3();

  root.updateWorldMatrix(true, false);

  root.traverse((mesh) => {
    if (mesh instanceof Mesh) {
      mesh.updateWorldMatrix(true, false);

      const geom = mesh.geometry as BufferGeometry;
      const posAttr = geom.getAttribute("position") as
        | BufferAttribute
        | undefined;

      if (!posAttr) return;

      // vertices -> world space
      for (let i = 0; i < posAttr.count; i++) {
        tempVec.fromBufferAttribute(posAttr, i);
        tempVec.applyMatrix4(mesh.matrixWorld);
        positions.push(tempVec.x, tempVec.y, tempVec.z);
      }

      const indexAttr = geom.getIndex();
      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i++) {
          indices.push(indexAttr.getX(i) + vertexOffset);
        }
      } else {
        // non-indexed geometry
        for (let i = 0; i < posAttr.count; i++) indices.push(vertexOffset + i);
      }

      vertexOffset += posAttr.count;
    }
  });

  return { positions, indices };
}

const NavMeshDemo = () => {
  const levelRef = useRef<Group>(null);
  const [target, setTarget] = useState<Vector3>(new Vector3(0, 0, 0));

  const [navMeshData, setNavMeshData] = useState<{
    navMesh: NavMesh;
    query: NavMeshQuery;
    navPositions: ArrayLike<number>;
    navIndices: ArrayLike<number>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureRecastInit();
      if (cancelled) return;

      const root = levelRef.current;
      if (!root) return;

      const { positions, indices } = collectGeometryFromObject(root);

      const { success, navMesh } = generateSoloNavMesh(positions, indices, {
        cs: 0.2,
        ch: 0.2,

        walkableSlopeAngle: 45,
        walkableHeight: 1.8,
        walkableClimb: 0.4,
        walkableRadius: 0.4,
      });

      if (!success || !navMesh) {
        console.error("NavMesh build failed:");
        return;
      }

      const [navPositions, navIndices] = getNavMeshPositionsAndIndices(navMesh);
      const query = new NavMeshQuery(navMesh);

      if (!cancelled) {
        setNavMeshData({ navMesh, query, navPositions, navIndices });
      }
    })();

    return () => {
      cancelled = true;
    };
  });
  const navGeometry = useMemo(() => {
    if (!navMeshData) return null;

    const g = new BufferGeometry();
    // navPositions/navIndices можуть бути typed arrays або array-like
    g.setAttribute(
      "position",
      new Float32BufferAttribute(Array.from(navMeshData.navPositions), 3)
    );
    g.setIndex(Array.from(navMeshData.navIndices));

    // трішки підіймаємо, щоб не “мерехтіло” з підлогою
    g.translate(0, 0.02, 0);
    return g;
  }, [navMeshData]);

  const pathLineGeometry = useMemo(() => {
    if (!navMeshData) return null;

    // Старт — фіксований (для уроку 1)
    const start: Vector3 = new Vector3(-6, 0, -6);

    // Дуже корисно “прибити” точки до navmesh:
    // (особливо якщо клік або фізика дають точки трохи поза mesh)
    const startOnMesh = navMeshData.query.findClosestPoint(start);
    const endOnMesh = navMeshData.query.findClosestPoint(target);

    if (!startOnMesh.success || !endOnMesh.success) return null;

    const res = navMeshData.query.computePath(
      startOnMesh.point,
      endOnMesh.point
    );
    if (!res.success || !res.path?.length) return null;

    const pts = res.path.map((p) => new Vector3(p.x, p.y + 0.05, p.z));
    const g = new BufferGeometry().setFromPoints(pts);
    return g;
  }, [navMeshData, target]);

  return (
    <>
      <group ref={levelRef}>
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0, 0]}
          onPointerDown={(e) => {
            // e.point — world координата кліку по підлозі
            setTarget(new Vector3(e.point.x, e.point.y, e.point.z));
          }}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2b3447" roughness={1} />
        </mesh>
        {/* Платформа (верх буде walkable, але залежить від walkableClimb) */}
        <mesh position={[2, 0.5, 0]}>
          <boxGeometry args={[3, 1, 3]} />
          <meshStandardMaterial color="#3a4a6a" roughness={1} />
        </mesh>
        {/* Стіна-перешкода */}
        <mesh position={[-2, 1, 0]}>
          <boxGeometry args={[0.3, 2, 6]} />
          <meshStandardMaterial color="#6a3a3a" roughness={1} />
        </mesh>
      </group>
      {/* Візуалізація navmesh */}
      {navGeometry && (
        <mesh geometry={navGeometry}>
          <meshBasicMaterial wireframe transparent opacity={0.9} />
        </mesh>
      )}

      {/* Лінія шляху */}
      {pathLineGeometry && (
        <line geometry={pathLineGeometry}>
          <lineBasicMaterial transparent opacity={0.95} />
        </line>
      )}
    </>
  );
};

export default NavMeshDemo;

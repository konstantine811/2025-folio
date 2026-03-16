import { useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import NavMeshGeneratorWorker from "@/workers/three/navmesh-generator.worker?worker";
import { useConst } from "@/hooks/use-const";
import {
  NavMesh,
  NavMeshQuery,
  RecastConfig,
  UnsignedCharArray,
} from "recast-navigation";
import { useInterval } from "@/hooks/useInterval";
import { Entity, NavComponent, traversableQuery } from "../../../ecs";
import { Box3 } from "three";
import { getPositionsAndIndices } from "@recast-navigation/three";
import { getTraversableMeshes } from "../../../utils/nav/nav-generate.util";

export const NavMeshGenerator = () => {
  const { rapier } = useRapier();

  const navMeshWorker =
    useRef<InstanceType<typeof NavMeshGeneratorWorker>>(undefined);
  const inProgress = useRef(false);
  const first = useRef(true);

  const nav = useConst<NavComponent>(() => ({
    navMesh: undefined,
    navMeshQuery: undefined,
    navMeshVersion: 0,
  }));

  useEffect(() => {
    const navMesh = new NavMesh();
    const navMeshQuery = new NavMeshQuery(navMesh);

    nav.navMesh = navMesh;
    nav.navMeshQuery = navMeshQuery;

    const worker = new NavMeshGeneratorWorker();

    worker.onmessage = ({ data: { navMeshData: serialisedNavMeshData } }) => {
      inProgress.current = false;

      const navMeshData = new UnsignedCharArray();
      navMeshData.copy(serialisedNavMeshData as ArrayLike<number> as number[]);

      navMesh.initSolo(navMeshData);
      nav.navMeshVersion++;
      first.current = false;
    };

    navMeshWorker.current = worker;
    inProgress.current = false;

    return () => {
      navMeshWorker.current = undefined;
      inProgress.current = false;
      worker.terminate();
      navMesh.destroy();
      navMeshQuery.destroy();
    };
  }, [nav]);

  useInterval(() => {
    if (inProgress.current) return;

    if (!first.current) {
      const dynamciRigidBodiesSleepStates = traversableQuery.entities
        .filter((e) => e.rigidBody)
        .filter((e) => e.rigidBody!.bodyType() === rapier.RigidBodyType.Dynamic)
        .map(({ rigidBody }) => rigidBody!.isSleeping());

      if (
        dynamciRigidBodiesSleepStates.length === 0 ||
        dynamciRigidBodiesSleepStates.every((x) => x)
      )
        return;
    }

    const traversableMeshes = getTraversableMeshes();

    // filter out meshes outside of some bounds
    const bounds = new Box3();
    bounds.min.set(-100, -100, -100);
    bounds.max.set(100, 100, 100);

    const meshes = traversableMeshes.filter((mesh) => {
      const box = new Box3().setFromObject(mesh);
      return bounds.containsBox(box);
    });

    const [positions, indices] = getPositionsAndIndices(meshes);

    const cs = 0.2;
    const ch = 0.02;

    const recastConfig: RecastConfig = {
      cs: cs,
      ch: ch,
      walkableRadius: 0.5 / cs,
      walkableHeight: 2 / ch,
      walkableClimb: 0.4 / ch,
      walkableSlopeAngle: 45,
      borderSize: 8,
      tileSize: 128,
      maxEdgeLen: 12,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 2,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1 / 32,
    };

    inProgress.current = true;
    navMeshWorker.current?.postMessage({ positions, indices, recastConfig }, [
      positions.buffer,
      indices.buffer,
    ]);
  }, 100);

  return (
    <>
      <Entity nav={nav} />
    </>
  );
};

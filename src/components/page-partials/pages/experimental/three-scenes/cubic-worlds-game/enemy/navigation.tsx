import { useFrame, useThree } from "@react-three/fiber";
import { Box3, Mesh, Vector3 } from "three";
import { useInterval } from "./common/hooks/useInterval";
import { Crowd, NavMeshQuery, RecastConfig } from "recast-navigation";
import { useNavigation } from "../store/useNavigationStore";
import { DebugDrawer, getPositionsAndIndices } from "@recast-navigation/three";
import { useEffect, useState } from "react";
import { useControls } from "leva";
import { usePageVisible } from "./common/hooks/use-page-visible";
import { DynamicTiledNavMesh } from "./nav/DynamicTiledNavMesh";
import { ensureRecast } from "./nav/recast-init";
import { traversableQuery } from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/enemy/entity-component-store";

const navMeshBounds = new Box3(
  new Vector3(-100, -10, -100),
  new Vector3(100, 0, 100)
);

const cellSize = 0.15;
const cellHeight = 0.1;

const recastConfig: Partial<RecastConfig> = {
  tileSize: 128,
  cs: cellSize,
  ch: cellHeight,
  walkableRadius: 0.8 / cellSize,
  walkableClimb: 1.5 / cellHeight,
  walkableHeight: 3 / cellHeight,
};

export const getTraversableMeshes = () => {
  const traversable = traversableQuery.entities.map((e) => e.three);

  const traversableMeshes = new Set<Mesh>();

  for (const obj of traversable) {
    obj?.traverse((child) => {
      if (child instanceof Mesh) {
        traversableMeshes.add(child);
      }
    });
  }

  return Array.from(traversableMeshes);
};

const getTraversablePositionsAndIndices = (): [
  positions: Float32Array,
  indices: Uint32Array
] => {
  const traversableMeshes = getTraversableMeshes();
  return getPositionsAndIndices(traversableMeshes);
};

const NavMeshDebug = () => {
  const dynamicTiledNavMesh = useNavigation((s) => s.dynamicTiledNavMesh);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (!dynamicTiledNavMesh) return;
    console.log("update dynaic", dynamicTiledNavMesh);
    const debugDrawer = new DebugDrawer();
    debugDrawer.drawNavMesh(dynamicTiledNavMesh.navMesh);
    scene.add(debugDrawer);

    const unsubOnNavMeshUpdate = dynamicTiledNavMesh.onNavMeshUpdate.add(() => {
      debugDrawer.reset();
      debugDrawer.drawNavMesh(dynamicTiledNavMesh.navMesh);
    });

    return () => {
      unsubOnNavMeshUpdate();
      scene.remove(debugDrawer);
      debugDrawer.dispose();
    };
  }, [dynamicTiledNavMesh]);

  return null;
};

export const Navigation = () => {
  const pageVisible = usePageVisible();

  const { boundsDebug, navMeshDebug } = useControls("navigation", {
    boundsDebug: false,
    navMeshDebug: true,
  });

  const [navMeshWorkers, setWorkers] = useState<number | null>(null);

  // 1) Визначаємо воркери один раз
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
      setWorkers(Math.max(1, navigator.hardwareConcurrency - 1));
    } else {
      setWorkers(3);
    }
  }, []);

  const [dynamicTiledNavMesh, setDynamicTiledNavMesh] =
    useState<DynamicTiledNavMesh>();

  useEffect(() => {
    if (navMeshWorkers == null) return;
    let dtm: DynamicTiledNavMesh | undefined;
    let navMeshQuery: NavMeshQuery | undefined;
    let crowd: Crowd | undefined;

    (async () => {
      if (typeof window === "undefined") return; // SSR guard
      await ensureRecast(); // <<< обов’язково!

      dtm = new DynamicTiledNavMesh({
        navMeshBounds,
        recastConfig,
        workers: navMeshWorkers,
      });

      navMeshQuery = new NavMeshQuery(dtm.navMesh);
      crowd = new Crowd(dtm.navMesh, { maxAgents: 50, maxAgentRadius: 0.5 });
      setDynamicTiledNavMesh(dtm);
      useNavigation.setState({
        dynamicTiledNavMesh: dtm,
        navMesh: dtm.navMesh,
        navMeshQuery,
        crowd,
      });
    })();

    return () => {
      useNavigation.setState({
        dynamicTiledNavMesh: undefined,
        navMesh: undefined,
        navMeshQuery: undefined,
        crowd: undefined,
      });

      dtm?.destroy();
      navMeshQuery?.destroy();
      crowd?.destroy();
    };
  }, [navMeshWorkers]);

  useEffect(() => {
    const unsubTraversableQueryAdd = traversableQuery.onEntityAdded.add(
      (entity) => {
        const bounds = new Box3();
        const meshes: Mesh[] = [];

        entity.three.traverse((child) => {
          if (child instanceof Mesh) {
            meshes.push(child);
            bounds.expandByObject(child);
          }
        });
        const [positions, indices] = getTraversablePositionsAndIndices();
        if (dynamicTiledNavMesh) {
          const tiles = dynamicTiledNavMesh.getTilesForBounds(bounds);
          for (const tile of tiles) {
            dynamicTiledNavMesh.buildTile(positions, indices, tile);
          }
        }
      }
    );
    return () => {
      if (unsubTraversableQueryAdd) {
        unsubTraversableQueryAdd();
      }
    };
  }, [dynamicTiledNavMesh]);

  useEffect(() => {
    if (!dynamicTiledNavMesh) return;

    const id = requestAnimationFrame(() => {
      const [positions, indices] = getTraversablePositionsAndIndices();
      dynamicTiledNavMesh.buildAllTiles(positions, indices);
    });

    return () => cancelAnimationFrame(id);
  }, [dynamicTiledNavMesh]);

  /* rebuild tiles with active rigid bodies every 200ms */
  useInterval(() => {
    if (!dynamicTiledNavMesh) return;

    const [positions, indices] = getTraversablePositionsAndIndices();
    const tiles = new Map<string, [x: number, y: number]>();
    for (const entity of traversableQuery) {
      if (!entity.rigidBody) continue;
      // if (entity.rigidBody.isSleeping()) continue;
      if (entity.three) {
        const box3 = new Box3();
        box3.expandByObject(entity.three);

        const entityTiles = dynamicTiledNavMesh.getTilesForBounds(box3);

        for (const tile of entityTiles) {
          const key = `${tile[0]},${tile[1]}`;
          tiles.set(key, tile);
        }
      }
    }

    for (const [, tileCoords] of tiles) {
      dynamicTiledNavMesh.buildTile(positions, indices, tileCoords);
    }
  }, 200);

  useFrame((_, delta) => {
    const crowd = useNavigation.getState().crowd;
    if (!crowd || !pageVisible) return;

    crowd.update(1 / 60, Math.min(delta, 0.1));
  });

  return (
    <>
      {boundsDebug && <box3Helper args={[navMeshBounds]} />}
      {navMeshDebug && <NavMeshDebug />}
    </>
  );
};

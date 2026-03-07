import { getPositionsAndIndices } from "@recast-navigation/three";
import { useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { importNavMesh, NavMeshQuery } from "recast-navigation";
import { useNavMeshStore } from "./useNavMeshStore";
import type { SoloNavMeshConfig } from "@/workers/three/build-solo-nav-mesh.worker";

// Якщо воркер без окремого типу — можна описати config локально
const SOLO_CONFIG: SoloNavMeshConfig = {
  cs: 0.6,
  ch: 0.02,
  walkableSlopeAngle: 45,
  walkableHeight: 1.8,
  walkableClimb: 0.4,
  walkableRadius: 2,
};

function collectMeshesFromGroup(group: Group): Mesh[] {
  const meshes: Mesh[] = [];
  group.updateWorldMatrix(true, true);
  group.traverse((obj) => {
    if (obj instanceof Mesh && obj.geometry?.attributes?.position) {
      meshes.push(obj);
    }
  });
  return meshes;
}

type Props = { sourceRef: React.RefObject<Group | null> };

// Імпорт воркера (Vite)
import SoloNavMeshWorker from "@/workers/three/build-solo-nav-mesh.worker?worker";
import { ensureRecast } from "./recast-init";

export default function NavMeshBuilder({ sourceRef }: Props) {
  const setNavMesh = useNavMeshStore((s) => s.setNavMesh);
  const built = useRef(false);
  const workerRef = useRef<InstanceType<typeof SoloNavMeshWorker> | null>(null);

  useEffect(() => {
    if (built.current) return;

    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 25;
    const delayMs = 100;

    const tryBuild = async (): Promise<boolean> => {
      await ensureRecast();
      if (cancelled) return false;
      return new Promise((resolve) => {
        const group = sourceRef.current;
        if (!group) {
          resolve(false);
          return;
        }

        const meshes = collectMeshesFromGroup(group);
        if (meshes.length === 0) {
          resolve(false);
          return;
        }

        const [positions, indices] = getPositionsAndIndices(meshes);
        const worker = workerRef.current ?? new SoloNavMeshWorker();
        workerRef.current = worker;

        const onMessage = (
          e: MessageEvent<{ success: boolean; navMeshExport?: Uint8Array }>,
        ) => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          if (cancelled || built.current) {
            resolve(false);
            return;
          }
          if (!e.data.success || !e.data.navMeshExport) {
            resolve(false);
            return;
          }
          const { navMesh } = importNavMesh(e.data.navMeshExport);
          const query = new NavMeshQuery(navMesh);
          setNavMesh(navMesh, query);
          built.current = true;
          resolve(true);
        };

        const onError = () => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          resolve(false);
        };

        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
        worker.postMessage({ positions, indices, config: SOLO_CONFIG }, [
          positions.buffer,
          indices.buffer,
        ]);
      });
    };

    const schedule = () => {
      if (cancelled || built.current) return;
      attempt += 1;
      if (attempt > maxAttempts) return;

      requestAnimationFrame(() => {
        if (cancelled) return;
        tryBuild().then((ok) => {
          if (cancelled || built.current) return;
          if (!ok) setTimeout(schedule, delayMs);
        });
      });
    };

    const t = setTimeout(schedule, 50);

    return () => {
      cancelled = true;
      clearTimeout(t);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [sourceRef, setNavMesh]);

  return null;
}

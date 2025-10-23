// useNavMesh.ts
import { create } from "zustand";
import { InstancedMesh, Mesh } from "three";
import {
  init as recastInit,
  importNavMesh,
  NavMesh,
  NavMeshQuery,
} from "recast-navigation";
import WorkerCtor from "@/workers/three/build-solo-nav-mesh?worker";
import { buildPositionsAndIndices } from "./buildArray";

const recastReady = recastInit(); // достатньо запустити, нижче будемо await-ити

function nextFrame() {
  return new Promise<void>((r) => requestAnimationFrame(() => r()));
}

async function waitForStableMeshes(
  getMeshes: () => Mesh[] | InstancedMesh[],
  quietMs = 1000, // час без змін
  stableFrames = 2, // скільки кадрів підряд довжина НЕ змінюється
  maxWaitMs = 8000 // запобіжник
) {
  let lastLen = -1;
  let stable = 0;
  let lastChange = performance.now();
  const start = performance.now();

  // чекаємо, поки не буде тихо quietMs і стабільно N кадрів
  // + кожного разу перевіряємо, що всі меші справді «готові»
  while (true) {
    // захист від вічного очікування
    if (performance.now() - start > maxWaitMs) break;

    const meshes = getMeshes();
    const len = meshes.length;

    if (len !== lastLen) {
      lastLen = len;
      stable = 0;
      lastChange = performance.now();
    } else {
      stable++;
    }

    // всі мають position і ненульову кількість вершин
    const allReady =
      len > 0 &&
      meshes.every((m) => {
        const pos = m.geometry?.attributes?.position;
        return pos && pos.count > 0;
      });

    // оновлюємо матриці
    meshes.forEach((m) => m.updateWorldMatrix(true, true));

    const quietEnough = performance.now() - lastChange >= quietMs;

    if (allReady && quietEnough && stable >= stableFrames) break;

    await nextFrame();
  }
}

type BuildConfig = {
  cs: number;
  ch: number;
  walkableRadius: number;
  walkableHeight: number;
  walkableClimb: number;
  walkableSlopeAngle: number;
};
const defaultBuild: BuildConfig = {
  cs: 0.15,
  ch: 0.02,
  walkableRadius: 0.3,
  walkableHeight: 1.6,
  walkableClimb: 0.4,
  walkableSlopeAngle: 50,
};

interface NavState {
  meshes: Mesh[];
  addMesh: (m: Mesh) => void;
  removeMesh: (m: Mesh) => void;
  isNavMeshDebug: boolean;
  navMesh: NavMesh | null;
  query: NavMeshQuery | null;
  isBuilt: boolean;
  setIsNavMeshDebug: (status: boolean) => void;
  buildStable: () => Promise<void>;
}

export const useNav = create<NavState>((set, get) => ({
  meshes: [],
  isNavMeshDebug: true,
  addMesh: (m) =>
    set((s) => (s.meshes.includes(m) ? s : { meshes: [...s.meshes, m] })),
  removeMesh: (m) => set((s) => ({ meshes: s.meshes.filter((x) => x !== m) })),

  navMesh: null,
  query: null,
  isBuilt: false,
  setIsNavMeshDebug: (status) => {
    set(() => ({ isNavMeshDebug: status }));
  },

  buildStable: async () => {
    await recastReady;

    // 1) чекаємо стабільності
    await waitForStableMeshes(() => get().meshes);

    // 2) фінальна вибірка + перевірка
    const meshes = get().meshes.filter((m) => {
      const pos = m.geometry?.attributes?.position;
      return pos && pos.count > 0;
    });
    if (!meshes.length) return;
    console.log("meshse", meshes);
    // 3) знімаємо масиви
    const { positions, indices } = buildPositionsAndIndices(meshes);

    // 4) воркер
    const worker = new WorkerCtor();
    worker.postMessage({ positions, indices, config: defaultBuild }, [
      positions.buffer,
      indices.buffer,
    ]);

    worker.onmessage = (e) => {
      const navMeshExport = e.data;
      const { navMesh } = importNavMesh(navMeshExport);
      const query = new NavMeshQuery(navMesh);
      set({ navMesh, isBuilt: true, query });
    };
  },
}));

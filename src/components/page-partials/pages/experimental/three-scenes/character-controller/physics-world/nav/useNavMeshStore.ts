import { create } from "zustand";
import type { NavMesh, NavMeshQuery } from "recast-navigation";

interface NavMeshState {
  navMesh: NavMesh | null;
  query: NavMeshQuery | null;
  isNavMeshDebug: boolean;
  setNavMesh: (navMesh: NavMesh | null, query: NavMeshQuery | null) => void;
  setIsNavMeshDebug: (v: boolean) => void;
}

export const useNavMeshStore = create<NavMeshState>((set) => ({
  navMesh: null,
  query: null,
  isNavMeshDebug: true,
  setNavMesh: (navMesh, query) => set({ navMesh, query }),
  setIsNavMeshDebug: (v) => set({ isNavMeshDebug: v }),
}));

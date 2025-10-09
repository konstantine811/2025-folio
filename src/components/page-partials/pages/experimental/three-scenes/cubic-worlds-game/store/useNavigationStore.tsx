import { create } from "zustand";
import { DynamicTiledNavMesh } from "../enemy/nav/DynamicTiledNavMesh";
import { Crowd, NavMesh, NavMeshQuery } from "recast-navigation";

export type NavigationState = {
  dynamicTiledNavMesh?: DynamicTiledNavMesh;
  navMesh?: NavMesh;
  navMeshQuery?: NavMeshQuery;
  crowd?: Crowd;
};

export const useNavigation = create<NavigationState>(() => ({
  dynamicTiledNavMesh: undefined,
  navMesh: undefined,
  navMeshQuery: undefined,
  crowd: undefined,
}));

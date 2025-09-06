import { Object3D } from "three";
import { create } from "zustand";

interface DrawMeshState {
  targets: Object3D[];
  isDrawing: boolean;
}

const initialState: DrawMeshState = {
  targets: [],
  isDrawing: false,
};

interface DrawMeshActions {
  setTargets: (targets: Object3D) => void;
  setIsDrawing: (isDrawing: boolean) => void;
}

type DrawMeshStore = DrawMeshState & DrawMeshActions;

export const useDrawMeshStore = create<DrawMeshStore>()((set) => ({
  ...initialState,
  setTargets: (targets: Object3D) =>
    set((state) => ({ targets: [...state.targets, targets] })),
  setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),
}));

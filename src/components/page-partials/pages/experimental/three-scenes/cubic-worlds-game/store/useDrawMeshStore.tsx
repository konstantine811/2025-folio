import { Object3D } from "three";
import { create } from "zustand";

interface DrawMeshState {
  targets: Object3D[];
  isEditMode: boolean;
}

const initialState: DrawMeshState = {
  targets: [],
  isEditMode: false,
};

interface DrawMeshActions {
  setTargets: (targets: Object3D) => void;
  setIsEditMode: (isEditMode: boolean) => void;
}

type DrawMeshStore = DrawMeshState & DrawMeshActions;

export const useDrawMeshStore = create<DrawMeshStore>()((set) => ({
  ...initialState,
  setTargets: (targets: Object3D) =>
    set((state) => ({ targets: [...state.targets, targets] })),
  setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
}));

import { Object3D } from "three";
import { create } from "zustand";

interface EditModeState {
  targets: Object3D[];
  isEditMode: boolean;
  isPhysicsDebug: boolean;
  isDrawScatter: boolean;
}

const initialState: EditModeState = {
  targets: [],
  isEditMode: false,
  isPhysicsDebug: true,
  isDrawScatter: false,
};

interface EditModeActions {
  setTargets: (targets: Object3D) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => void;
  setIsDrawScatter: (isDrawScatter: boolean) => void;
}

type EditModeStore = EditModeState & EditModeActions;

export const useEditModeStore = create<EditModeStore>()((set) => ({
  ...initialState,
  setTargets: (targets: Object3D) =>
    set((state) => ({ targets: [...state.targets, targets] })),
  setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => set({ isPhysicsDebug }),
  setIsDrawScatter: (isDrawScatter: boolean) => set({ isDrawScatter }),
}));

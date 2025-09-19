import { TransformMode } from "@/config/three-world/transform.config";
import { Matrix4, Object3D } from "three";
import { create } from "zustand";
import {
  PainterModelConfig,
  ScatterModelDraw,
} from "../config/3d-model.config";

export enum StatusServer {
  start = "start",
  loaded = "loaded",
}

export interface ScatterData {
  matrix: Matrix4[][];
  model: ScatterModelDraw;
}
export interface ScatterObject {
  id: string;
  name: string;
  isEdit: boolean;
}
interface EditModeState {
  targets: Object3D[];
  isEditMode: boolean;
  isPhysicsDebug: boolean;
  isDrawScatter: boolean;
  isTransformEdit: boolean;
  scatters: ScatterObject[];
  idEditScatter: string | null;
  scatterData: ScatterData | null;
  statusServer: StatusServer;
  editTransformMode: TransformMode | null;
  scatterModelDraw: ScatterModelDraw;
}

const initialState: EditModeState = {
  targets: [],
  isEditMode: false,
  isPhysicsDebug: true,
  isDrawScatter: false,
  isTransformEdit: false,
  scatters: [],
  idEditScatter: null,
  scatterData: null,
  statusServer: StatusServer.loaded,
  editTransformMode: null,
  scatterModelDraw: PainterModelConfig[0],
};

interface EditModeActions {
  setTargets: (targets: Object3D) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => void;
  setIsDrawScatter: (isDrawScatter: boolean) => void;
  setIsTransformEdit: (isTransformEdit: boolean) => void;
  onAddScatters: (scatter: ScatterObject[]) => void;
  onRemoveScatters: (id: string) => void;
  setIdEditScatter: (id: string | null) => void;
  onSetNewScatter: (data: ScatterData | null) => void;
  setStatusServer: (status: StatusServer) => void;
  onRenameScatter: (id: string, newName: string) => void;
  setEditTransformMode: (mode: TransformMode | null) => void;
  setScatterModelDraw: (model: ScatterModelDraw) => void;
}

type EditModeStore = EditModeState & EditModeActions;

export const useEditModeStore = create<EditModeStore>()((set) => ({
  ...initialState,
  setTargets: (targets: Object3D) =>
    set((state) => ({ targets: [...state.targets, targets] })),
  setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => set({ isPhysicsDebug }),
  setIsDrawScatter: (isDrawScatter: boolean) => set({ isDrawScatter }),
  setIsTransformEdit: (isTransformEdit: boolean) => set({ isTransformEdit }),
  onAddScatters: (incoming: ScatterObject[]) =>
    set((state) => {
      const result: ScatterObject[] = [...state.scatters];
      const seen = new Set(state.scatters.map((s) => s.name)); // уже існуючі id

      for (const item of incoming) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          result.push(item);
        }
      }

      return { scatters: result };
    }),
  onRemoveScatters: (id: string) => {
    set((state) => ({
      scatters: state.scatters.filter((scatter) => scatter.id !== id),
    }));
  },
  setIdEditScatter: (id: string | null) => set({ idEditScatter: id }),
  onSetNewScatter: (data) => {
    if (!data) {
      set({ scatterData: null });
      return;
    }
    const { model: modelData, matrix } = data;
    set({ scatterData: { matrix, model: modelData } });
  },
  setStatusServer: (status: StatusServer) => set({ statusServer: status }),
  onRenameScatter: (id: string, newName: string) =>
    set((s) => ({
      scatters: s.scatters.map((x) =>
        x.id === id ? { ...x, name: newName } : x
      ),
    })),
  setEditTransformMode: (mode: TransformMode | null) =>
    set({ editTransformMode: mode }),
  setScatterModelDraw: (model: ScatterModelDraw) =>
    set({ scatterModelDraw: model }),
}));

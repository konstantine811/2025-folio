import { TransformMode } from "@/config/three-world/transform.config";
import { Matrix4, Object3D } from "three";
import { create } from "zustand";
import {
  PainterModelConfig,
  InstanceModelDraw,
} from "../config/3d-model.config";

export enum StatusServer {
  start = "start",
  loaded = "loaded",
}

export enum EditModeAction {
  drawScatter = "drawScatter",
  editScatter = "editScatter",
  addInstance = "addInstance",
  none = "none",
}

export interface InstanceData {
  matrix: Matrix4[][];
  model: InstanceModelDraw;
}
export interface InstanceObject {
  id: string;
  name: string;
  isEdit: boolean;
}
interface EditModeState {
  targets: Object3D[];
  isEditMode: boolean;
  isPhysicsDebug: boolean;
  instances: InstanceObject[];
  idEditInstance: string | null;
  instanceData: InstanceData | null;
  statusServer: StatusServer;
  editTransformMode: TransformMode | null;
  scatterModelDraw: InstanceModelDraw;
  instanceModelDraw: InstanceModelDraw;
  editModeAction: EditModeAction;
}

const initialState: EditModeState = {
  targets: [],
  isEditMode: false,
  isPhysicsDebug: false,
  instances: [],
  idEditInstance: null,
  instanceData: null,
  statusServer: StatusServer.loaded,
  editTransformMode: null,
  scatterModelDraw: PainterModelConfig[0],
  instanceModelDraw: PainterModelConfig[0],
  editModeAction: EditModeAction.none,
};

interface EditModeActions {
  setTargets: (targets: Object3D) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => void;
  onAddInstances: (instance: InstanceObject[]) => void;
  onRemoveInstnaces: (id: string) => void;
  setIdEditInstance: (id: string | null) => void;
  onSetNewInstance: (data: InstanceData | null) => void;
  setStatusServer: (status: StatusServer) => void;
  onRenameScatter: (id: string, newName: string) => void;
  setEditTransformMode: (mode: TransformMode | null) => void;
  setScatterModelDraw: (model: InstanceModelDraw) => void;
  setInstanceModelDraw: (model: InstanceModelDraw) => void;
  setEditModeAction: (action: EditModeAction) => void;
}

type EditModeStore = EditModeState & EditModeActions;

export const useEditModeStore = create<EditModeStore>()((set) => ({
  ...initialState,
  setTargets: (targets: Object3D) =>
    set((state) => ({ targets: [...state.targets, targets] })),
  setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => set({ isPhysicsDebug }),
  onAddInstances: (incoming: InstanceObject[]) =>
    set((state) => {
      const result: InstanceObject[] = [...state.instances];
      const seen = new Set(state.instances.map((s) => s.name)); // уже існуючі id

      for (const item of incoming) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          result.push(item);
        }
      }

      return { instances: result };
    }),
  onRemoveInstnaces: (id: string) => {
    set((state) => ({
      instances: state.instances.filter((instance) => instance.id !== id),
    }));
  },
  setIdEditInstance: (id: string | null) => set({ idEditInstance: id }),
  onSetNewInstance: (data) => {
    if (!data) {
      set({ instanceData: null });
      return;
    }
    const { model: modelData, matrix } = data;
    set({ instanceData: { matrix, model: modelData } });
  },
  setStatusServer: (status: StatusServer) => set({ statusServer: status }),
  onRenameScatter: (id: string, newName: string) =>
    set((s) => ({
      instances: s.instances.map((x) =>
        x.id === id ? { ...x, name: newName } : x
      ),
    })),
  setEditTransformMode: (mode: TransformMode | null) =>
    set({ editTransformMode: mode }),
  setScatterModelDraw: (model: InstanceModelDraw) =>
    set({ scatterModelDraw: model }),
  setEditModeAction: (action: EditModeAction) => {
    if (action !== EditModeAction.editScatter) {
      set({ idEditInstance: null });
    }
    set({ editModeAction: action });
  },
  setInstanceModelDraw: (model: InstanceModelDraw) =>
    set({ instanceModelDraw: model }),
}));

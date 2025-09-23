import { TransformMode } from "@/config/three-world/transform.config";
import { Matrix4, Object3D } from "three";
import { create } from "zustand";
import {
  PainterModelConfig,
  InstanceModelDraw,
  DispabledPhysics,
} from "../config/3d-model.config";
import {
  RigidBodyAutoCollider,
  RigidBodyTypeString,
} from "@react-three/rapier";

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

export interface PhysicsData {
  type: RigidBodyTypeString;
  colliders: RigidBodyAutoCollider;
  restitution: number;
  friction: number;
  mass: number;
  isPhysicsEnabled: boolean;
}

export interface InstanceData {
  matrix: Matrix4[][];
  model: InstanceModelDraw;
  physics?: PhysicsData;
}
export interface InstanceObject {
  id: string;
  name: string;
  isEdit: boolean;
  physicsData: PhysicsData;
}
interface EditModeState {
  uid: string | null;
  targets: Object3D[];
  isEditMode: boolean;
  isPhysicsDebug: boolean;
  instances: InstanceObject[];
  idEditInstance: string | null;
  editedPhysicsData: PhysicsData;
  instanceData: InstanceData | null;
  statusServer: StatusServer;
  editTransformMode: TransformMode | null;
  scatterModelDraw: InstanceModelDraw;
  instanceModelDraw: InstanceModelDraw;
  editModeAction: EditModeAction;
}

const initialState: EditModeState = {
  uid: null,
  targets: [],
  isEditMode: false,
  isPhysicsDebug: false,
  instances: [],
  idEditInstance: null,
  editedPhysicsData: DispabledPhysics,
  instanceData: null,
  statusServer: StatusServer.loaded,
  editTransformMode: null,
  scatterModelDraw: PainterModelConfig[0],
  instanceModelDraw: PainterModelConfig[0],
  editModeAction: EditModeAction.none,
};

interface EditModeActions {
  setPublicUid: (uid: string | null) => void;
  setTargets: (targets: Object3D) => void;
  deleteTargets: (name: string) => void;
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
  onSetNewPhysicsData: (data: PhysicsData) => void;
}

type EditModeStore = EditModeState & EditModeActions;

export const useEditModeStore = create<EditModeStore>()((set) => ({
  ...initialState,
  setTargets: (target: Object3D) =>
    set((state) => {
      // обираємо ключ: спершу name, інакше fallback на uuid
      const key = target.name || target.uuid;

      const exists = state.targets.some((t) => (t.name || t.uuid) === key);
      if (exists) return state; // нічого не міняємо — зайвих ререндерів не буде

      return { targets: [...state.targets, target] };
    }),
  deleteTargets: (name: string) =>
    set((state) => {
      return {
        targets: state.targets.filter((t) => t.name !== name),
      };
    }),
  setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
  setIsPhysicsDebug: (isPhysicsDebug: boolean) => set({ isPhysicsDebug }),
  onAddInstances: (incoming: InstanceObject[]) =>
    set((state) => {
      // Швидкий доступ за ключем name
      const byName = new Map<string, InstanceObject>();
      for (const inst of state.instances) byName.set(inst.name, inst);

      // Оновлюємо/додаємо з incoming (останнє значення перемагає)
      for (const item of incoming) {
        const prev = byName.get(item.name);
        byName.set(item.name, prev ? { ...prev, ...item } : item);
      }

      // Формуємо результат:
      // 1) у попередньому порядку — вже існуючі (але з оновленими значеннями),
      // 2) потім — нові, яких не було раніше, у порядку приходу.
      const existingOrder = state.instances.map((i) => i.name);
      const existingSet = new Set(existingOrder);

      const result: InstanceObject[] = [
        ...existingOrder.map((n) => byName.get(n)!),
        ...incoming
          .filter((i) => !existingSet.has(i.name))
          .map((i) => byName.get(i.name)!),
      ];

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
    const { model: modelData, matrix, physics } = data;
    set({ instanceData: { matrix, model: modelData, physics } });
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
  onSetNewPhysicsData: (data: PhysicsData) => {
    set({ editedPhysicsData: data });
  },
  setPublicUid: (uid: string | null) => set({ uid }),
}));

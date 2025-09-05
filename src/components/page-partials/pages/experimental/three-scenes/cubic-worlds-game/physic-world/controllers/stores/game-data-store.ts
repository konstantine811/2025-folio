import { RapierRigidBody } from "@react-three/rapier";
import {
  AnimationAction,
  AnimationMixer,
  Group,
  Mesh,
  Object3D,
  Object3DEventMap,
} from "three";
import { create } from "zustand";

interface ModelNodes {
  [name: string]: Object3D<Object3DEventMap>;
}

interface GameDataState {
  characterAnim: {
    group: Group;
    mixer: AnimationMixer;
    actions: Record<string, AnimationAction>;
  } | null;
  characterNodes: ModelNodes;
  groundMesh: Mesh | null;
  characterRigidBody: RapierRigidBody | null;
}

const initialState: GameDataState = {
  characterAnim: null,
  characterNodes: {},
  groundMesh: null,
  characterRigidBody: null,
};

interface GameDataActions {
  setCharacterAnim: (anim: GameDataState["characterAnim"]) => void;
  setCharacterNodes: (nodes: ModelNodes) => void;
  setCharacterGroundMesh: (mesh: Mesh) => void;
  setCharacterRigidBody: (body: RapierRigidBody) => void;
}

type GameDataStore = GameDataState & GameDataActions;

export const useGameDataStore = create<GameDataStore>()((set) => ({
  ...initialState,
  setCharacterAnim: (anim) => set({ characterAnim: anim }),
  setCharacterNodes: (nodes) =>
    set(() => ({
      characterNodes: nodes,
    })),
  setCharacterGroundMesh: (mesh: Mesh) => set({ groundMesh: mesh }),
  setCharacterRigidBody: (body: RapierRigidBody) =>
    set({ characterRigidBody: body }),
}));

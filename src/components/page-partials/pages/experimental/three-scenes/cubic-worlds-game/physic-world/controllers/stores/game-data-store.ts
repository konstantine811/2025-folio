import {
  AnimationAction,
  AnimationMixer,
  Group,
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
}

const initialState: GameDataState = {
  characterAnim: null,
  characterNodes: {},
};

interface GameDataActions {
  setCharacterAnim: (anim: GameDataState["characterAnim"]) => void;
  setCharacterNodes: (nodes: ModelNodes) => void;
}

type GameDataStore = GameDataState & GameDataActions;

export const useGameDataStore = create<GameDataStore>()((set) => ({
  ...initialState,
  setCharacterAnim: (anim) => set({ characterAnim: anim }),
  setCharacterNodes: (nodes) =>
    set(() => ({
      characterNodes: nodes,
    })),
}));

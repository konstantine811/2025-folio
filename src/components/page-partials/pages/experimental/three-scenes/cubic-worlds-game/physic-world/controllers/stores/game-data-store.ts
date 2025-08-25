import { AnimationAction, AnimationMixer, Group, Mesh } from "three";
import { create } from "zustand";

interface GameDataState {
  characterAnim: {
    group: Group;
    mixer: AnimationMixer;
    actions: Record<string, AnimationAction>;
  } | null;
  cubeMesh: Mesh | null;
}

const initialState: GameDataState = {
  characterAnim: null,
  cubeMesh: null,
};

interface GameDataActions {
  setCharacterAnim: (anim: GameDataState["characterAnim"]) => void;
  setCubeMesh: (mesh: GameDataState["cubeMesh"]) => void;
}

type GameDataStore = GameDataState & GameDataActions;

export const useGameDataStore = create<GameDataStore>()((set) => ({
  ...initialState,
  setCharacterAnim: (anim) => set({ characterAnim: anim }),
  setCubeMesh: (mesh) => set({ cubeMesh: mesh }),
}));

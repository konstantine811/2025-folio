// stores/useGameStore.ts
import { create } from "zustand";
import * as THREE from "three";
import { AnimationSet } from "../config/character.config";

export interface GameState {
  moveToPoint: THREE.Vector3 | null;
  curAnimation: AnimationSet[keyof AnimationSet] | null;
  animationSet: AnimationSet;
  currentPosition: { x: number; y: number; z: number };
  onGround?: boolean;
  grassMaterial: THREE.ShaderMaterial | null;
}

export const initialGameState: GameState = {
  moveToPoint: null,
  curAnimation: null,
  animationSet: {},
  currentPosition: { x: 0, y: 0, z: 0 },
  onGround: true,
  grassMaterial: null,
};

type GameActions = {
  initializeAnimationSet: (set: AnimationSet) => void;
  resetAnimation: () => void;

  idle: () => void;
  walk: () => void;
  run: () => void;
  jump: () => void;
  jumpIdle: () => void;
  jumpLand: () => void;
  fall: () => void;

  action1: () => void;
  action2: () => void;
  action3: () => void;
  action4: () => void;

  setMoveToPoint: (v: THREE.Vector3 | null) => void;
  onMove: (pos: { x: number; y: number; z: number }) => void;
  setOnGround: (v: boolean) => void;

  // (за бажанням) універсальні сетери:
  setStatePartial: (partial: Partial<GameState>) => void;
};

export type GameStore = GameState & GameActions;

// helper: дозволені переходи
const canChangeAnimation = (
  state: GameState,
  allowed: Array<string | undefined>
) => {
  const allow = allowed.filter(Boolean) as string[];
  return allow.includes(state.curAnimation || "");
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialGameState,

  initializeAnimationSet: (animSet) =>
    set((state) =>
      Object.keys(state.animationSet).length === 0
        ? { animationSet: animSet }
        : state
    ),

  resetAnimation: () =>
    set((state) => ({ curAnimation: state.animationSet.idle || null })),

  idle: () =>
    set((state) => {
      if (
        state.curAnimation === state.animationSet.jumpIdle &&
        state.animationSet.jumpLand
      ) {
        return { curAnimation: state.animationSet.jumpLand };
      } else if (
        state.curAnimation !== state.animationSet.action1 &&
        state.curAnimation !== state.animationSet.action2 &&
        state.curAnimation !== state.animationSet.action3 &&
        state.curAnimation !== state.animationSet.action4
      ) {
        return { curAnimation: state.animationSet.idle };
      }
      return {};
    }),

  walk: () =>
    set((state) => {
      if (
        state.animationSet.walk &&
        state.curAnimation !== state.animationSet.action4
      ) {
        return { curAnimation: state.animationSet.walk };
      }
      return {};
    }),

  run: () =>
    set((state) => {
      if (
        state.animationSet.run &&
        state.curAnimation !== state.animationSet.action4
      ) {
        return { curAnimation: state.animationSet.run };
      }
      return {};
    }),

  jump: () =>
    set((state) =>
      state.animationSet.jump ? { curAnimation: state.animationSet.jump } : {}
    ),

  jumpIdle: () =>
    set((state) =>
      state.animationSet.jumpIdle &&
      state.curAnimation === state.animationSet.jump
        ? { curAnimation: state.animationSet.jumpIdle }
        : {}
    ),

  jumpLand: () =>
    set((state) =>
      state.animationSet.jumpLand &&
      state.curAnimation === state.animationSet.jumpIdle
        ? { curAnimation: state.animationSet.jumpLand }
        : {}
    ),

  fall: () =>
    set((state) =>
      state.animationSet.fall ? { curAnimation: state.animationSet.fall } : {}
    ),

  action1: () =>
    set((state) =>
      state.animationSet.action1 &&
      state.curAnimation === state.animationSet.idle
        ? { curAnimation: state.animationSet.action1 }
        : {}
    ),

  action2: () =>
    set((state) =>
      state.animationSet.action2 &&
      state.curAnimation === state.animationSet.idle
        ? { curAnimation: state.animationSet.action2 }
        : {}
    ),

  action3: () =>
    set((state) =>
      state.animationSet.action3 &&
      state.curAnimation === state.animationSet.idle
        ? { curAnimation: state.animationSet.action3 }
        : {}
    ),

  action4: () =>
    set((state) =>
      state.animationSet.action4 &&
      canChangeAnimation(state, [
        state.animationSet.idle,
        state.animationSet.walk,
        state.animationSet.run,
      ])
        ? { curAnimation: state.animationSet.action4 }
        : {}
    ),

  setMoveToPoint: (v) => set({ moveToPoint: v }),
  onMove: (pos) => set({ currentPosition: pos }),
  setOnGround: (v) => set({ onGround: v }),

  setStatePartial: (partial) => set((state) => ({ ...state, ...partial })),
}));

// зручні селектори (опційно)
export const selectCurAnimation = (s: GameStore) => s.curAnimation;
export const selectAnimationSet = (s: GameStore) => s.animationSet;
export const selectPosition = (s: GameStore) => s.currentPosition;

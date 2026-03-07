import { create } from "zustand";

type Vec3 = { x: number; y: number; z: number };

interface PlayerPositionState {
  position: Vec3 | null;
  setPosition: (v: Vec3) => void;
}

export const usePlayerPositionStore = create<PlayerPositionState>((set) => ({
  position: null,
  setPosition: (v) => set({ position: v }),
}));

// src/store/useScrollStore.ts
import { create } from "zustand";

type ScrollState = {
  progress: number; // 0..1
  setProgress: (p: number) => void;
};

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: Math.max(0, Math.min(1, p)) }),
}));

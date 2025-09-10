import { create } from "zustand";

interface EditPainterState {
  spacing: number;
  density: number;
  radius: number;
  scale: number;
  randomness: number;
  rotationDeg: number;
  offset: number;
  seed: number;
}

const initialState: EditPainterState = {
  spacing: 0.15,
  density: 1,
  radius: 1,
  scale: 0.3,
  randomness: 0.8,
  rotationDeg: 29,
  offset: 0,
  seed: 0,
};

interface EditPainterActions {
  setSpacing: (spacing: number) => void;
  setDensity: (density: number) => void;
  setRadius: (radius: number) => void;
  setScale: (scale: number) => void;
  setRandomness: (randomness: number) => void;
  setRotationDeg: (rotationDeg: number) => void;
  setOffset: (offset: number) => void;
  setSeed: (seed: number) => void;
}

type EditPainterStore = EditPainterState & EditPainterActions;

export const useEditPainterStore = create<EditPainterStore>()((set) => ({
  ...initialState,
  setSpacing: (spacing) => set({ spacing }),
  setDensity: (density) => set({ density }),
  setRadius: (radius) => set({ radius }),
  setScale: (scale) => set({ scale }),
  setRandomness: (randomness) => set({ randomness }),
  setRotationDeg: (rotationDeg) => set({ rotationDeg }),
  setOffset: (offset) => set({ offset }),
  setSeed: (seed) => set({ seed }),
}));

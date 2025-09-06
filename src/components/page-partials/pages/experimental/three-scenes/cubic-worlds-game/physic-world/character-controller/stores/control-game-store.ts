import { create } from "zustand";

interface ControlState {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  jump: boolean;
  run: boolean;
  isCameraFlow: boolean;
}

const initialState: ControlState = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  jump: false,
  run: false,
  isCameraFlow: true,
};

interface ControlActions {
  setForward: (v: boolean) => void;
  setBackward: (v: boolean) => void;
  setLeftward: (v: boolean) => void;
  setRightward: (v: boolean) => void;
  setJump: (v: boolean) => void;
  setRun: (v: boolean) => void;
  setIsCameraFlow: (v: boolean) => void;
  setAll: (partial: Partial<ControlState>) => void;
  resetControls: () => void;
}

type ControlStore = ControlState & ControlActions;

export const useControlStore = create<ControlStore>()((set) => ({
  ...initialState,

  setForward: (v) => set({ forward: v }),
  setBackward: (v) => set({ backward: v }),
  setLeftward: (v) => set({ leftward: v }),
  setRightward: (v) => set({ rightward: v }),
  setJump: (v) => set({ jump: v }),
  setRun: (v) => set({ run: v }),
  setIsCameraFlow: (v) => set({ isCameraFlow: v }),
  setAll: (partial) => set(partial),
  resetControls: () => set(() => ({ ...initialState })),
}));

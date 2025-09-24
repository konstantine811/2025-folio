import { create } from "zustand";

interface PauseState {
  isPaused: boolean;
}

const initialState: PauseState = {
  isPaused: false,
};

interface PauseActions {
  setIsPaused: (isPaused: boolean) => void;
}

type PauseStore = PauseState & PauseActions;

export const usePauseStore = create<PauseStore>()((set) => ({
  ...initialState,
  setIsPaused: (isPaused) => set({ isPaused }),
}));

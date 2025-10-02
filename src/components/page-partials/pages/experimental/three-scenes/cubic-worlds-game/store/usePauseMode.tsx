import { create } from "zustand";

interface PauseState {
  isPaused: boolean;
  isGameStarted?: boolean;
}

const initialState: PauseState = {
  isPaused: false,
  isGameStarted: false,
};

interface PauseActions {
  setIsPaused: (isPaused: boolean) => void;
  setIsGameStarted: (isGameStarted: boolean) => void;
}

type PauseStore = PauseState & PauseActions;

export const usePauseStore = create<PauseStore>()((set) => ({
  ...initialState,
  setIsPaused: (isPaused) => set({ isPaused }),
  setIsGameStarted: (isGameStarted) => set({ isGameStarted }),
}));

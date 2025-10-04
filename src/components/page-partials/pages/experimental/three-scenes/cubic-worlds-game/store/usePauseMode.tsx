import { create } from "zustand";

interface PauseState {
  isPaused: boolean;
  isGameStarted?: boolean;
  isTouch?: boolean;
  isFolioZoneActive?: boolean;
}

const initialState: PauseState = {
  isPaused: false,
  isGameStarted: false,
  isTouch: false,
  isFolioZoneActive: false,
};

interface PauseActions {
  setIsPaused: (isPaused: boolean) => void;
  setIsGameStarted: (isGameStarted: boolean) => void;
  setIsTouch: (isTouch: boolean) => void;
  setIsFolioZoneActive: (isFolioZoneActive: boolean) => void;
}

type PauseStore = PauseState & PauseActions;

export const usePauseStore = create<PauseStore>()((set) => ({
  ...initialState,
  setIsPaused: (isPaused) => set({ isPaused }),
  setIsGameStarted: (isGameStarted) => set({ isGameStarted }),
  setIsTouch: (isTouch) => set({ isTouch }),
  setIsFolioZoneActive: (isFolioZoneActive) => set({ isFolioZoneActive }),
}));

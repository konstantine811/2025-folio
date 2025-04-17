import { create } from "zustand";

interface TransitionRouteState {
  isTransition: boolean;
  onIsTransition: (status: boolean) => void;
}

export const useTransitionStore = create<TransitionRouteState>((set) => ({
  isTransition: false,
  onIsTransition: (status) => {
    setTimeout(() => {
      set({ isTransition: status });
    });
  },
}));

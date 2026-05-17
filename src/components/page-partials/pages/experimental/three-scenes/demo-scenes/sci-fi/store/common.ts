import { create } from "zustand";

type CommonStatusState = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
};

export const useCommonStatusStore = create<CommonStatusState>((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
}));

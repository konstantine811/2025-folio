import { create } from "zustand";

interface HeaderSizeState {
  size: number;
  setHeaderSize: (size: number) => void;
}

export const useHeaderSizeStore = create<HeaderSizeState>((set) => ({
  size: 0,
  setHeaderSize: (size) => {
    set({ size });
  },
}));

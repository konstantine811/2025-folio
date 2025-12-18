import { create } from "zustand";

interface HeaderSizeState {
  size: number;
  setHeaderSize: (size: number) => void;
  footerSize: number;
  setFooterSize: (size: number) => void;
}

export const useHeaderSizeStore = create<HeaderSizeState>((set) => ({
  size: 0,
  setHeaderSize: (size) => {
    set({ size });
  },
  footerSize: 0,
  setFooterSize: (size) => {
    set({ footerSize: size });
  },
}));

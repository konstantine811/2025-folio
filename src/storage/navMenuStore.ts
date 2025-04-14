import { create } from "zustand";

interface NavMenuState {
  isOpen: boolean;
  setOpen: (status: boolean) => void;
}

export const useNavMenuStore = create<NavMenuState>((set) => ({
  isOpen: false,
  setOpen: (status) => set({ isOpen: status }),
}));

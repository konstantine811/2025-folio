import { BreakPoints } from "@/config/adaptive.config";
import { create } from "zustand";

type State = {
  screenWidth: number;
  setScreenWidth: (width: number) => void;
};

export const useWindowSizeStore = create<State>((set) => ({
  screenWidth:
    typeof window !== "undefined" ? window.innerWidth : BreakPoints.md,
  setScreenWidth: (width) => set({ screenWidth: width }),
}));

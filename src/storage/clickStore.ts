import { SoundTypeElement } from "@custom-types/sound";
import { switchPlaySound } from "@services/handleClickSound";
import { create } from "zustand";

interface ClickState {
  clickTypeElement: SoundTypeElement | null;
  setClick: (clickType: SoundTypeElement) => void;
}

export const useClickStore = create<ClickState>((set) => ({
  clickTypeElement: null,
  setClick: (clickType: SoundTypeElement) => {
    switchPlaySound(clickType);
    set({
      clickTypeElement: clickType,
    });
  },
}));

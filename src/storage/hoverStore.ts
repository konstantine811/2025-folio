import { SoundTypeElement } from "@custom-types/sound";
import { create } from "zustand";

interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface HoverState {
  isHovering: boolean;
  boundingBox: BoundingBox | null;
  hoverTypeElement: SoundTypeElement | null;
  isHoveringWrapper: boolean;
  setHoverType: (hoverType: SoundTypeElement) => void;
  setHover: (
    hovering: boolean,
    hoverType: SoundTypeElement,
    box?: BoundingBox
  ) => void;
  setHoverWrapper: (hovering: boolean) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  isHovering: false,
  boundingBox: null,
  hoverTypeElement: null,
  isHoveringWrapper: false,
  setHover: (hovering, hoverType, box) =>
    set({
      isHovering: hovering,
      hoverTypeElement: hoverType,
      boundingBox: box ?? null,
    }),
  setHoverWrapper: (hovering) => set({ isHoveringWrapper: hovering }),
  setHoverType: (hoverType) => set({ hoverTypeElement: hoverType }),
}));

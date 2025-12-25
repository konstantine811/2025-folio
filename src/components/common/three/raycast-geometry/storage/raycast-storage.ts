import { Texture } from "three";
import { create } from "zustand";

interface RaycastGeometryState {
  displacementTexture: Texture | null;
  setDisplacementTexture: (texture: Texture) => void;
}

export const useRaycastGeometryStore = create<RaycastGeometryState>((set) => ({
  displacementTexture: null,
  setDisplacementTexture: (texture: Texture) => {
    set({ displacementTexture: texture });
  },
}));

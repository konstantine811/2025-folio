import { Texture } from "three";
import { create } from "zustand";

interface ParticleState {
  displacementTexture: Texture | null;
  setDisplacementTexture: (texture: Texture) => void;
}

export const useParticleStore = create<ParticleState>((set) => ({
  displacementTexture: null,
  setDisplacementTexture: (texture: Texture) => {
    set({ displacementTexture: texture });
  },
}));

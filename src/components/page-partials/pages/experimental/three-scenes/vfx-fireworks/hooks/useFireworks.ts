import { Triplet } from "@/types/three/vfx-particles.model";
import { randFloat, randInt } from "three/src/math/MathUtils.js";
import { create } from "zustand";

interface FireworksState {
  fireworks: Array<{
    id: string;
    position: Triplet;
    velocity: Triplet;
    delay: number;
    color: string[];
  }>;
  addFirework: () => void;
}

const useFireworks = create<FireworksState>((set) => {
  return {
    fireworks: [],
    addFirework: () => {
      set((state) => {
        return {
          fireworks: [
            ...state.fireworks,
            {
              id: `${Date.now()}-${randInt(1, 100)}-${state.fireworks.length}`,
              position: [0, 0, 0],
              velocity: [randFloat(-8, 8), randFloat(5, 10), randFloat(-8, 8)],
              delay: randFloat(0.8, 2),
              color: ["skyblue", "pink"],
            },
          ],
        };
      });
    },
  };
});

export default useFireworks;

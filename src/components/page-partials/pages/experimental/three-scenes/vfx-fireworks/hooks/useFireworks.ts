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
    time: number;
  }>;
  addFirework: () => void;
}

const useFireworks = create<FireworksState>((set) => {
  return {
    fireworks: [],
    addFirework: () => {
      set((state) => {
        const date = Date.now();
        return {
          fireworks: [
            ...state.fireworks,
            {
              id: `${date}-${randInt(1, 100)}-${state.fireworks.length}`,
              position: [0, 0, 0],
              velocity: [randFloat(-8, 8), randFloat(5, 10), randFloat(-8, 8)],
              delay: randFloat(0.8, 2),
              color: ["skyblue", "pink"],
              time: date,
            },
          ],
        };
      });
      setTimeout(() => {
        set((state) => ({
          fireworks: state.fireworks.filter((f) => Date.now() - f.time < 4000), // Max delay of 2 seconds + Max lifetime of particles of 2 seconds
        }));
      }, 4000);
    },
  };
});

export default useFireworks;

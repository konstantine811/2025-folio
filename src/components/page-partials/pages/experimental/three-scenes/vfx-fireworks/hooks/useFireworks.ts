import { Triplet } from "@/types/three/vfx-particles.model";
import { randFloat, randInt } from "three/src/math/MathUtils.js";
import { create } from "zustand";

interface AddFireworkProps {
  theme: FireworkTheme;
}

export enum FireworkTheme {
  classic = "classic",
  love = "love",
  sea = "sea",
}

const themeColors = {
  [FireworkTheme.classic]: [
    ["skyblue", "pink"],
    ["orange", "yellow"],
    ["green", "teal"],
    ["mediumpurple", "indigo"],
    ["#ff9fed", "#e885ff", "#ff85b2", "#d69eff"],
  ],
  [FireworkTheme.love]: [
    ["red"],
    ["red", "fuchsia"],
    ["red", "pink"],
    ["pink"],
    ["fuchsia", "yellow"],
  ],
  [FireworkTheme.sea]: [
    ["skyblue", "white"],
    ["deepskyblue", "skyblue"],
    ["aquamarine", "mediumaquamarine"],
    ["#368bff"],
  ],
};

const SPAWN_OFFSET = 0.2;

const spawns = [
  [1.004, -0.001 + SPAWN_OFFSET, 3.284],
  [-2.122, -0.001 + SPAWN_OFFSET, 2.678],
  [-0.988, -0.001 + SPAWN_OFFSET, 3.287],
  [2.888, -0.001 + SPAWN_OFFSET, 1.875],
  [2.115, -0.001 + SPAWN_OFFSET, 2.684],
] as Triplet[];

interface FireworksState {
  fireworks: Array<{
    id: string;
    position: Triplet;
    velocity: Triplet;
    delay: number;
    color: string[];
    time: number;
  }>;
  addFirework: (firework: AddFireworkProps) => void;
}

const useFireworks = create<FireworksState>((set) => {
  return {
    fireworks: [],
    addFirework: (firework: AddFireworkProps) => {
      set((state) => {
        const date = Date.now();
        const colors = themeColors[firework.theme];
        return {
          fireworks: [
            ...state.fireworks,
            {
              id: `${date}-${randInt(1, 100)}-${state.fireworks.length}`,
              position: spawns[randInt(0, spawns.length - 1)],
              velocity: [randFloat(-8, 8), randFloat(5, 10), randFloat(-8, 8)],
              delay: randFloat(0.8, 2),
              color: colors[randInt(0, colors.length - 1)],
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

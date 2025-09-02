import { Vector3 } from "three";
import {
  randFloat,
  randFloatSpread,
  randInt,
} from "three/src/math/MathUtils.js";
import { create } from "zustand";

export interface ISpell {
  id?: string;
  name: string;
  emoji: string;
  duration: number;
  colors: string[];
  time: number;
  position: Vector3;
}

export enum GameStatus {
  idle = "idle",
  playing = "playing",
  gameover = "gameover",
}

export interface IOrk {
  id: string;
  health: number;
  position: Vector3;
  speed: number;
  animation: string;
  lastAttack: number;
  lockedUntil?: number;
}

const generateOrc = (idx: number) => ({
  id: `orc-${idx}`, // Unique ID
  health: 100,
  position: new Vector3(randFloatSpread(-2), 0, randFloat(-15, -20)), // Randomized position
  speed: randFloat(1, 3),
  animation: "CharacterArmature|Walk",
  lastAttack: 0,
});

export const spells: ISpell[] = [
  {
    name: "void",
    emoji: "🪄",
    duration: 1000,
    colors: ["#d1beff", "white"],
    time: 0,
    position: new Vector3(0, 0, 0),
  },
  {
    name: "ice",
    emoji: "❄️",
    duration: 500,
    colors: ["skyblue", "white"],
    time: 0,
    position: new Vector3(0, 0, 0),
  },
  {
    name: "fire",
    emoji: "🔥",
    duration: 500,
    colors: ["orange", "red"],
    time: 0,
    position: new Vector3(0, 0, 0),
  },
  {
    name: "lightning",
    emoji: "⚡️",
    duration: 500,
    colors: ["yellow", "white"],
    time: 0,
    position: new Vector3(0, 0, 0),
  },
];

interface MagicState {
  spell: ISpell;
  spells: ISpell[];
  setSpell: (spell: ISpell) => void;
  addSpell: (spell: ISpell) => void;
  gameStatus: GameStatus;
  kills: number;
  health: number;
  orcs: IOrk[];
  lastSpawn: number;
  update: (delta: number) => void;
  start: () => void;
  isCasting: boolean;
}

let castingTimeout: NodeJS.Timeout | null = null;

export const useMagicStore = create<MagicState>((set, get) => ({
  gameStatus: GameStatus.idle,
  kills: 0,
  health: 100,
  orcs: [],
  lastSpawn: 0,
  spell: spells[0],
  spells: [],
  isCasting: false,
  setSpell: (spell: ISpell) => {
    set(() => ({
      spell,
    }));
  },
  addSpell: (spell: ISpell) => {
    const now = Date.now();
    set((state) => {
      return {
        isCasting: true,
        spells: [
          ...state.spells,
          {
            ...spell,
            id: `${now}-${randInt(0, 100)}-${state.spells.length}`,
            time: now,
          },
        ],
      };
    });

    // Handle collision with orcs
    setTimeout(() => {
      get().orcs.forEach((orc) => {
        if (orc.position.distanceTo(spell.position) < 1 && orc.health > 0) {
          orc.health -= 40;
          orc.animation = "CharacterArmature|HitReact";
          orc.lockedUntil = Date.now() + 800;
          if (orc.health <= 0) {
            set((state) => ({
              kills: state.kills + 1,
            }));
            orc.animation = "CharacterArmature|Death";
            orc.health = 0;
            setTimeout(() => {
              orc.position.z = randFloat(-10, -20);
              orc.health = 100;
              orc.animation = "CharacterArmature|Walk";
            }, 1000);
          }
        }
      });
    }, spell.duration);

    setTimeout(() => {
      set((state) => ({
        spells: state.spells.filter((spell) => now - spell.time < 4000),
      }));
    }, spell.duration + 4000);

    // Stop casting

    if (castingTimeout) {
      clearTimeout(castingTimeout);
    }
    castingTimeout = setTimeout(() => {
      set(() => ({
        isCasting: false,
      }));
    }, spell.duration);
  },
  start: () => {
    set(() => ({
      orcs: [],
      gameStatus: GameStatus.playing,
      health: 100,
      kills: 0,
    }));
  },
  update: (delta: number) => {
    if (get().gameStatus !== GameStatus.playing) return;

    if (get().health <= 0) {
      set(() => ({
        gameStatus: GameStatus.gameover,
        orcs: [],
      }));
    }
    if (get().lastSpawn <= Date.now() - 5000 && get().orcs.length < 50) {
      set((state) => ({
        orcs: [...state.orcs, generateOrc(state.orcs.length)],
        lastSpawn: Date.now(),
      }));
    }

    get().orcs.forEach((orc) => {
      if (orc.health <= 0) return;
      const lockedUntil = orc.lockedUntil || 0;
      if (lockedUntil > Date.now()) {
        return;
      } else {
        orc.animation = "CharacterArmature|Walk";
      }
      if (orc.position.z < 4) {
        orc.position.z += delta * orc.speed;
        orc.lastAttack = Date.now(); // Hack to prevent attacking as soon as they reach the wizard
      } else {
        orc.animation = "CharacterArmature|Weapon";
        if (orc.lastAttack < Date.now() - 1000) {
          orc.lastAttack = Date.now();
          set((state) => ({
            health: state.health - 10,
          }));
        }
      }
    });
  },
}));

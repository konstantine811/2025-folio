import { create } from "zustand";

interface WorldState {
  lootBreakBoxEntity: {
    [key: string]: {
      helth: number;
    };
  };
}

const initialState: WorldState = {
  lootBreakBoxEntity: {},
};

interface WorldActions {
  addLootBox: (id: string) => void;
  boxTakeDamage: (id: string, damage: number) => void;
}

type WorldStore = WorldState & WorldActions;

export const useWorldStore = create<WorldStore>()((set) => ({
  ...initialState,
  addLootBox: (id) =>
    set((state) => ({
      lootBreakBoxEntity: {
        ...state.lootBreakBoxEntity,
        [id]: { helth: 100 },
      },
    })),
  boxTakeDamage: (id, damage) =>
    set((state) => {
      const prev = state.lootBreakBoxEntity[id];
      if (!prev) return state; // або ініціалізуй
      const nextHealth = Math.max(0, prev.helth - damage);
      return {
        lootBreakBoxEntity: {
          ...state.lootBreakBoxEntity, // нове посилання на мапу
          [id]: { ...prev, helth: nextHealth }, // нове посилання на елемент
        },
      };
    }),
}));

import { create } from "zustand";

export type EnemyCombatStatus = {
  /** наприклад: у зоні меча, під cooldown після хіту */
  inMeleeRange?: boolean;
  lastHitAt?: number;
  hp?: number;
  maxHp?: number;
};

type CombatStatusState = {
  isPlayerAttacking: boolean;
  /** потім: по id ворога */
  enemies: Record<string, EnemyCombatStatus>;
};

type CombatStatusActions = {
  setPlayerAttacking: (v: boolean) => void;
  setEnemyStatus: (id: string, patch: Partial<EnemyCombatStatus>) => void;
  resetEnemy: (id: string) => void;
  applyDamageToEnemy: (id: string, damage: number) => void;
};

export const useCombatStatusStore = create<
  CombatStatusState & CombatStatusActions
>((set) => ({
  isPlayerAttacking: false,
  enemies: {},

  setPlayerAttacking: (v) => set({ isPlayerAttacking: v }),

  setEnemyStatus: (id, patch) =>
    set((s) => ({
      enemies: {
        ...s.enemies,
        [id]: { ...s.enemies[id], ...patch },
      },
    })),

  resetEnemy: (id) =>
    set((s) => {
      const next = { ...s.enemies };
      delete next[id];
      return { enemies: next };
    }),
  applyDamageToEnemy: (id, damage) =>
    set((s) => {
      const cur = s.enemies[id];
      if (!cur) return s;
      const maxHp = cur.maxHp ?? 100;
      const currentHp = cur.hp ?? maxHp;
      const nextHp = Math.max(0, currentHp - Math.max(0, damage));
      return {
        enemies: {
          ...s.enemies,
          [id]: {
            ...cur,
            maxHp,
            hp: nextHp,
            lastHitAt: performance.now(),
          },
        },
      };
    }),
}));

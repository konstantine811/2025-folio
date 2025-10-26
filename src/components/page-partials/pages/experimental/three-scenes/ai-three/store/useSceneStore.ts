// store/useSceneStore.ts
import { create } from "zustand";
import { SceneObject, SceneObjectFromServer } from "../types/object.model";

interface SceneState {
  objects: SceneObject[];

  // додати одразу пачку об'єктів з бекенду
  addObjectsFromServer: (newOnes: SceneObjectFromServer[]) => void;

  // опційно: очистити всю сцену
  clear: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  objects: [],

  addObjectsFromServer: (newOnes) =>
    set((state) => {
      const mapped: SceneObject[] = newOnes.map((obj) => ({
        ...obj,
        id: crypto.randomUUID(), // стабільний ключ у React-картах
      }));

      return {
        objects: [...state.objects, ...mapped],
      };
    }),

  clear: () => set({ objects: [] }),
}));

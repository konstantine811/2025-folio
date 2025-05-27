import { ItemTask } from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";
import { create } from "zustand";

interface TaskManagerState {
  playingTask: ItemTask | null;
  startedAt: number | null;
  setPlayingTask: (task: ItemTask | null) => void;
  stopPlayingTask: () => void;
  updateTaskTime: (taskId: UniqueIdentifier, timeDone: number) => void;
  updatedTask: {
    id: UniqueIdentifier;
    timeDone: number;
  } | null;
}

export const useTaskManagerStore = create<TaskManagerState>((set, get) => ({
  playingTask: null,
  startedAt: null,
  updatedTask: null,
  setPlayingTask: (task) => {
    const now = Date.now();

    // Зупини попередню задачу
    const prev = get().playingTask;
    const startedAt = get().startedAt;

    if (prev && startedAt) {
      const elapsed = Math.floor((now - startedAt) / 1000);
      set(() => ({
        playingTask: task,
        startedAt: now,
      }));

      if (prev.id !== task?.id) {
        const state = get();
        // оновлюємо стару задачу
        state.updateTaskTime(prev.id, prev.timeDone + elapsed);
      }
    } else {
      set({ playingTask: task, startedAt: now });
    }
  },

  stopPlayingTask: () => {
    const now = Date.now();
    const playing = get().playingTask;
    const startedAt = get().startedAt;

    if (playing && startedAt) {
      const elapsed = Math.floor((now - startedAt) / 1000);
      get().updateTaskTime(playing.id, playing.timeDone + elapsed);
    }

    set({ playingTask: null, startedAt: null });
  },

  updateTaskTime: (taskId, newTimeDone) => {
    set(() => ({
      updatedTask: { id: taskId, timeDone: newTimeDone },
    }));
  },
}));

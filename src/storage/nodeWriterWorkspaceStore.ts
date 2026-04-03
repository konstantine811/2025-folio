import type {
  Project,
  WorkspaceFolder,
} from "@/components/page-partials/pages/node-writer/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Якщо кеш новіший за це вікно — не викликаємо Firestore при вході.
 * Локальні зміни оновлюють кеш через putWorkspace (debounce у Main).
 */
export const NODE_WRITER_WORKSPACE_STALE_MS = 8 * 60 * 1000;

type CacheEntry = {
  folders: WorkspaceFolder[];
  projects: Project[];
  cachedAt: number;
};

type NodeWriterWorkspaceState = {
  byUid: Record<string, CacheEntry>;
  putWorkspace: (
    uid: string,
    folders: WorkspaceFolder[],
    projects: Project[],
  ) => void;
  getWorkspace: (uid: string) => CacheEntry | undefined;
  isWorkspaceFresh: (uid: string) => boolean;
};

export const useNodeWriterWorkspaceStore = create<NodeWriterWorkspaceState>()(
  persist(
    (set, get) => ({
      byUid: {},
      putWorkspace: (uid, folders, projects) =>
        set((s) => ({
          byUid: {
            ...s.byUid,
            [uid]: { folders, projects, cachedAt: Date.now() },
          },
        })),
      getWorkspace: (uid) => get().byUid[uid],
      isWorkspaceFresh: (uid) => {
        const e = get().byUid[uid];
        if (!e) return false;
        return Date.now() - e.cachedAt < NODE_WRITER_WORKSPACE_STALE_MS;
      },
    }),
    {
      name: "nw-workspace-cache-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ byUid: s.byUid }),
    },
  ),
);

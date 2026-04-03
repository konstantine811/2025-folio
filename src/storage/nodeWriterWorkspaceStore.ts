import type {
  Project,
  WorkspaceFolder,
} from "@/components/page-partials/pages/node-writer/types/types";
import { toPersistableNodeWriterMediaUrl } from "@/services/firebase/node-writer-workspace";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * `blob:` / `data:` у localStorage не переживають перезавантаження.
 * HTTPS з Firebase Storage у кеші не зберігаємо (токен згорає) — лише `nw-storage:path`.
 */
export function stripEphemeralMediaFromProjects(projects: Project[]): Project[] {
  return projects.map((p) => ({
    ...p,
    canvasImages: (p.canvasImages ?? [])
      .filter(
        (i) =>
          i.url &&
          !i.url.startsWith("blob:") &&
          !i.url.startsWith("data:"),
      )
      .map((i) => ({
        ...i,
        url: toPersistableNodeWriterMediaUrl(i.url),
      })),
    nodes: p.nodes.map((n) => {
      const u = n.imageUrl;
      if (!u) return n;
      if (u.startsWith("blob:") || u.startsWith("data:")) {
        const { imageUrl: _removed, ...rest } = n;
        return rest as typeof n;
      }
      return { ...n, imageUrl: toPersistableNodeWriterMediaUrl(u) };
    }),
    images: (p.images ?? [])
      .filter(
        (a) =>
          a.url &&
          !a.url.startsWith("blob:") &&
          !a.url.startsWith("data:"),
      )
      .map((a) => ({
        ...a,
        url: toPersistableNodeWriterMediaUrl(a.url),
      })),
  }));
}

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

function mergePersistedWorkspace(
  persistedState: unknown,
  currentState: NodeWriterWorkspaceState,
): NodeWriterWorkspaceState {
  const merged = {
    ...currentState,
    ...(persistedState as Partial<NodeWriterWorkspaceState>),
  };
  if (!merged.byUid) return merged;
  const nextByUid: Record<string, CacheEntry> = { ...merged.byUid };
  for (const key of Object.keys(nextByUid)) {
    const e = nextByUid[key];
    if (e?.projects?.length) {
      nextByUid[key] = {
        ...e,
        projects: stripEphemeralMediaFromProjects(e.projects),
      };
    }
  }
  return { ...merged, byUid: nextByUid };
}

export const useNodeWriterWorkspaceStore = create<NodeWriterWorkspaceState>()(
  persist(
    (set, get) => ({
      byUid: {},
      putWorkspace: (uid, folders, projects) =>
        set((s) => ({
          byUid: {
            ...s.byUid,
            [uid]: {
              folders,
              projects: stripEphemeralMediaFromProjects(projects),
              cachedAt: Date.now(),
            },
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
      name: "nw-workspace-cache-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ byUid: s.byUid }),
      merge: mergePersistedWorkspace,
    },
  ),
);

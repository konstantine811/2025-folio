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
 * «Свіжість» кешу для підказок (наприклад, пріоритет фонового оновлення).
 * Раніше використовувалось, щоб зовсім не читати Firestore — це ламало синх між вкладками.
 */
export const NODE_WRITER_WORKSPACE_STALE_MS = 8 * 60 * 1000;

export const NW_WORKSPACE_STORAGE_KEY = "nw-workspace-cache-v2";

type CacheEntry = {
  folders: WorkspaceFolder[];
  projects: Project[];
  cachedAt: number;
};

/** Злиття списків проєктів за lastModified (новіша версія перемагає). */
export function mergeProjectsByLastModified(
  a: Project[],
  b: Project[],
): Project[] {
  const map = new Map<string, Project>();
  for (const p of a) map.set(p.id, p);
  for (const p of b) {
    const prev = map.get(p.id);
    if (!prev) {
      map.set(p.id, p);
      continue;
    }
    map.set(
      p.id,
      (prev.lastModified ?? 0) >= (p.lastModified ?? 0) ? prev : p,
    );
  }
  return [...map.values()];
}

function readPersistedEntryFromDisk(uid: string): CacheEntry | undefined {
  try {
    const raw = localStorage.getItem(NW_WORKSPACE_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as {
      state?: { byUid?: Record<string, CacheEntry> };
    };
    return parsed?.state?.byUid?.[uid];
  } catch {
    return undefined;
  }
}

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
      putWorkspace: (uid, folders, projects) => {
        const fromDisk = readPersistedEntryFromDisk(uid);
        const mergedProjects = mergeProjectsByLastModified(
          projects,
          fromDisk?.projects ?? [],
        );
        set((s) => ({
          byUid: {
            ...s.byUid,
            [uid]: {
              folders,
              projects: stripEphemeralMediaFromProjects(mergedProjects),
              cachedAt: Date.now(),
            },
          },
        }));
      },
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

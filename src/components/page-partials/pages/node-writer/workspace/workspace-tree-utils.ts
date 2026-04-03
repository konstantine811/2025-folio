import type { NodeModel } from "@minoru/react-dnd-treeview";
import type { Project, WorkspaceFolder } from "../types/types";

export const WORKSPACE_TREE_ROOT_ID = "root";

export type WorkspaceTreeMeta =
  | { kind: "folder"; folderId: string }
  | { kind: "project"; projectId: string };

export function folderNodeId(folderId: string): string {
  return `fol:${folderId}`;
}

export function projectNodeId(projectId: string): string {
  return `doc:${projectId}`;
}

export function parseFolderNodeId(nodeId: string): string | null {
  return nodeId.startsWith("fol:") ? nodeId.slice(4) : null;
}

export function parseProjectNodeId(nodeId: string): string | null {
  return nodeId.startsWith("doc:") ? nodeId.slice(4) : null;
}

/**
 * Після DnD бібліотека інколи дає `id`/`parent` різних типів або обрізає `data`.
 * Без цього sync не оновлює folderId / порядок (документ «не переїжджає»).
 */
export function normalizeWorkspaceTreeAfterDnD(
  tree: NodeModel<WorkspaceTreeMeta>[],
): NodeModel<WorkspaceTreeMeta>[] {
  return tree.map((n) => {
    const id = String(n.id);
    const parent = String(n.parent);
    let data = n.data;
    const looksFolder = data?.kind === "folder" && data.folderId;
    const looksProject = data?.kind === "project" && data.projectId;
    if (!looksFolder && !looksProject) {
      const fId = parseFolderNodeId(id);
      const pId = parseProjectNodeId(id);
      if (fId) {
        data = { kind: "folder", folderId: fId };
      } else if (pId) {
        data = { kind: "project", projectId: pId };
      }
    }
    return { ...n, id, parent, data: data ?? n.data };
  });
}

type ChildEntry =
  | { kind: "folder"; order: number; folder: WorkspaceFolder }
  | { kind: "project"; order: number; project: Project };

function mixedSiblingSort(a: ChildEntry, b: ChildEntry): number {
  const o = a.order - b.order;
  if (o !== 0) return o;
  if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
  const ta =
    a.kind === "folder" ? a.folder.title : a.project.title;
  const tb =
    b.kind === "folder" ? b.folder.title : b.project.title;
  return ta.localeCompare(tb, "uk");
}

/** Порядок на одному рівні: спільний індекс sortOrder / workspaceOrder серед папок і документів. */
export function buildWorkspaceTreeData(
  folders: WorkspaceFolder[],
  projects: Project[],
): NodeModel<WorkspaceTreeMeta>[] {
  const root = WORKSPACE_TREE_ROOT_ID;
  const byParent = new Map<string | null, { folders: WorkspaceFolder[]; projects: Project[] }>();

  const getBucket = (parentId: string | null) => {
    const key = parentId;
    if (!byParent.has(key)) {
      byParent.set(key, { folders: [], projects: [] });
    }
    return byParent.get(key)!;
  };

  for (const f of folders) {
    getBucket(f.parentId).folders.push(f);
  }
  for (const p of projects) {
    const parentKey = p.folderId ?? null;
    getBucket(parentKey).projects.push(p);
  }

  const nodes: NodeModel<WorkspaceTreeMeta>[] = [];

  const walk = (parentId: string | null) => {
    const bucket = byParent.get(parentId);
    if (!bucket) return;
    const { folders: fs, projects: ps } = bucket;
    const mixed: ChildEntry[] = [
      ...fs.map((folder) => ({
        kind: "folder" as const,
        order: folder.sortOrder ?? 0,
        folder,
      })),
      ...ps.map((project) => ({
        kind: "project" as const,
        order: project.workspaceOrder ?? 0,
        project,
      })),
    ].sort(mixedSiblingSort);

    const parentKey = parentId === null ? root : folderNodeId(parentId);

    for (const entry of mixed) {
      if (entry.kind === "folder") {
        const f = entry.folder;
        nodes.push({
          id: folderNodeId(f.id),
          parent: parentKey,
          text: f.title,
          droppable: true,
          data: { kind: "folder", folderId: f.id },
        });
        walk(f.id);
      } else {
        const p = entry.project;
        nodes.push({
          id: projectNodeId(p.id),
          parent: parentKey,
          text: p.title,
          droppable: false,
          data: { kind: "project", projectId: p.id },
        });
      }
    }
  };

  walk(null);
  return nodes;
}

/**
 * Перевірка після DnD: усі папки й документи на місці, батьки лише root або існуючі папки.
 * Інакше (кидок поза зоною, зламаний індекс) не синхронізуємо стан — нічого не «зникає».
 */
export function isValidWorkspaceTreeAfterDrop(
  newTree: NodeModel<WorkspaceTreeMeta>[],
  folders: WorkspaceFolder[],
  projects: Project[],
): boolean {
  const root = WORKSPACE_TREE_ROOT_ID;
  const expectedCount = folders.length + projects.length;
  if (newTree.length !== expectedCount) return false;

  const expectedNodeIds = new Set<string>([
    ...folders.map((f) => folderNodeId(f.id)),
    ...projects.map((p) => projectNodeId(p.id)),
  ]);
  const actualIds = new Set(newTree.map((n) => String(n.id)));
  if (actualIds.size !== expectedNodeIds.size) return false;
  for (const id of actualIds) {
    if (!expectedNodeIds.has(id)) return false;
  }

  const folderIds = new Set(folders.map((f) => f.id));
  const projectIds = new Set(projects.map((p) => p.id));
  const folderNodeIds = new Set(folders.map((f) => folderNodeId(f.id)));

  const seen = new Set<string>();
  for (const n of newTree) {
    const id = String(n.id);
    if (seen.has(id)) return false;
    seen.add(id);

    let meta = n.data;
    if (!meta || (meta.kind !== "folder" && meta.kind !== "project")) {
      const fId = parseFolderNodeId(id);
      const pId = parseProjectNodeId(id);
      if (fId && folderIds.has(fId)) {
        meta = { kind: "folder", folderId: fId };
      } else if (pId && projectIds.has(pId)) {
        meta = { kind: "project", projectId: pId };
      } else {
        return false;
      }
    }
    if (meta.kind === "folder") {
      if (!folderIds.has(meta.folderId)) return false;
      if (folderNodeId(meta.folderId) !== id) return false;
    } else {
      if (!projectIds.has(meta.projectId)) return false;
      if (projectNodeId(meta.projectId) !== id) return false;
    }

    const parent = String(n.parent);
    if (parent === String(root)) continue;
    if (!folderNodeIds.has(parent)) return false;
  }

  return true;
}

/** Оновлює parentId / folderId та порядок сусідів з плоского масиву дерева після drop. */
export function syncWorkspaceFromTree(
  tree: NodeModel<WorkspaceTreeMeta>[],
  folders: WorkspaceFolder[],
  projects: Project[],
): { folders: WorkspaceFolder[]; projects: Project[] } {
  const root = WORKSPACE_TREE_ROOT_ID;
  const folderById = new Map(folders.map((f) => [f.id, { ...f }]));
  const projectById = new Map(projects.map((p) => [p.id, { ...p }]));

  for (const node of tree) {
    const par = String(node.parent);
    const meta = node.data;
    if (!meta || (meta.kind !== "folder" && meta.kind !== "project")) continue;
    if (meta.kind === "folder") {
      const f = folderById.get(meta.folderId);
      if (f) {
        f.parentId =
          par === String(root)
            ? null
            : parseFolderNodeId(par) ?? f.parentId;
        f.title = node.text;
      }
    } else {
      const p = projectById.get(meta.projectId);
      if (p) {
        p.folderId =
          par === String(root)
            ? null
            : parseFolderNodeId(par) ?? p.folderId;
        p.title = node.text;
      }
    }
  }

  const parentIds = new Set<string>();
  parentIds.add(String(root));
  for (const n of tree) {
    if (n.data?.kind === "folder") parentIds.add(String(n.id));
  }

  for (const parentId of parentIds) {
    const children = tree.filter((n) => String(n.parent) === String(parentId));
    let i = 0;
    for (const node of children) {
      const meta = node.data;
      if (meta?.kind === "folder") {
        const f = folderById.get(meta.folderId);
        if (f) f.sortOrder = i++;
      } else if (meta?.kind === "project") {
        const p = projectById.get(meta.projectId);
        if (p) p.workspaceOrder = i++;
      }
    }
  }

  return {
    folders: Array.from(folderById.values()),
    projects: Array.from(projectById.values()),
  };
}

export function collectFolderSubtreeIds(
  folders: WorkspaceFolder[],
  rootFolderId: string,
): Set<string> {
  const ids = new Set<string>();
  const walk = (id: string) => {
    ids.add(id);
    for (const f of folders) {
      if (f.parentId === id) walk(f.id);
    }
  };
  walk(rootFolderId);
  return ids;
}

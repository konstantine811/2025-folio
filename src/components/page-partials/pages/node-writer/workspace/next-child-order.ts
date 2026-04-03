import type { Project, WorkspaceFolder } from "../types/types";

export function nextChildOrder(
  folders: WorkspaceFolder[],
  projects: Project[],
  parentId: string | null,
): number {
  let max = -1;
  for (const f of folders) {
    if (f.parentId === parentId) max = Math.max(max, f.sortOrder ?? 0);
  }
  for (const p of projects) {
    if ((p.folderId ?? null) === parentId) {
      max = Math.max(max, p.workspaceOrder ?? 0);
    }
  }
  return max + 1;
}

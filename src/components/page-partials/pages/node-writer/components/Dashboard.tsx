import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { NodeModel } from "@minoru/react-dnd-treeview";
import type { Project, WorkspaceFolder } from "../types/types";
import {
  WORKSPACE_TREE_ROOT_ID,
  buildWorkspaceTreeData,
  normalizeWorkspaceTreeAfterDnD,
  syncWorkspaceFromTree,
  type WorkspaceTreeMeta,
} from "../workspace/workspace-tree-utils";
import {
  ROW_CLICK_DELAY_MS,
  TREE_ROW_BASE_PAD,
  TREE_ROW_INDENT,
  loadDashboardTreeOpenIdsFromStorage,
  NativeFolderColorInput,
  saveDashboardTreeOpenIdsToStorage,
  WorkspaceTreeRow,
  useDeferredRowClick,
  useFolderTitleColorPicker,
} from "./workspace-tree";
import WorkspaceCloudPreloader from "./WorkspaceCloudPreloader";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const NESTED_LENIS_SCROLL_PROPS = {
  "data-lenis-prevent": true,
  "data-lenis-prevent-wheel": true,
  "data-lenis-prevent-touch": true,
} as const;

type DropPos = "before" | "inside" | "after";

interface DropInfo {
  overId: string;
  pos: DropPos;
}

/** DFS rebuild of flat tree array from a children map. */
function rebuildTreeDfs(
  childrenMap: Map<string, NodeModel<WorkspaceTreeMeta>[]>,
  parentId: string,
): NodeModel<WorkspaceTreeMeta>[] {
  const children = childrenMap.get(parentId) ?? [];
  return children.flatMap((node) => [
    node,
    ...rebuildTreeDfs(childrenMap, String(node.id)),
  ]);
}

interface DashboardProps {
  folders: WorkspaceFolder[];
  projects: Project[];
  /** Кнопки «Новий документ» / «Нова папка» у шапці. */
  allowWorkspaceCreate?: boolean;
  /** DnD у дереві (лише адмін). */
  allowTreeEdits?: boolean;
  /** Перейменування, видалення, колір папки (лише адмін). */
  allowAdminRowActions?: boolean;
  /** Дочірня папка та новий документ у рядку дерева. */
  allowCreateRowActions?: boolean;
  /** Поки тягнемо папки/документи з Firestore — зелена смуга в панелі дерева. */
  workspaceLoading?: boolean;
  onWorkspaceSync: (folders: WorkspaceFolder[], projects: Project[]) => void;
  onCreateDocumentInFolder: (folderId: string | null) => void;
  onAddRootFolder: () => void;
  onAddChildFolder: (parentFolderId: string) => void;
  onRenameFolder: (id: string, title: string) => void;
  onSetFolderTitleColor: (id: string, color: string | null) => void;
  onSetFolderPrivate: (id: string, isPrivate: boolean) => void;
  onDeleteFolder: (id: string) => void;
  onRenameProject: (id: string, title: string) => void;
  onDeleteProject: (id: string) => void;
  onProjectSelect: (project: Project) => void;
}

const Dashboard = ({
  folders,
  projects,
  allowWorkspaceCreate = true,
  allowTreeEdits = true,
  allowAdminRowActions = true,
  allowCreateRowActions = true,
  workspaceLoading = false,
  onWorkspaceSync,
  onCreateDocumentInFolder,
  onAddRootFolder,
  onAddChildFolder,
  onRenameFolder,
  onSetFolderTitleColor,
  onSetFolderPrivate,
  onDeleteFolder,
  onRenameProject,
  onDeleteProject,
  onProjectSelect,
}: DashboardProps) => {
  const hs = useHeaderSizeStore((s) => s.size);
  const treeData = useMemo(
    () => buildWorkspaceTreeData(folders, projects),
    [folders, projects],
  );
  const treeDataRef = useRef(treeData);
  treeDataRef.current = treeData;

  // ── open/close state ──────────────────────────────────────────
  const [openIds, setOpenIds] = useState<string[]>(() =>
    loadDashboardTreeOpenIdsFromStorage(),
  );
  const openIdSet = useMemo(() => new Set(openIds), [openIds]);

  const toggleTreeNode = useCallback((nodeId: NodeModel["id"]) => {
    const id = String(nodeId);
    setOpenIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((o) => o !== id)
        : [...prev, id];
      saveDashboardTreeOpenIdsToStorage(next);
      return next;
    });
  }, []);

  // ── Native HTML5 DnD ─────────────────────────────────────────
  /**
   * Ref замість state для синхронної перевірки "чи це наш drag"
   * всередині обробників dragover/drop (state — async).
   */
  const activeDragIdRef = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);

  const isDescendantOf = useCallback(
    (candidateId: string, ancestorId: string): boolean => {
      const byParent = new Map<string, string[]>();
      for (const n of treeDataRef.current) {
        const p = String(n.parent);
        const bucket = byParent.get(p) ?? [];
        bucket.push(String(n.id));
        byParent.set(p, bucket);
      }
      const stack = [...(byParent.get(ancestorId) ?? [])];
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (id === candidateId) return true;
        stack.push(...(byParent.get(id) ?? []));
      }
      return false;
    },
    [],
  );

  const applyDrop = useCallback(
    (activeId: string, info: DropInfo) => {
      console.log("[DnD] applyDrop →", { activeId, info });
      if (activeId === info.overId) { console.log("[DnD] SKIP: same node"); return; }
      const tree = treeDataRef.current;
      const dragNode = tree.find((n) => String(n.id) === activeId);
      if (!dragNode) { console.log("[DnD] SKIP: dragNode not found"); return; }

      const rootId = String(WORKSPACE_TREE_ROOT_ID);
      const isRootTarget = info.overId === rootId;
      const overNode = isRootTarget
        ? null
        : tree.find((n) => String(n.id) === info.overId);

      let newParentId: string;
      let insertBeforeId: string | null = null;

      if (isRootTarget || !overNode) {
        newParentId = rootId;
      } else if (info.pos === "inside" && overNode.data?.kind === "folder") {
        newParentId = info.overId;
      } else {
        newParentId = String(overNode.parent);
        const siblings = tree.filter(
          (n) => String(n.parent) === newParentId,
        );
        const idx = siblings.findIndex((n) => String(n.id) === info.overId);
        if (info.pos === "before") {
          insertBeforeId = info.overId;
        } else {
          insertBeforeId =
            idx >= 0 && idx + 1 < siblings.length
              ? String(siblings[idx + 1].id)
              : null;
        }
      }

      console.log("[DnD] newParentId:", newParentId, "insertBeforeId:", insertBeforeId);
      if (newParentId === activeId) { console.log("[DnD] SKIP: parent=self"); return; }
      if (newParentId !== rootId && isDescendantOf(newParentId, activeId)) {
        console.log("[DnD] SKIP: drop into own descendant"); return;
      }

      // Build children map (without dragged node)
      const without = tree.filter((n) => String(n.id) !== activeId);
      const moved: NodeModel<WorkspaceTreeMeta> = {
        ...dragNode,
        parent: newParentId,
      };

      const childrenMap = new Map<string, NodeModel<WorkspaceTreeMeta>[]>();
      for (const n of without) {
        const p = String(n.parent);
        if (!childrenMap.has(p)) childrenMap.set(p, []);
        childrenMap.get(p)!.push(n);
      }

      const newSiblings = [...(childrenMap.get(newParentId) ?? [])];
      if (insertBeforeId) {
        const idx = newSiblings.findIndex(
          (n) => String(n.id) === insertBeforeId,
        );
        if (idx >= 0) newSiblings.splice(idx, 0, moved);
        else newSiblings.push(moved);
      } else {
        newSiblings.push(moved);
      }
      childrenMap.set(newParentId, newSiblings);

      // Auto-open the target folder
      if (info.pos === "inside" && overNode?.data?.kind === "folder") {
        setOpenIds((prev) => {
          if (prev.includes(info.overId)) return prev;
          const next = [...prev, info.overId];
          saveDashboardTreeOpenIdsToStorage(next);
          return next;
        });
      }

      const newTree = rebuildTreeDfs(childrenMap, rootId);

      // isValidWorkspaceTreeAfterDrop порівнює з folders.length+projects.length,
      // але в базі можуть бути «orphan» вузли (батько видалений), які
      // buildWorkspaceTreeData не включає в дерево — тому підрахунок завжди не збігається.
      // Замість цього перевіряємо що rebuilt-tree містить рівно ті ж ID що й поточне дерево.
      const originalIdSet = new Set(treeDataRef.current.map((n) => String(n.id)));
      const newIdSet = new Set(newTree.map((n) => String(n.id)));
      if (originalIdSet.size !== newIdSet.size) {
        console.log("[DnD] SKIP: size mismatch", originalIdSet.size, "vs", newIdSet.size);
        return;
      }
      for (const id of newIdSet) {
        if (!originalIdSet.has(id)) {
          console.log("[DnD] SKIP: unknown id in new tree:", id);
          return;
        }
      }
      // Перевірка батьків: кожен non-root батько має бути папкою
      const normalized = normalizeWorkspaceTreeAfterDnD(newTree);
      for (const n of normalized) {
        const p = String(n.parent);
        if (p !== rootId && !p.startsWith("fol:")) {
          console.log("[DnD] SKIP: non-folder parent", { id: n.id, parent: p });
          return;
        }
      }

      console.log("[DnD] validation ✓, syncing...");
      const synced = syncWorkspaceFromTree(normalized, folders, projects);
      console.log("[DnD] onWorkspaceSync ✓", { folders: synced.folders.length, projects: synced.projects.length });
      onWorkspaceSync(synced.folders, synced.projects);
    },
    [folders, isDescendantOf, onWorkspaceSync, projects],
  );

  const onRowDragStart = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      console.log("[DnD] dragstart", { nodeId, target: (e.target as HTMLElement).tagName, currentTarget: (e.currentTarget as HTMLElement).className.slice(0, 60) });
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", nodeId);
      activeDragIdRef.current = nodeId;
      setTimeout(() => setDragId(nodeId), 0);
    },
    [],
  );

  const onRowDragOver = useCallback(
    (e: React.DragEvent, nodeId: string, isFolder: boolean) => {
      if (!activeDragIdRef.current) {
        console.log("[DnD] dragover SKIP — activeDragIdRef is null", { nodeId });
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      let pos: DropPos;
      if (isFolder) {
        pos = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
      } else {
        pos = ratio < 0.5 ? "before" : "after";
      }
      setDropInfo((prev) =>
        prev?.overId === nodeId && prev.pos === pos
          ? prev
          : { overId: nodeId, pos },
      );
      e.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const onRowDrop = useCallback(
    (e: React.DragEvent) => {
      const activeId = activeDragIdRef.current;
      console.log("[DnD] drop", { activeId, dropInfo, target: (e.target as HTMLElement).tagName });
      if (!activeId) return;
      e.preventDefault();
      e.stopPropagation();
      activeDragIdRef.current = null;
      const info = dropInfo;
      setDragId(null);
      setDropInfo(null);
      if (!info) return;
      applyDrop(activeId, info);
    },
    [applyDrop, dropInfo],
  );

  const onDragEnd = useCallback(() => {
    console.log("[DnD] dragend", { activeDragIdRef: activeDragIdRef.current });
    activeDragIdRef.current = null;
    setDragId(null);
    setDropInfo(null);
  }, []);

  // Drop на порожній зоні (нижче всіх рядків) — переміщує в корінь.
  const onRootDragOver = useCallback((e: React.DragEvent) => {
    if (!activeDragIdRef.current) return;
    e.preventDefault();
    setDropInfo({ overId: String(WORKSPACE_TREE_ROOT_ID), pos: "inside" });
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onRootDrop = useCallback(
    (e: React.DragEvent) => {
      const activeId = activeDragIdRef.current;
      if (!activeId) return;
      e.preventDefault();
      activeDragIdRef.current = null;
      setDragId(null);
      setDropInfo(null);
      applyDrop(activeId, {
        overId: String(WORKSPACE_TREE_ROOT_ID),
        pos: "inside",
      });
    },
    [applyDrop],
  );
  // ── end DnD ──────────────────────────────────────────────────

  const treeScrollRef = useRef<HTMLDivElement | null>(null);

  const [draftTitle, setDraftTitle] = useState<{
    nodeId: string;
    value: string;
  } | null>(null);

  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );
  const folderById = useMemo(
    () => new Map(folders.map((f) => [f.id, f])),
    [folders],
  );

  const { schedule, clearPending: clearPendingRowClick } =
    useDeferredRowClick(ROW_CLICK_DELAY_MS);

  const {
    paletteOpenForFolderId,
    setPaletteOpenForFolderId,
    nativePickFolderId,
    colorInputNonce,
    paletteAnchorRef,
    colorInputRef,
    openNativeFolderColorPicker,
    applyNativePickerColor,
  } = useFolderTitleColorPicker(onSetFolderTitleColor);

  const commitDraft = () => {
    if (!draftTitle) return;
    const { nodeId, value } = draftTitle;
    setDraftTitle(null);
    const trimmed = value.trim();
    if (!trimmed) return;
    if (nodeId.startsWith("fol:")) onRenameFolder(nodeId.slice(4), trimmed);
    else if (nodeId.startsWith("doc:"))
      onRenameProject(nodeId.slice(4), trimmed);
  };

  // Lenis: явно перехоплюємо wheel, щоб глобальний smooth scroll не їв події.
  useEffect(() => {
    const el = treeScrollRef.current;
    if (!el) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      event.stopPropagation();
      if (el.scrollHeight <= el.clientHeight + 1) return;
      el.scrollTop += event.deltaY;
      event.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const renderNodes = (
    parentId: string | number,
    depth: number,
  ): ReactNode[] => {
    return treeData
      .filter((node) => String(node.parent) === String(parentId))
      .flatMap((node) => {
        const nodeId = String(node.id);
        const isOpen = openIdSet.has(nodeId);
        const isFolder = node.data?.kind === "folder";
        const isDraggingThis = dragId === nodeId;
        const info = dropInfo?.overId === nodeId ? dropInfo : null;
        const indentPx = TREE_ROW_BASE_PAD + depth * TREE_ROW_INDENT;

        const row = (
          <div key={nodeId}>
            {info?.pos === "before" && (
              <div
                className="h-0.5 rounded-full bg-primary/70"
                style={{ marginLeft: indentPx, marginRight: 8 }}
                aria-hidden
              />
            )}
            <WorkspaceTreeRow
              node={node}
              depth={depth}
              isOpen={isOpen}
              onToggle={() => toggleTreeNode(node.id)}
              isDragging={isDraggingThis}
              isDropTarget={info?.pos === "inside"}
              isDraggable={allowTreeEdits}
              onRowDragStart={
                allowTreeEdits ? (e) => onRowDragStart(e, nodeId) : undefined
              }
              onRowDragOver={
                allowTreeEdits
                  ? (e) => onRowDragOver(e, nodeId, isFolder)
                  : undefined
              }
              onRowDrop={allowTreeEdits ? onRowDrop : undefined}
              onRowDragEnd={onDragEnd}
              useIconAsTouchDragHandle={false}
              allowAdminRowActions={allowAdminRowActions}
              allowCreateRowActions={allowCreateRowActions}
              folderById={folderById}
              projectById={projectById}
              draftTitle={draftTitle}
              setDraftTitle={setDraftTitle}
              commitDraft={commitDraft}
              clearPendingRowClick={clearPendingRowClick}
              schedulePrimaryAction={schedule}
              onProjectSelect={onProjectSelect}
              paletteOpenForFolderId={paletteOpenForFolderId}
              setPaletteOpenForFolderId={setPaletteOpenForFolderId}
              paletteAnchorRef={paletteAnchorRef}
              openNativeFolderColorPicker={openNativeFolderColorPicker}
              onSetFolderTitleColor={onSetFolderTitleColor}
              onSetFolderPrivate={onSetFolderPrivate}
              onAddChildFolder={onAddChildFolder}
              onCreateDocumentInFolder={onCreateDocumentInFolder}
              onDeleteFolder={onDeleteFolder}
              onDeleteProject={onDeleteProject}
            />
            {info?.pos === "after" && (
              <div
                className="h-0.5 rounded-full bg-primary/70"
                style={{ marginLeft: indentPx, marginRight: 8 }}
                aria-hidden
              />
            )}
          </div>
        );

        if (!isFolder || !isOpen) return [row];
        return [row, ...renderNodes(node.id, depth + 1)];
      });
  };

  const isEmpty = folders.length === 0 && projects.length === 0;

  return (
    <div
      className="box-border flex min-h-0 w-full flex-1 flex-col bg-background p-4"
      style={{ height: `calc(100dvh - ${hs}px)` }}
    >
      <NativeFolderColorInput
        colorInputNonce={colorInputNonce}
        inputRef={colorInputRef}
        defaultTitleColor={
          nativePickFolderId
            ? folderById.get(nativePickFolderId)?.titleColor
            : undefined
        }
        onPick={applyNativePickerColor}
      />

      <header className="mx-auto mb-8 flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div
              className="size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/60"
              aria-hidden
            />
            <span className="mono text-[10px] tracking-wide text-muted-foreground italic">
              Workspace · active sessions
            </span>
          </div>
          <h2 className="text-[7vw] font-black leading-none tracking-tighter text-foreground italic">
            Документи
          </h2>
        </div>
        {allowWorkspaceCreate ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onCreateDocumentInFolder(null)}
              className="flex items-center gap-2 bg-primary px-6 py-3 text-xs font-black tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              [ Новий документ ]
            </button>
            <button
              type="button"
              onClick={onAddRootFolder}
              className="border border-border/40 px-6 py-3 text-xs font-black tracking-wide text-foreground transition-colors hover:border-primary/50"
            >
              [ Нова папка ]
            </button>
          </div>
        ) : null}
      </header>

      <div
        ref={treeScrollRef}
        className="mx-auto min-h-0 w-full max-w-7xl flex-1 basis-0 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1rem)] [-webkit-overflow-scrolling:touch]"
        {...NESTED_LENIS_SCROLL_PROPS}
      >
        {isEmpty ? (
          workspaceLoading ? (
            <div
              className="flex min-h-[180px] flex-col rounded-xl border border-border/10 bg-card/40 animate-in fade-in duration-500 fill-mode-both"
              role="status"
              aria-live="polite"
              aria-busy="true"
              aria-label="Завантаження workspace"
            >
              <WorkspaceCloudPreloader />
              <div className="flex flex-1 items-center justify-center px-4 py-12">
                <p className="mono text-[10px] tracking-wide text-muted-foreground">
                  Завантаження з хмари…
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/10 bg-card/50 py-16 text-center">
              <p className="mono text-[10px] tracking-wide text-muted-foreground">
                {allowWorkspaceCreate
                  ? "Немає папок і документів. Створіть папку або документ."
                  : "Немає папок і документів."}
              </p>
            </div>
          )
        ) : (
          <div className="flex min-h-[180px] flex-col rounded-xl border border-border/10 bg-card/40">
            {workspaceLoading && (
              <div className="animate-in fade-in duration-500 fill-mode-both">
                <WorkspaceCloudPreloader />
              </div>
            )}
            {/* Головна зона рендерингу дерева */}
            <div
              className="min-h-0 flex-1 px-2 py-2"
              onDragOver={allowTreeEdits ? onRootDragOver : undefined}
              onDrop={allowTreeEdits ? onRootDrop : undefined}
            >
              {renderNodes(WORKSPACE_TREE_ROOT_ID, 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

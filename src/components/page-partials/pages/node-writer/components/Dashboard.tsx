import { useCallback, useMemo, useRef, useState } from "react";
import {
  Tree,
  getBackendOptions,
  MultiBackend,
  type DropOptions,
  type NodeModel,
} from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";
import type { Project, WorkspaceFolder } from "../types/types";
import {
  WORKSPACE_TREE_ROOT_ID,
  buildWorkspaceTreeData,
  isValidWorkspaceTreeAfterDrop,
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
  const treeData = useMemo(
    () => buildWorkspaceTreeData(folders, projects),
    [folders, projects],
  );

  /** Стабільний масив: @minoru/react-dnd-treeview скидає open state при зміні `initialOpen`. */
  const treeInitialOpenRef = useRef<string[] | null>(null);
  if (treeInitialOpenRef.current === null) {
    treeInitialOpenRef.current = loadDashboardTreeOpenIdsFromStorage();
  }

  const onTreeChangeOpen = useCallback((newOpenIds: (string | number)[]) => {
    saveDashboardTreeOpenIdsToStorage(newOpenIds);
  }, []);

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
    if (nodeId.startsWith("fol:")) {
      onRenameFolder(nodeId.slice(4), trimmed);
    } else if (nodeId.startsWith("doc:")) {
      onRenameProject(nodeId.slice(4), trimmed);
    }
  };

  const handleDrop = (
    newTree: NodeModel<WorkspaceTreeMeta>[],
    options: DropOptions<WorkspaceTreeMeta>,
  ) => {
    if (!options.dragSource) return;
    const normalized = normalizeWorkspaceTreeAfterDnD(newTree);
    if (!isValidWorkspaceTreeAfterDrop(normalized, folders, projects)) {
      return;
    }
    const synced = syncWorkspaceFromTree(normalized, folders, projects);
    onWorkspaceSync(synced.folders, synced.projects);
  };

  const isEmpty = folders.length === 0 && projects.length === 0;

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto bg-background p-4">
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

      <div className="mx-auto max-w-7xl">
        {isEmpty ? (
          workspaceLoading ? (
            <div
              className="flex min-h-[180px] flex-col overflow-hidden rounded-xl border border-border/10 bg-card/40 animate-in fade-in duration-500 fill-mode-both"
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
          <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <div className="flex min-h-[180px] flex-col overflow-hidden rounded-xl border border-border/10 bg-card/40">
              {workspaceLoading && (
                <div className="animate-in fade-in duration-500 fill-mode-both">
                  <WorkspaceCloudPreloader />
                </div>
              )}
              <Tree<WorkspaceTreeMeta>
                tree={treeData}
                rootId={WORKSPACE_TREE_ROOT_ID}
                sort={false}
                insertDroppableFirst={false}
                dropTargetOffset={4}
                initialOpen={treeInitialOpenRef.current}
                onChangeOpen={onTreeChangeOpen}
                canDrag={allowTreeEdits ? () => true : () => false}
                canDrop={
                  allowTreeEdits
                    ? (_, { dropTargetId }) => {
                        if (dropTargetId === WORKSPACE_TREE_ROOT_ID)
                          return true;
                        const target = treeData.find(
                          (n) => n.id === dropTargetId,
                        );
                        return !!target?.droppable;
                      }
                    : () => false
                }
                onDrop={handleDrop}
                placeholderRender={(_, { depth }) => (
                  <div
                    className="rounded-full bg-primary/45"
                    style={{
                      marginLeft: TREE_ROW_BASE_PAD + depth * TREE_ROW_INDENT,
                      height: 3,
                    }}
                  />
                )}
                rootProps={{
                  className: "min-h-0 flex-1 px-2 py-2",
                }}
                render={(node, treeProps) => (
                  <WorkspaceTreeRow
                    node={node}
                    depth={treeProps.depth}
                    isOpen={treeProps.isOpen}
                    onToggle={treeProps.onToggle}
                    isDragging={treeProps.isDragging}
                    isDropTarget={treeProps.isDropTarget}
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
                )}
              />
            </div>
          </DndProvider>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

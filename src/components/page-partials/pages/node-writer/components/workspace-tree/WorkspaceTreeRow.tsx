import type { Dispatch, RefObject, SetStateAction } from "react";
import type { NodeModel } from "@minoru/react-dnd-treeview";
import type { Project, WorkspaceFolder } from "../../types/types";
import type { WorkspaceTreeMeta } from "../../workspace/workspace-tree-utils";
import { Icons } from "../Icons";
import {
  PRESET_FOLDER_TITLE_COLORS,
  TREE_ROW_BASE_PAD,
  TREE_ROW_INDENT,
  treeRowIconBtn,
  treeRowIconBtnDanger,
} from "./constants";

export type DraftTitleState = { nodeId: string; value: string } | null;

export interface WorkspaceTreeRowProps {
  node: NodeModel<WorkspaceTreeMeta>;
  depth: number;
  isOpen: boolean;
  onToggle: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  /** Перейменування, видалення, колір — лише для адміна. */
  allowAdminRowActions?: boolean;
  /** Дочірня папка та новий документ у папці. */
  allowCreateRowActions?: boolean;
  folderById: Map<string, WorkspaceFolder>;
  projectById: Map<string, Project>;
  draftTitle: DraftTitleState;
  setDraftTitle: Dispatch<SetStateAction<DraftTitleState>>;
  commitDraft: () => void;
  clearPendingRowClick: () => void;
  schedulePrimaryAction: (action: () => void) => void;
  onProjectSelect: (project: Project) => void;
  paletteOpenForFolderId: string | null;
  setPaletteOpenForFolderId: Dispatch<SetStateAction<string | null>>;
  paletteAnchorRef: RefObject<HTMLDivElement | null>;
  openNativeFolderColorPicker: (folderId: string) => void;
  onSetFolderTitleColor: (id: string, color: string | null) => void;
  onAddChildFolder: (parentFolderId: string) => void;
  onCreateDocumentInFolder: (folderId: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export function WorkspaceTreeRow({
  node,
  depth,
  isOpen,
  onToggle,
  isDragging,
  isDropTarget,
  allowAdminRowActions = true,
  allowCreateRowActions = true,
  folderById,
  projectById,
  draftTitle,
  setDraftTitle,
  commitDraft,
  clearPendingRowClick,
  schedulePrimaryAction,
  onProjectSelect,
  paletteOpenForFolderId,
  setPaletteOpenForFolderId,
  paletteAnchorRef,
  openNativeFolderColorPicker,
  onSetFolderTitleColor,
  onAddChildFolder,
  onCreateDocumentInFolder,
  onDeleteFolder,
  onDeleteProject,
}: WorkspaceTreeRowProps) {
  const isFolder = node.data?.kind === "folder";
  const folderId =
    node.data?.kind === "folder" ? node.data.folderId : null;
  const folderRow = folderId ? folderById.get(folderId) : undefined;
  const nodeIdStr = String(node.id);
  const rowPadLeft = TREE_ROW_BASE_PAD + depth * TREE_ROW_INDENT;
  const folderLabelMuted =
    isFolder && !isOpen && draftTitle?.nodeId !== nodeIdStr;
  const isRowEditing = draftTitle?.nodeId === nodeIdStr;

  return (
    <div
      className={`group flex min-h-9 w-full min-w-0 items-center gap-2 rounded-lg py-1 pr-1 transition-all duration-200 ${
        isDragging ? "opacity-45" : ""
      } hover:bg-muted/45 ${
        isDropTarget
          ? "bg-accent/25 ring-1 ring-ring/50 ring-offset-0 ring-offset-background"
          : ""
      } ${!isRowEditing ? "cursor-pointer" : ""}`}
      style={{ paddingLeft: rowPadLeft }}
      onClick={
        isRowEditing
          ? undefined
          : () => {
              clearPendingRowClick();
              schedulePrimaryAction(() => {
                if (isFolder) {
                  onToggle();
                } else {
                  const p = projectById.get(
                    node.data?.kind === "project"
                      ? node.data.projectId
                      : "",
                  );
                  if (p) onProjectSelect(p);
                }
              });
            }
      }
      onDoubleClick={
        isRowEditing || !allowAdminRowActions
          ? undefined
          : (e) => {
              e.preventDefault();
              clearPendingRowClick();
              setDraftTitle({
                nodeId: nodeIdStr,
                value: node.text,
              });
            }
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className={`flex min-w-0 items-center gap-2 transition-opacity duration-200 ${
            folderLabelMuted ? "opacity-70" : "opacity-100"
          } ${isRowEditing ? "min-w-0 flex-1" : ""}`}
        >
          {isFolder ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearPendingRowClick();
                onToggle();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus-visible:outline-none [&:focus-visible]:ring-0"
              title={isOpen ? "Згорнути" : "Розгорнути"}
            >
              {isOpen ? (
                <Icons.WorkspaceTreeChevronDown />
              ) : (
                <Icons.WorkspaceTreeChevronRight />
              )}
            </button>
          ) : (
            <span
              className="inline-flex h-8 w-5 shrink-0 items-center justify-center"
              aria-hidden
            />
          )}

          <div
            className={`flex shrink-0 ${
              isFolder ? "text-primary drop-shadow-sm" : "drop-shadow-sm"
            }`}
          >
            {isFolder ? (
              <Icons.WorkspaceTreeFolderSolid />
            ) : (
              <Icons.WorkspaceTreeFileSolid />
            )}
          </div>

          <div
            className={
              isRowEditing
                ? "min-w-0 flex-1"
                : "min-w-0 max-w-[min(100%,20rem)]"
            }
          >
            {draftTitle?.nodeId === nodeIdStr ? (
              <input
                autoFocus
                value={draftTitle.value}
                onChange={(e) =>
                  setDraftTitle({
                    nodeId: nodeIdStr,
                    value: e.target.value,
                  })
                }
                onBlur={commitDraft}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    commitDraft();
                  }
                  if (e.code === "Escape") {
                    setDraftTitle(null);
                  }
                }}
                className="w-full min-w-0 border-b border-primary/40 bg-transparent py-1 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                style={{
                  color: nodeIdStr.startsWith("fol:")
                    ? folderById.get(nodeIdStr.slice(4))?.titleColor ??
                      undefined
                    : undefined,
                }}
              />
            ) : (
              <span
                title={
                  isFolder
                    ? "Клік — розгорнути або згорнути; подвійний клік — перейменувати"
                    : "Клік — відкрити; подвійний клік — перейменувати"
                }
                className={`block truncate text-left text-sm tracking-tight ${
                  isFolder
                    ? folderRow?.titleColor
                      ? "font-semibold"
                      : "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
                style={
                  isFolder && folderRow?.titleColor
                    ? { color: folderRow.titleColor }
                    : undefined
                }
              >
                {node.text}
              </span>
            )}
          </div>
        </div>

        {!isRowEditing ? (
          <>
            <div className="flex shrink-0 items-center gap-px opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {allowAdminRowActions && isFolder && folderId ? (
                <div
                  ref={
                    paletteOpenForFolderId === folderId
                      ? paletteAnchorRef
                      : undefined
                  }
                  className="relative shrink-0"
                >
                  <button
                    type="button"
                    title="Колір назви (Shift+клік — скинути)"
                    className={treeRowIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingRowClick();
                      if (e.shiftKey) {
                        onSetFolderTitleColor(folderId, null);
                        setPaletteOpenForFolderId(null);
                        return;
                      }
                      setPaletteOpenForFolderId((cur) =>
                        cur === folderId ? null : folderId,
                      );
                    }}
                  >
                    <span
                      className="size-3.5 shrink-0 rounded-full border border-border/70 ring-1 ring-background"
                      style={{
                        backgroundColor:
                          folderRow?.titleColor ?? "transparent",
                      }}
                    />
                  </button>
                  {paletteOpenForFolderId === folderId ? (
                    <div
                      className="absolute right-0 top-full z-50 mt-1 w-[148px] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
                      role="listbox"
                      aria-label="Колір назви папки"
                    >
                      <div className="flex flex-wrap gap-1">
                        {PRESET_FOLDER_TITLE_COLORS.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            title={hex}
                            className="size-5 shrink-0 rounded-full border border-border/50 ring-1 ring-background transition-transform hover:scale-110"
                            style={{ backgroundColor: hex }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onSetFolderTitleColor(folderId, hex);
                              setPaletteOpenForFolderId(null);
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="mono mt-1.5 w-full border border-border py-1 text-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openNativeFolderColorPicker(folderId);
                        }}
                      >
                        Свій колір…
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {allowCreateRowActions && isFolder && folderId ? (
                <>
                  <button
                    type="button"
                    title="Дочірня папка"
                    className={treeRowIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingRowClick();
                      onAddChildFolder(folderId);
                    }}
                  >
                    <Icons.WorkspaceFolderChild />
                  </button>
                  <button
                    type="button"
                    title="Новий документ у папці"
                    className={treeRowIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingRowClick();
                      onCreateDocumentInFolder(folderId);
                    }}
                  >
                    <Icons.WorkspaceDocumentNew />
                  </button>
                </>
              ) : null}
              {allowAdminRowActions ? (
                <>
                  <button
                    type="button"
                    title="Перейменувати"
                    className={treeRowIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingRowClick();
                      setDraftTitle({
                        nodeId: nodeIdStr,
                        value: node.text,
                      });
                    }}
                  >
                    <Icons.WorkspaceRename />
                  </button>
                  <button
                    type="button"
                    title="Видалити"
                    className={treeRowIconBtnDanger}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingRowClick();
                      if (
                        !window.confirm(
                          isFolder
                            ? "Видалити папку та весь вміст (підпапки й документи)?"
                            : "Видалити цей документ?",
                        )
                      ) {
                        return;
                      }
                      if (isFolder && folderId) {
                        onDeleteFolder(folderId);
                      }
                      if (node.data?.kind === "project") {
                        onDeleteProject(node.data.projectId);
                      }
                    }}
                  >
                    <Icons.WorkspaceTrash />
                  </button>
                </>
              ) : null}
            </div>
            <div className="min-h-8 min-w-0 flex-1" aria-hidden />
          </>
        ) : null}
      </div>
    </div>
  );
}

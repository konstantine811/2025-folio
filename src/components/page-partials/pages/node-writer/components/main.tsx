import { useCallback, useMemo, useState } from "react";
import type {
  AppView,
  Project,
  ProjectPatchFn,
  WorkspaceFolder,
} from "../types/types";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import NodesView from "./NodesView";
import EditorView from "./EditorView";
import PresentationView from "./PresentationView";
import AssetsView from "./AssetsView";
import CreateProjectModal from "./CreateProjectModal";
import { collectFolderSubtreeIds } from "../workspace/workspace-tree-utils";
import { nextChildOrder } from "../workspace/next-child-order";

const Main = () => {
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [createTargetFolderId, setCreateTargetFolderId] = useState<
    string | null
  >(null);

  const createModalFolderLabel = useMemo(() => {
    if (!createTargetFolderId) return null;
    return folders.find((f) => f.id === createTargetFolderId)?.title ?? null;
  }, [createTargetFolderId, folders]);

  const applyProjectPatch = useCallback((fn: ProjectPatchFn) => {
    setCurrentProject((cur) => {
      if (!cur) return null;
      const next = fn(cur);
      const stamped =
        next === cur ? cur : { ...next, lastModified: Date.now() };
      if (stamped !== cur) {
        setProjects((prev) =>
          prev.map((p) => (p.id === stamped.id ? stamped : p)),
        );
      }
      return stamped;
    });
  }, []);

  const openCreateDocument = (folderId: string | null) => {
    setCreateTargetFolderId(folderId);
    setIsCreateModalOpen(true);
  };

  const createNewDocument = () => {
    const title = newDocTitle.trim();
    if (!title) return;
    const parentKey = createTargetFolderId;
    const order = nextChildOrder(folders, projects, parentKey);
    const newProject: Project = {
      id: `doc-${Date.now()}`,
      title,
      content: "",
      nodes: [],
      links: [],
      canvasImages: [],
      slides: [],
      images: [],
      lastModified: Date.now(),
      folderId: parentKey,
      workspaceOrder: order,
    };
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);
    setIsCreateModalOpen(false);
    setNewDocTitle("");
    setCreateTargetFolderId(null);
    setView("nodes");
  };

  const addFolder = (parentId: string | null) => {
    const order = nextChildOrder(folders, projects, parentId);
    const id = `fld-${Date.now()}`;
    setFolders((prev) => [
      ...prev,
      { id, parentId, title: "Нова папка", sortOrder: order },
    ]);
  };

  const renameFolder = (id: string, title: string) => {
    const t = title.trim();
    if (!t) return;
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, title: t } : f)));
  };

  const setFolderTitleColor = (id: string, color: string | null) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (!color) {
          const { titleColor: _removed, ...rest } = f;
          return rest as WorkspaceFolder;
        }
        return { ...f, titleColor: color };
      }),
    );
  };

  const deleteFolder = (id: string) => {
    const subtree = collectFolderSubtreeIds(folders, id);
    setFolders((prev) => prev.filter((f) => !subtree.has(f.id)));
    setProjects((prev) =>
      prev.filter((p) => {
        const fid = p.folderId ?? null;
        return !fid || !subtree.has(fid);
      }),
    );
    setCurrentProject((cur) => {
      if (!cur) return null;
      const fid = cur.folderId ?? null;
      if (fid && subtree.has(fid)) {
        setView("dashboard");
        return null;
      }
      return cur;
    });
  };

  const renameProject = (id: string, title: string) => {
    const t = title.trim();
    if (!t) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: t } : p)),
    );
    setCurrentProject((cur) =>
      cur?.id === id ? { ...cur, title: t } : cur,
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setCurrentProject((cur) => {
      if (cur?.id === id) {
        setView("dashboard");
        return null;
      }
      return cur;
    });
  };

  const syncWorkspaceFromTreeDrop = useCallback(
    (nextFolders: WorkspaceFolder[], nextProjects: Project[]) => {
      setFolders(nextFolders);
      setProjects(nextProjects);
      setCurrentProject((cur) => {
        if (!cur) return null;
        const updated = nextProjects.find((p) => p.id === cur.id);
        return updated ?? cur;
      });
    },
    [],
  );

  const updateProjectContent = (content: string) => {
    if (!currentProject) return;
    applyProjectPatch((p) => ({ ...p, content }));
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setView("nodes");
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background font-sans text-foreground md:flex-row">
      <Sidebar
        view={view}
        currentProject={currentProject}
        onViewChange={setView}
      />

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          title={newDocTitle}
          targetFolderLabel={createModalFolderLabel}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateTargetFolderId(null);
          }}
          onTitleChange={setNewDocTitle}
          onCreate={createNewDocument}
        />

        <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col">
          {view === "dashboard" && (
            <Dashboard
              folders={folders}
              projects={projects}
              onWorkspaceSync={syncWorkspaceFromTreeDrop}
              onCreateDocumentInFolder={openCreateDocument}
              onAddRootFolder={() => addFolder(null)}
              onAddChildFolder={addFolder}
              onRenameFolder={renameFolder}
              onSetFolderTitleColor={setFolderTitleColor}
              onDeleteFolder={deleteFolder}
              onRenameProject={renameProject}
              onDeleteProject={deleteProject}
              onProjectSelect={handleProjectSelect}
            />
          )}

          {view === "nodes" && currentProject && (
            <NodesView
              project={currentProject}
              onProjectPatch={applyProjectPatch}
            />
          )}

          {view === "editor" && currentProject && (
            <EditorView
              project={currentProject}
              onContentChange={updateProjectContent}
            />
          )}

          {view === "presentation" && currentProject && (
            <PresentationView project={currentProject} />
          )}

          {view === "assets" && currentProject && (
            <AssetsView project={currentProject} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Main;

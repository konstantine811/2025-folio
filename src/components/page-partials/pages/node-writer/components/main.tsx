import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router";
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
import WorkspaceAssetsView from "./WorkspaceAssetsView";
import CreateProjectModal from "./CreateProjectModal";
import DocumentRouteLoading from "./DocumentRouteLoading";
import { collectFolderSubtreeIds } from "../workspace/workspace-tree-utils";
import { nextChildOrder } from "../workspace/next-child-order";
import {
  collectNodeWriterStoragePaths,
  collectRemovedNodeWriterStoragePaths,
  deleteNodeWriterStorageObjectsByPaths,
  loadWorkspaceFromFirestore,
  resolveProjectMediaUrls,
  syncWorkspaceToFirestore,
} from "@/services/firebase/node-writer-workspace";
import {
  isNodeWriterAdminEmail,
  NODE_WRITER_WORKSPACE_SCOPE,
} from "@/config/node-writer-access.config";
import { useSmoothedLoading } from "@/hooks/use-smoothed-loading";
import {
  mergeProjectsByLastModified,
  NW_WORKSPACE_STORAGE_KEY,
  useNodeWriterWorkspaceStore,
} from "@/storage/nodeWriterWorkspaceStore";
import { useAuthStore } from "@/storage/useAuthStore";
import { RoutPath } from "@/config/router-config";
import {
  buildNodeWriterPath,
  parseNodeWriterPath,
} from "../workspace/node-writer-paths";

/** Документи/папки, створені локально до відповіді сервера, не затирати при applyRemote. */
function mergeServerFoldersIntoLocal(
  server: WorkspaceFolder[],
  local: WorkspaceFolder[],
): WorkspaceFolder[] {
  const remoteIds = new Set(server.map((f) => f.id));
  const localOnly = local.filter((f) => !remoteIds.has(f.id));
  return localOnly.length === 0 ? server : [...server, ...localOnly];
}

const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isWorkspaceAdmin = useMemo(
    () => isNodeWriterAdminEmail(user?.email ?? null),
    [user?.email],
  );
  const putWorkspaceCache = useNodeWriterWorkspaceStore((s) => s.putWorkspace);
  const [nwStoreHydrated, setNwStoreHydrated] = useState(() =>
    useNodeWriterWorkspaceStore.persist.hasHydrated(),
  );
  const [cloudReady, setCloudReady] = useState(false);

  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [createTargetFolderId, setCreateTargetFolderId] = useState<
    string | null
  >(null);

  /** Щойно створені id: pathname-effect не робить redirect, поки projects ще не містить документ (гонка navigate vs setState). */
  const pendingLocalProjectIdsRef = useRef<Set<string>>(new Set());

  const createModalFolderLabel = useMemo(() => {
    if (!createTargetFolderId) return null;
    return folders.find((f) => f.id === createTargetFolderId)?.title ?? null;
  }, [createTargetFolderId, folders]);

  const nodeWriterRoute = useMemo(
    () => parseNodeWriterPath(location.pathname),
    [location.pathname],
  );

  const showDocumentRouteLoading = Boolean(
    !cloudReady && nodeWriterRoute.projectId,
  );

  const showDashboardWorkspaceLoading = Boolean(
    !cloudReady && !nodeWriterRoute.projectId,
  );

  const smoothDashboardWorkspaceLoading = useSmoothedLoading(
    showDashboardWorkspaceLoading,
    { showAfterMs: 260, minVisibleMs: 420 },
  );

  const smoothDocumentRouteLoading = useSmoothedLoading(
    showDocumentRouteLoading,
    { showAfterMs: 300, minVisibleMs: 0 },
  );

  useEffect(() => {
    const api = useNodeWriterWorkspaceStore.persist;
    if (api.hasHydrated()) {
      setNwStoreHydrated(true);
      return;
    }
    return api.onFinishHydration(() => setNwStoreHydrated(true));
  }, []);

  useEffect(() => {
    if (!nwStoreHydrated) return;

    let cancelled = false;
    const { getWorkspace, isWorkspaceFresh } =
      useNodeWriterWorkspaceStore.getState();
    const scope = NODE_WRITER_WORKSPACE_SCOPE;
    const cached = getWorkspace(scope);
    const fresh = isWorkspaceFresh(scope);

    const applyRemote = (data: {
      folders: WorkspaceFolder[];
      projects: Project[];
    }) => {
      if (cancelled) return;
      setFolders((prev) => mergeServerFoldersIntoLocal(data.folders, prev));
      setProjects((prev) => mergeProjectsByLastModified(data.projects, prev));
      setCloudReady(true);
    };

    const applyCachedProjects = async (entry: {
      folders: WorkspaceFolder[];
      projects: Project[];
    }) => {
      const resolvedProjects = await Promise.all(
        entry.projects.map((p) => resolveProjectMediaUrls(p)),
      );
      if (cancelled) return;
      setFolders(entry.folders);
      setProjects(resolvedProjects);
      setCurrentProject((cur) => {
        if (!cur) return null;
        return resolvedProjects.find((p) => p.id === cur.id) ?? null;
      });
      setCloudReady(true);
    };

    if (cached && fresh) {
      void applyCachedProjects(cached)
        .then(() => {
          if (cancelled) return;
          return loadWorkspaceFromFirestore(scope);
        })
        .then((data) => {
          if (cancelled || !data) return;
          applyRemote(data);
        })
        .catch((err) => {
          console.error("Node writer: кеш / Firestore", err);
          if (!cancelled) {
            setFolders(cached.folders);
            setProjects(cached.projects);
            setCurrentProject((cur) => {
              if (!cur) return null;
              return cached.projects.find((p) => p.id === cur.id) ?? null;
            });
            setCloudReady(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    if (cached && !fresh) {
      void applyCachedProjects(cached)
        .then(() => {
          if (cancelled) return;
          return loadWorkspaceFromFirestore(scope);
        })
        .then((data) => {
          if (cancelled || !data) return;
          applyRemote(data);
        })
        .catch((err) => {
          console.error("Node writer: не вдалося оновити з Firestore", err);
        });
      return () => {
        cancelled = true;
      };
    }

    setCloudReady(false);
    loadWorkspaceFromFirestore(scope)
      .then((data) => {
        if (cancelled) return;
        applyRemote(data);
      })
      .catch((err) => {
        console.error("Node writer: не вдалося завантажити з Firestore", err);
        if (!cancelled) setCloudReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [nwStoreHydrated]);

  /** Інша вкладка / повернення фокусу — підтягнути Firestore, щоб не лишатись на застарілому кеші. */
  useEffect(() => {
    if (!nwStoreHydrated || !cloudReady) return;
    const scope = NODE_WRITER_WORKSPACE_SCOPE;
    let cancelled = false;
    let timer: number | undefined;
    const pull = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        loadWorkspaceFromFirestore(scope)
          .then((data) => {
            if (cancelled) return;
            setFolders((prev) =>
              mergeServerFoldersIntoLocal(data.folders, prev),
            );
            setProjects((prev) =>
              mergeProjectsByLastModified(data.projects, prev),
            );
          })
          .catch((err) => {
            console.error(
              "Node writer: фонове оновлення з Firestore (фокус / інша вкладка)",
              err,
            );
          });
      }, 320);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") pull();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== NW_WORKSPACE_STORAGE_KEY) return;
      pull();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, [nwStoreHydrated, cloudReady]);

  useEffect(() => {
    if (!cloudReady) return;
    const { projectId, view } = parseNodeWriterPath(location.pathname);
    if (view === "workspaceAssets") {
      if (!isWorkspaceAdmin) {
        navigate(RoutPath.NODE_WRITER, { replace: true });
        return;
      }
      pendingLocalProjectIdsRef.current.clear();
      setView("workspaceAssets");
      setCurrentProject(null);
      return;
    }
    if (!projectId) {
      pendingLocalProjectIdsRef.current.clear();
      setView("dashboard");
      setCurrentProject(null);
      return;
    }
    const p = projects.find((pr) => pr.id === projectId);
    if (!p) {
      if (pendingLocalProjectIdsRef.current.has(projectId)) {
        return;
      }
      navigate(RoutPath.NODE_WRITER, { replace: true });
      return;
    }
    pendingLocalProjectIdsRef.current.delete(projectId);
    if (!isWorkspaceAdmin && view === "assets") {
      navigate(buildNodeWriterPath(projectId, "nodes"), { replace: true });
      return;
    }
    setCurrentProject(p);
    setView(view);
  }, [cloudReady, location.pathname, projects, navigate, isWorkspaceAdmin]);

  useEffect(() => {
    if (!user?.uid || !cloudReady) return;
    const timer = window.setTimeout(() => {
      syncWorkspaceToFirestore(
        NODE_WRITER_WORKSPACE_SCOPE,
        folders,
        projects,
        isWorkspaceAdmin,
      ).catch((err) => {
        console.error("Node writer: не вдалося зберегти в Firestore", err);
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [user?.uid, cloudReady, folders, projects, isWorkspaceAdmin]);

  useEffect(() => {
    if (!cloudReady) return;
    const t = window.setTimeout(() => {
      putWorkspaceCache(NODE_WRITER_WORKSPACE_SCOPE, folders, projects);
    }, 500);
    return () => clearTimeout(t);
  }, [cloudReady, folders, projects, putWorkspaceCache]);

  const applyProjectPatch = useCallback((fn: ProjectPatchFn) => {
    setCurrentProject((cur) => {
      if (!cur) return null;
      const next = fn(cur);
      if (next === cur) {
        return cur;
      }
      const removed = collectRemovedNodeWriterStoragePaths(cur, next);
      const ts = Date.now();
      const stamped = { ...next, lastModified: ts };
      setProjects((prevProjects) => {
        const others = prevProjects.filter((p) => p.id !== cur.id);
        const toDelete = removed.filter(
          (path) =>
            !others.some((op) => collectNodeWriterStoragePaths(op).has(path)),
        );
        if (toDelete.length > 0) {
          void deleteNodeWriterStorageObjectsByPaths(
            toDelete,
            next.id,
            NODE_WRITER_WORKSPACE_SCOPE,
          );
        }
        return prevProjects.map((p) => (p.id === stamped.id ? stamped : p));
      });
      return stamped;
    });
  }, []);

  const applyProjectPatchById = useCallback(
    (projectId: string, fn: ProjectPatchFn) => {
      setProjects((prevProjects) => {
        const cur = prevProjects.find((p) => p.id === projectId);
        if (!cur) return prevProjects;
        const next = fn(cur);
        if (next === cur) return prevProjects;
        const removed = collectRemovedNodeWriterStoragePaths(cur, next);
        const others = prevProjects.filter((p) => p.id !== projectId);
        const toDelete = removed.filter(
          (path) =>
            !others.some((op) => collectNodeWriterStoragePaths(op).has(path)),
        );
        if (toDelete.length > 0) {
          void deleteNodeWriterStorageObjectsByPaths(
            toDelete,
            next.id,
            NODE_WRITER_WORKSPACE_SCOPE,
          );
        }
        const stamped = { ...next, lastModified: Date.now() };
        setCurrentProject((c) => (c?.id === projectId ? stamped : c));
        return prevProjects.map((p) => (p.id === projectId ? stamped : p));
      });
    },
    [],
  );

  const openCreateDocument = (folderId: string | null) => {
    if (!isWorkspaceAdmin) return;
    setCreateTargetFolderId(folderId);
    setIsCreateModalOpen(true);
  };

  const createNewDocument = () => {
    if (!isWorkspaceAdmin) return;
    const title = newDocTitle.trim();
    if (!title) return;
    const parentKey = createTargetFolderId;
    const order = nextChildOrder(folders, projects, parentKey);
    const newProject: Project = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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

    pendingLocalProjectIdsRef.current.add(newProject.id);
    const initialDocView: AppView = "nodes";
    flushSync(() => {
      setProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);
      setIsCreateModalOpen(false);
      setNewDocTitle("");
      setCreateTargetFolderId(null);
      setView(initialDocView);
    });
    const path = buildNodeWriterPath(newProject.id, initialDocView);
    queueMicrotask(() => {
      navigate(path, { replace: false });
    });
  };

  const addFolder = (parentId: string | null) => {
    if (!isWorkspaceAdmin) return;
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
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title: t } : f)),
    );
  };

  const setFolderTitleColor = (id: string, color: string | null) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (!color) {
          const rest = { ...f };
          delete rest.titleColor;
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
        navigate(RoutPath.NODE_WRITER, { replace: true });
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
    setCurrentProject((cur) => (cur?.id === id ? { ...cur, title: t } : cur));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setCurrentProject((cur) => {
      if (cur?.id === id) {
        setView("dashboard");
        navigate(RoutPath.NODE_WRITER, { replace: true });
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
        if (!updated) {
          setView("dashboard");
          navigate(RoutPath.NODE_WRITER, { replace: true });
          return null;
        }
        return updated;
      });
    },
    [navigate],
  );

  const handleProjectSelect = (project: Project) => {
    const v: AppView = "nodes";
    setCurrentProject(project);
    setView(v);
    navigate(buildNodeWriterPath(project.id, v), { replace: false });
  };

  const handleViewChange = useCallback(
    (next: AppView) => {
      if (next === "dashboard") {
        setView("dashboard");
        navigate(RoutPath.NODE_WRITER, { replace: false });
        return;
      }
      if (next === "workspaceAssets") {
        if (!isWorkspaceAdmin) return;
        setView("workspaceAssets");
        setCurrentProject(null);
        navigate(buildNodeWriterPath(null, "workspaceAssets"), {
          replace: false,
        });
        return;
      }
      if (
        !isWorkspaceAdmin &&
        next !== "presentation" &&
        next !== "nodes" &&
        next !== "editor"
      ) {
        return;
      }
      setView(next);
      const pid = currentProject?.id;
      if (pid) {
        navigate(buildNodeWriterPath(pid, next), { replace: false });
      }
    },
    [navigate, currentProject?.id, isWorkspaceAdmin],
  );

  return (
    <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background font-sans text-foreground md:flex-row md:items-stretch">
      <Sidebar
        view={view}
        currentProject={currentProject}
        isWorkspaceAdmin={isWorkspaceAdmin}
        onViewChange={handleViewChange}
      />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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

        <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          {smoothDocumentRouteLoading && <DocumentRouteLoading />}

          {!showDocumentRouteLoading && view === "dashboard" && (
            <Dashboard
              folders={folders}
              projects={projects}
              allowWorkspaceCreate={isWorkspaceAdmin}
              allowTreeEdits={isWorkspaceAdmin}
              allowAdminRowActions={isWorkspaceAdmin}
              allowCreateRowActions={isWorkspaceAdmin}
              workspaceLoading={smoothDashboardWorkspaceLoading}
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

          {!showDocumentRouteLoading && view === "nodes" && currentProject && (
            <NodesView
              project={currentProject}
              onProjectPatch={applyProjectPatch}
              readOnly={!isWorkspaceAdmin}
            />
          )}

          {!showDocumentRouteLoading && view === "editor" && currentProject && (
            <EditorView project={currentProject} />
          )}

          {!showDocumentRouteLoading &&
            view === "presentation" &&
            currentProject && (
              <PresentationView
                project={currentProject}
                onProjectPatch={applyProjectPatch}
                readOnlyViewer={!isWorkspaceAdmin}
              />
            )}

          {!showDocumentRouteLoading &&
            view === "assets" &&
            currentProject &&
            isWorkspaceAdmin && (
              <AssetsView
                project={currentProject}
                onProjectPatch={applyProjectPatch}
              />
            )}

          {!showDocumentRouteLoading &&
            view === "workspaceAssets" &&
            isWorkspaceAdmin && (
              <WorkspaceAssetsView
                projects={projects}
                onPatchProjectById={applyProjectPatchById}
              />
            )}
        </div>
      </main>
    </div>
  );
};

export default Main;

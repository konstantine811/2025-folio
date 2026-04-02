import { useCallback, useState } from "react";
import type { AppView, Project, ProjectPatchFn } from "../types/types";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import NodesView from "./NodesView";
import EditorView from "./EditorView";
import PresentationView from "./PresentationView";
import AssetsView from "./AssetsView";
import CreateProjectModal from "./CreateProjectModal";

const Main = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");

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

  const createNewDocument = () => {
    const title = newDocTitle.trim();
    if (!title) return;
    const newProject: Project = {
      id: `doc-${Date.now()}`,
      title,
      content: "",
      nodes: [],
      links: [],
      slides: [],
      images: [],
      lastModified: Date.now(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);
    setIsCreateModalOpen(false);
    setNewDocTitle("");
    setView("nodes");
  };

  const updateProjectContent = (content: string) => {
    if (!currentProject) return;
    applyProjectPatch((p) => ({ ...p, content }));
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setView("nodes");
  };

  return (
    <div className="flex flex-col bg-black font-sans text-white md:flex-row grow">
      <Sidebar
        view={view}
        currentProject={currentProject}
        onViewChange={setView}
      />

      <main className="relative flex-1 overflow-hidden">
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          title={newDocTitle}
          onClose={() => setIsCreateModalOpen(false)}
          onTitleChange={setNewDocTitle}
          onCreate={createNewDocument}
        />

        <div className="relative h-full w-full">
          {view === "dashboard" && (
            <Dashboard
              projects={projects}
              onCreateClick={() => setIsCreateModalOpen(true)}
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

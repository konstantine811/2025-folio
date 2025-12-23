import { useState } from "react";
import { AppView, Project } from "../types/types";
import {
  generateMindMap,
  generateSlides,
  generateTeachingContent,
} from "../services/geminiService";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import NodesView from "./NodesView";
import EditorView from "./EditorView";
import PresentationView from "./PresentationView";
import AssetsView from "./AssetsView";
import CreateProjectModal from "./CreateProjectModal";
import LoadingOverlay from "./LoadingOverlay";

const Main = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationPrompt, setCreationPrompt] = useState("");

  const createNewProject = async (topic: string) => {
    if (!topic.trim()) return;
    setIsCreateModalOpen(false);
    setIsGenerating(true);
    try {
      const content = await generateTeachingContent(
        topic,
        "Professional research protocol"
      );
      const [mindMap, slides] = await Promise.all([
        generateMindMap(content),
        generateSlides(content),
      ]);
      const newProject: Project = {
        id: `EDU-PROT-${Date.now()}`,
        title: topic.toUpperCase(),
        content,
        nodes: mindMap.nodes,
        links: mindMap.links,
        slides,
        images: [],
        lastModified: Date.now(),
      };
      setProjects([newProject, ...projects]);
      setCurrentProject(newProject);
      setView("nodes");
    } catch {
      alert("ERROR: PROTOCOL_INIT_FAILURE");
    } finally {
      setIsGenerating(false);
      setCreationPrompt("");
    }
  };

  const updateProjectContent = (content: string) => {
    if (!currentProject) return;
    const updated = { ...currentProject, content, lastModified: Date.now() };
    setCurrentProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setView("nodes");
  };

  return (
    <div className="flex flex-col md:flex-row bg-black text-white font-sans">
      <Sidebar
        view={view}
        currentProject={currentProject}
        onViewChange={setView}
      />

      <main className="flex-1 overflow-hidden relative">
        {isGenerating && <LoadingOverlay />}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          creationPrompt={creationPrompt}
          onClose={() => setIsCreateModalOpen(false)}
          onPromptChange={setCreationPrompt}
          onCreate={() => createNewProject(creationPrompt)}
        />

        <div className="w-full h-full relative">
          {view === "dashboard" && (
            <Dashboard
              projects={projects}
              onCreateClick={() => setIsCreateModalOpen(true)}
              onProjectSelect={handleProjectSelect}
            />
          )}

          {view === "nodes" && currentProject && (
            <NodesView project={currentProject} />
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

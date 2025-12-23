import { useState } from "react";
import { AppView, Project } from "../types/types";
import {
  generateMindMap,
  generateSlides,
  generateTeachingContent,
} from "../services/geminiService";

const Icons = {
  Dashboard: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      ></path>
    </svg>
  ),
  Editor: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      ></path>
    </svg>
  ),
  Nodes: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
      ></path>
    </svg>
  ),
  Presentation: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      ></path>
    </svg>
  ),
  Assets: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      ></path>
    </svg>
  ),
  Logout: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      ></path>
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      ></path>
    </svg>
  ),
  Close: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  ),
};

const Main = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
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
  return (
    <div className="flex flex-col md:flex-row bg-black text-white overflow-hidden font-sans">
      {/* Sidebar - Digital Architect Style */}
      <nav className="w-full md:w-20 bg-black border-r border-white/5 flex flex-col h-screen sticky top-0 z-40">
        <div className="flex-1 flex flex-col items-center pt-10 gap-8">
          <button
            onClick={() => setView("dashboard")}
            className={`p-3 transition-all ${
              view === "dashboard"
                ? "text-[#00FF9C]"
                : "text-white/20 hover:text-white"
            }`}
            title="Голова"
          >
            <Icons.Dashboard />
          </button>
          {currentProject && (
            <>
              <div className="w-4 h-px bg-white/5"></div>
              <button
                onClick={() => setView("nodes")}
                className={`p-3 transition-all ${
                  view === "nodes"
                    ? "text-[#00FF9C]"
                    : "text-white/20 hover:text-white"
                }`}
                title="Майстерня"
              >
                <Icons.Nodes />
              </button>
              <button
                onClick={() => setView("editor")}
                className={`p-3 transition-all ${
                  view === "editor"
                    ? "text-[#00FF9C]"
                    : "text-white/20 hover:text-white"
                }`}
                title="Текст"
              >
                <Icons.Editor />
              </button>
              <button
                onClick={() => setView("presentation")}
                className={`p-3 transition-all ${
                  view === "presentation"
                    ? "text-[#00FF9C]"
                    : "text-white/20 hover:text-white"
                }`}
                title="Презентація"
              >
                <Icons.Presentation />
              </button>
              <button
                onClick={() => setView("assets")}
                className={`p-3 transition-all ${
                  view === "assets"
                    ? "text-[#00FF9C]"
                    : "text-white/20 hover:text-white"
                }`}
                title="Бібліотека"
              >
                <Icons.Assets />
              </button>
            </>
          )}
        </div>

        <div className="p-6 flex flex-col items-center gap-6 border-t border-white/5">
          <div className="status-dot"></div>
          {/* /// LOGOUT BUTTON */}
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 overflow-hidden relative">
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-center space-y-4">
              <div className="mono text-[10px] tracking-[0.5em] text-[#00FF9C] uppercase animate-pulse">
                Running_Neural_Core...
              </div>
              <div className="w-48 h-px bg-white/5 mx-auto overflow-hidden">
                <div className="w-1/2 h-full bg-[#00FF9C] animate-[loading_1.5s_infinite_linear]"></div>
              </div>
            </div>
            <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
          </div>
        )}

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-black w-full max-w-4xl border border-white/10 p-12">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <div className="mono text-[9px] text-white/20 uppercase tracking-[0.3em] mb-4">
                    Protocol Initialization
                  </div>
                  <h3 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                    Новий протокол
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <Icons.Close />
                </button>
              </div>
              <textarea
                autoFocus
                value={creationPrompt}
                onChange={(e) => setCreationPrompt(e.target.value)}
                placeholder="ВВЕДІТЬ ТЕМУ ДОСЛІДЖЕННЯ..."
                className="w-full h-40 bg-transparent border-l border-white/10 pl-8 outline-none text-4xl font-black uppercase placeholder:text-white/5 text-white tracking-tighter leading-none resize-none"
              />
              <div className="mt-16 flex justify-between items-end">
                <div className="mono text-[8px] text-white/20 uppercase tracking-widest max-w-xs leading-relaxed">
                  Система згенерує граф логіки та структуру виступу на основі
                  AI.
                </div>
                <button
                  onClick={() => createNewProject(creationPrompt)}
                  disabled={!creationPrompt.trim()}
                  className="px-12 py-4 bg-white text-black font-black text-xs hover:bg-[#00FF9C] disabled:opacity-20 transition-all uppercase tracking-widest"
                >
                  Запустити_Процес
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-full relative">
          {view === "dashboard" && (
            <div className="w-full h-full overflow-y-auto p-12 lg:p-24 bg-black">
              <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-7xl mx-auto">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="status-dot"></span>
                    <span className="mono text-[10px] text-white/40 uppercase tracking-[0.3em] italic">
                      Workspace // Active Sessions
                    </span>
                  </div>
                  <h2 className="text-[7vw] font-black tracking-tighter italic leading-none uppercase">
                    ПРОТОКОЛИ
                  </h2>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-black px-12 py-6 font-black text-xs hover:bg-[#00FF9C] transition-all flex items-center gap-4 uppercase tracking-[0.2em]"
                >
                  [ Створити_Новий ]
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto pb-32">
                {projects.length === 0 ? (
                  <div className="col-span-full py-40 text-center border border-white/5">
                    <p className="mono text-[10px] text-white/10 uppercase tracking-[0.5em]">
                      No records found in archive
                    </p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setCurrentProject(project);
                        setView("nodes");
                      }}
                      className="group bg-black p-10 border border-white/5 hover:border-[#00FF9C] transition-all cursor-pointer aspect-[4/5] flex flex-col justify-between"
                    >
                      <div className="mono text-[8px] text-white/10 uppercase tracking-widest">
                        {new Date(project.lastModified).toLocaleDateString()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black mb-4 tracking-tighter leading-none uppercase italic group-hover:text-[#00FF9C] transition-colors line-clamp-3">
                          {project.title}
                        </h3>
                        <div className="h-px w-0 group-hover:w-full bg-[#00FF9C] transition-all duration-500"></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === "nodes" && currentProject && (
            <div className="w-full h-full flex flex-col">
              <div className="h-14 bg-black border-b border-white/5 flex items-center px-8 justify-between z-10">
                <div className="flex items-center gap-6">
                  <span className="mono text-[10px] text-[#00FF9C] uppercase tracking-widest">
                    Active_Protocol:
                  </span>
                  <h2 className="mono text-[10px] font-bold uppercase tracking-tight text-white/60">
                    {currentProject.title}
                  </h2>
                </div>
                <div className="mono text-[8px] text-white/20 uppercase tracking-widest">
                  Render: 48.9226° N, 24.7111° E
                </div>
              </div>
              <div className="flex-1 relative">
                {/* <NodeGraph
                  nodes={currentProject.nodes}
                  links={currentProject.links}
                  onUpdate={updateGraph}
                /> */}
              </div>
            </div>
          )}

          {view === "editor" && currentProject && (
            <div className="max-w-4xl mx-auto h-full flex flex-col py-24 px-12 overflow-y-auto">
              <div className="mb-16">
                <h2 className="text-5xl font-black tracking-tighter italic uppercase">
                  Текстовий протокол
                </h2>
                <div className="mono text-[9px] text-white/20 uppercase tracking-widest mt-2 italic">
                  Data input engine v4.1
                </div>
              </div>
              <textarea
                value={currentProject.content}
                onChange={(e) => updateProjectContent(e.target.value)}
                className="flex-1 w-full p-12 bg-black border-l border-white/10 outline-none resize-none text-white/50 text-base leading-relaxed mono focus:text-white transition-all"
                placeholder="Введіть дані дослідження..."
              />
            </div>
          )}

          {view === "presentation" && currentProject && (
            <div className="w-full h-full flex flex-col p-12 lg:p-24 bg-black overflow-y-auto">
              <header className="mb-16 flex items-end justify-between max-w-7xl mx-auto w-full">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter italic uppercase">
                    Презентація
                  </h2>
                  <p className="mono text-[9px] text-white/20 uppercase mt-1 tracking-widest">
                    Slide {activeSlide + 1} // {currentProject.slides.length}
                  </p>
                </div>
                <div className="flex gap-2 p-1 border border-white/10">
                  <button
                    onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                    className="px-6 py-2 mono text-[10px] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-10"
                    disabled={activeSlide === 0}
                  >
                    [ Prev ]
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide(
                        Math.min(
                          currentProject.slides.length - 1,
                          activeSlide + 1
                        )
                      )
                    }
                    className="px-6 py-2 mono text-[10px] uppercase bg-white text-black hover:bg-[#00FF9C] transition-all disabled:opacity-10"
                    disabled={activeSlide === currentProject.slides.length - 1}
                  >
                    [ Next ]
                  </button>
                </div>
              </header>
              <div className="flex-1 bg-black border border-white/10 flex items-center justify-center p-20 max-w-7xl mx-auto w-full relative overflow-hidden">
                <div className="absolute top-8 left-8 mono text-[7px] text-white/5 uppercase tracking-[1em]">
                  Secure_Video_Stream // DA_OUT
                </div>
                <div className="animate-in fade-in zoom-in-95 duration-700 text-center max-w-4xl">
                  <h3 className="text-7xl lg:text-8xl font-black text-white mb-16 italic uppercase tracking-tighter leading-none">
                    {currentProject.slides[activeSlide]?.title}
                  </h3>
                  <div className="text-2xl lg:text-3xl text-white/30 font-medium uppercase tracking-[0.2em] leading-relaxed italic">
                    {currentProject.slides[activeSlide]?.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "assets" && currentProject && (
            <div className="max-w-7xl mx-auto p-24 h-full overflow-y-auto pb-40">
              <header className="mb-20">
                <h2 className="text-5xl font-black tracking-tighter italic uppercase">
                  Бібліотека Ресурсів
                </h2>
                <div className="mono text-[9px] text-white/20 uppercase tracking-widest mt-2 italic">
                  Visual asset repository
                </div>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProject.images.length === 0 ? (
                  <div className="col-span-full py-40 text-center border border-white/5">
                    <p className="mono text-[10px] text-white/10 uppercase tracking-[0.5em]">
                      Repository currently offline
                    </p>
                  </div>
                ) : (
                  currentProject.images.map((img) => (
                    <div
                      key={img.id}
                      className="bg-black border border-white/5 hover:border-[#00FF9C] transition-all p-4"
                    >
                      <img
                        src={img.url}
                        className="w-full aspect-video object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700 mb-6"
                      />
                      <p className="mono text-[8px] text-white/20 uppercase tracking-widest line-clamp-2">
                        Protocol_Ref: "{img.prompt}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Main;

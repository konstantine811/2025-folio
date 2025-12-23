import { Project } from "../types/types";

interface DashboardProps {
  projects: Project[];
  onCreateClick: () => void;
  onProjectSelect: (project: Project) => void;
}

const Dashboard = ({
  projects,
  onCreateClick,
  onProjectSelect,
}: DashboardProps) => {
  return (
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
          onClick={onCreateClick}
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
              onClick={() => onProjectSelect(project)}
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
  );
};

export default Dashboard;

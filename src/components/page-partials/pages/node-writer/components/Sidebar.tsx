import { AppView, Project } from "../types/types";
import { Icons } from "./Icons";

interface SidebarProps {
  view: AppView;
  currentProject: Project | null;
  onViewChange: (view: AppView) => void;
}

const Sidebar = ({ view, currentProject, onViewChange }: SidebarProps) => {
  return (
    <nav className="w-full md:w-20 bg-black border-r border-white/5 flex flex-col sticky top-0 z-40">
      <div className="flex-1 flex flex-col items-center pt-10 gap-8">
        <button
          onClick={() => onViewChange("dashboard")}
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
              onClick={() => onViewChange("nodes")}
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
              onClick={() => onViewChange("editor")}
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
              onClick={() => onViewChange("presentation")}
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
              onClick={() => onViewChange("assets")}
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
  );
};

export default Sidebar;

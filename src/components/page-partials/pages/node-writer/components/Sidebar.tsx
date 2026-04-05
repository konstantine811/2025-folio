import { AppView, Project } from "../types/types";
import { Icons } from "./Icons";

interface SidebarProps {
  view: AppView;
  currentProject: Project | null;
  /** Повний набір вкладок документа (редактор, бібліотека тощо). */
  isWorkspaceAdmin?: boolean;
  onViewChange: (view: AppView) => void;
}

const Sidebar = ({
  view,
  currentProject,
  isWorkspaceAdmin = true,
  onViewChange,
}: SidebarProps) => {
  const navBtn = (active: boolean) =>
    `p-3 transition-colors ${
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="z-40 flex w-full shrink-0 flex-col self-stretch border-r border-border/30 bg-card md:min-h-0 md:w-20">
      <div className="flex min-h-0 flex-1 flex-col items-center">
        <div className="flex flex-col items-center gap-8 pt-10">
          <button
            type="button"
            onClick={() => onViewChange("dashboard")}
            className={navBtn(view === "dashboard")}
            title="Голова"
          >
            <Icons.Dashboard />
          </button>
          {currentProject && (
            <>
              <div className="h-px w-4 bg-border/50" />
              {!isWorkspaceAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => onViewChange("nodes")}
                    className={navBtn(view === "nodes")}
                    title="Майстерня (перегляд)"
                  >
                    <Icons.Nodes />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewChange("presentation")}
                    className={navBtn(view === "presentation")}
                    title="Презентація"
                  >
                    <Icons.Presentation />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onViewChange("nodes")}
                    className={navBtn(view === "nodes")}
                    title="Майстерня"
                  >
                    <Icons.Nodes />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewChange("editor")}
                    className={navBtn(view === "editor")}
                    title="Текст"
                  >
                    <Icons.Editor />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewChange("presentation")}
                    className={navBtn(view === "presentation")}
                    title="Презентація"
                  >
                    <Icons.Presentation />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewChange("assets")}
                    className={navBtn(view === "assets")}
                    title="Медіа документа (очищення)"
                  >
                    <Icons.Assets />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {isWorkspaceAdmin ? (
          <div className="mt-auto flex flex-col items-center pt-8 pb-4">
            <button
              type="button"
              onClick={() => onViewChange("workspaceAssets")}
              className={navBtn(view === "workspaceAssets")}
              title="Усі медіа документів (очищення)"
            >
              <Icons.WorkspaceMedia />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-4 border-t border-border/30 px-6 py-5">
        <div
          className="size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/60"
          aria-hidden
        />
      </div>
    </nav>
  );
};

export default Sidebar;

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NODE_CANVAS_HELP_TEXT } from "../node-canvas/constants";
import { useEditableProjectTitle } from "../hooks/use-editable-project-title";
import NodeCanvas from "../node-canvas";
import type { Project, ProjectPatchFn } from "../types/types";

interface NodesViewProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
}

const NodesView = ({ project, onProjectPatch }: NodesViewProps) => {
  const {
    editingTitle,
    setEditingTitle,
    draftTitle,
    setDraftTitle,
    titleInputRef,
    commitTitle,
  } = useEditableProjectTitle(project.title, onProjectPatch);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/20 bg-card px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="mono shrink-0 text-[10px] tracking-wide text-primary">
            Документ
          </span>
          <Tooltip delayDuration={250}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground -m-1 shrink-0 rounded p-1 transition-colors"
                aria-label="Інформація про полотно нод"
              >
                <Info className="size-4" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="mono max-w-md px-3 py-2.5 text-left text-[10px] leading-relaxed font-normal tracking-normal text-balance normal-case"
            >
              {NODE_CANVAS_HELP_TEXT}
            </TooltipContent>
          </Tooltip>
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTitle();
                  }
                }}
                className="w-full min-w-0 border-b border-border/40 bg-transparent py-0.5 text-sm font-medium tracking-normal text-foreground outline-none"
              />
            ) : (
              <h2
                className="cursor-text truncate text-sm font-medium tracking-normal text-foreground/90"
                title="Подвійний клік — перейменувати"
                onDoubleClick={() => setEditingTitle(true)}
              >
                {project.title}
              </h2>
            )}
          </div>
        </div>
        <div className="mono ml-4 shrink-0 text-[8px] tracking-wide text-muted-foreground">
          Ноди · зв&apos;язки · текст
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <NodeCanvas project={project} onProjectPatch={onProjectPatch} />
      </div>
    </div>
  );
};

export default NodesView;

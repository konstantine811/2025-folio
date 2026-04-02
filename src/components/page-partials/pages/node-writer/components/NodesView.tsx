import type { Project, ProjectPatchFn } from "../types/types";
import NodeCanvas from "../node-canvas";

interface NodesViewProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
}

const NodesView = ({ project, onProjectPatch }: NodesViewProps) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-black px-8">
        <div className="flex items-center gap-6">
          <span className="mono text-[10px] uppercase tracking-widest text-[#00FF9C]">
            Документ
          </span>
          <h2 className="mono text-[10px] font-bold uppercase tracking-tight text-white/60">
            {project.title}
          </h2>
        </div>
        <div className="mono text-[8px] uppercase tracking-widest text-white/20">
          Ноди · зв&apos;язки · текст
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <NodeCanvas project={project} onProjectPatch={onProjectPatch} />
      </div>
    </div>
  );
};

export default NodesView;

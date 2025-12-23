import { Project } from "../types/types";

interface NodesViewProps {
  project: Project;
}

const NodesView = ({ project }: NodesViewProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-14 bg-black border-b border-white/5 flex items-center px-8 justify-between z-10">
        <div className="flex items-center gap-6">
          <span className="mono text-[10px] text-[#00FF9C] uppercase tracking-widest">
            Active_Protocol:
          </span>
          <h2 className="mono text-[10px] font-bold uppercase tracking-tight text-white/60">
            {project.title}
          </h2>
        </div>
        <div className="mono text-[8px] text-white/20 uppercase tracking-widest">
          Render: 48.9226° N, 24.7111° E
        </div>
      </div>
      <div className="flex-1 relative">
        {/* <NodeGraph
          nodes={project.nodes}
          links={project.links}
          onUpdate={updateGraph}
        /> */}
      </div>
    </div>
  );
};

export default NodesView;

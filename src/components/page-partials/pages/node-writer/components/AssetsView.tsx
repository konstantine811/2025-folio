import { Project } from "../types/types";

interface AssetsViewProps {
  project: Project;
}

const AssetsView = ({ project }: AssetsViewProps) => {
  return (
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
        {project.images.length === 0 ? (
          <div className="col-span-full py-40 text-center border border-white/5">
            <p className="mono text-[10px] text-white/10 uppercase tracking-[0.5em]">
              Repository currently offline
            </p>
          </div>
        ) : (
          project.images.map((img) => (
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
  );
};

export default AssetsView;

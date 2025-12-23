import { useState } from "react";
import { Project } from "../types/types";

interface PresentationViewProps {
  project: Project;
}

const PresentationView = ({ project }: PresentationViewProps) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="w-full h-full flex flex-col p-12 lg:p-24 bg-black overflow-y-auto">
      <header className="mb-16 flex items-end justify-between max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase">
            Презентація
          </h2>
          <p className="mono text-[9px] text-white/20 uppercase mt-1 tracking-widest">
            Slide {activeSlide + 1} // {project.slides.length}
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
                Math.min(project.slides.length - 1, activeSlide + 1)
              )
            }
            className="px-6 py-2 mono text-[10px] uppercase bg-white text-black hover:bg-[#00FF9C] transition-all disabled:opacity-10"
            disabled={activeSlide === project.slides.length - 1}
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
            {project.slides[activeSlide]?.title}
          </h3>
          <div className="text-2xl lg:text-3xl text-white/30 font-medium uppercase tracking-[0.2em] leading-relaxed italic">
            {project.slides[activeSlide]?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationView;

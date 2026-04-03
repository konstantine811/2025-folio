import { useState } from "react";
import { Project } from "../types/types";

interface PresentationViewProps {
  project: Project;
}

const PresentationView = ({ project }: PresentationViewProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = project.slides;

  if (slides.length === 0) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center bg-black p-12">
        <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tighter">
          Презентація
        </h2>
        <p className="mono max-w-md text-center text-[10px] uppercase leading-relaxed tracking-widest text-white/25">
          Слайдів немає. Ручні документи поки без авто-слайдів — додайте їх у модель
          проєкту або використовуйте вигляд «Текст».
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-black p-12 lg:p-24">
      <header className="mx-auto mb-16 flex w-full max-w-7xl items-end justify-between">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Презентація
          </h2>
          <p className="mono mt-1 text-[9px] uppercase tracking-widest text-white/20">
            Slide {activeSlide + 1} // {slides.length}
          </p>
        </div>
        <div className="flex gap-2 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
            className="mono px-6 py-2 text-[10px] uppercase transition-all hover:bg-white hover:text-black disabled:opacity-10"
            disabled={activeSlide === 0}
          >
            [ Prev ]
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))
            }
            className="mono bg-white px-6 py-2 text-[10px] uppercase text-black transition-all hover:bg-[#00FF9C] disabled:opacity-10"
            disabled={activeSlide === slides.length - 1}
          >
            [ Next ]
          </button>
        </div>
      </header>
      <div className="relative mx-auto flex max-w-7xl w-full flex-1 items-center justify-center overflow-hidden border border-white/10 bg-black p-20">
        <div className="mono absolute top-8 left-8 text-[7px] uppercase tracking-[1em] text-white/5">
          Secure_Video_Stream // DA_OUT
        </div>
        <div className="animate-in fade-in zoom-in-95 max-w-4xl text-center duration-700">
          <h3 className="mb-16 text-7xl font-black leading-none tracking-tighter text-white uppercase italic lg:text-8xl">
            {slides[activeSlide]?.title}
          </h3>
          <div className="text-2xl font-medium leading-relaxed tracking-[0.2em] text-white/30 uppercase italic lg:text-3xl">
            {slides[activeSlide]?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationView;

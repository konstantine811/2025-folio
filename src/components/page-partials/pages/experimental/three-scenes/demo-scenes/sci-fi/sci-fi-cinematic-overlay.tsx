import { RefObject, useEffect, useRef } from "react";

export function SciFiCinematicOverlay({ running, timeRef, onStart, onSkip }: {
  running: boolean;
  timeRef: RefObject<number>;
  onStart: () => void;
  onSkip: () => void;
}) {
  const title = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      const time = timeRef.current;
      const opacity = Math.max(0, Math.min(1, (time - 3) / 1.5, (11 - time) / 2));
      if (title.current) {
        title.current.style.opacity = String(opacity);
        title.current.style.transform = `translateY(${(1 - opacity) * 12}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, timeRef]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      {running ? (
        <div ref={title} style={{ opacity: 0 }} className="pointer-events-none px-6 text-center drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
          <div className="text-xs uppercase tracking-[0.65em] text-cyan-100/80 sm:text-sm">Portfolio</div>
          <div className="my-5 font-serif text-lg italic text-white/70">presents</div>
          <h1 className="text-3xl font-light uppercase tracking-[0.15em] sm:text-5xl">Abramkin Konstantine</h1>
        </div>
      ) : (
        <button onClick={onStart} className="rounded-full border border-cyan-100/30 bg-black/40 px-8 py-4 text-xs uppercase tracking-[0.3em] text-cyan-50 backdrop-blur-sm transition-colors hover:bg-cyan-100/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-100">
          Почати політ
        </button>
      )}
      <button onClick={onSkip} className="absolute bottom-8 right-6 rounded border border-white/20 bg-black/40 px-4 py-2 text-xs tracking-widest text-white/70 transition-colors hover:text-white sm:right-10">Пропустити вступ →</button>
    </div>
  );
}

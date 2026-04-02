export function NodeCanvasToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-black px-6 py-3">
      <span className="mono max-w-2xl text-[9px] leading-relaxed tracking-widest text-white/35 uppercase">
        Малюйте прямокутник на порожньому полі — нова нода. Тягніть з порту —
        старий звʼязок з нього зникає; відпустіть на іншій ноді. Кут змінює
        розмір.
      </span>
    </div>
  );
}

interface CanvasEmptyHintProps {
  visible: boolean;
}

export function CanvasEmptyHint({ visible }: CanvasEmptyHintProps) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute top-1/3 left-1/2 z-[3] -translate-x-1/2 text-center">
      <p className="mono text-[10px] tracking-[0.35em] text-white/15 uppercase">
        Малюйте прямокутник на полі
      </p>
    </div>
  );
}

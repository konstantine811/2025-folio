import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  canMarqueeSelect: boolean;
  marqueeRectLocal: { left: number; top: number; width: number; height: number } | null;
  onStartMarqueeSelection: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

const MarqueeOverlay = ({
  canMarqueeSelect,
  marqueeRectLocal,
  onStartMarqueeSelection,
}: Props) => {
  return (
    <>
      {canMarqueeSelect ? (
        <div
          className="pointer-events-auto absolute inset-0 z-[130] cursor-crosshair"
          onPointerDown={onStartMarqueeSelection}
        />
      ) : null}
      {marqueeRectLocal ? (
        <div
          className="pointer-events-none absolute z-[140] border border-sky-300/80 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_0_28px_rgba(56,189,248,0.2)]"
          style={{
            left: marqueeRectLocal.left,
            top: marqueeRectLocal.top,
            width: marqueeRectLocal.width,
            height: marqueeRectLocal.height,
          }}
        />
      ) : null}
    </>
  );
};

export default MarqueeOverlay;

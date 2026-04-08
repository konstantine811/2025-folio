import type { MinimapData } from "./utils/canvasContent";

type Props = {
  minimap: MinimapData;
};

const MinimapOverlay = ({ minimap }: Props) => {
  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 z-[140] overflow-hidden rounded-lg bg-background/75 p-2 backdrop-blur-sm"
      style={{ width: minimap.mapW + 16, height: minimap.mapH + 16 }}
      aria-hidden
    >
      <div
        className="relative overflow-hidden rounded-md bg-zinc-100/10 dark:bg-zinc-950/10"
        style={{ width: minimap.mapW, height: minimap.mapH }}
      >
        {minimap.items.map((item) => {
          const p = minimap.toMap(item.x, item.y);
          return (
            <div
              key={`${item.kind}-${item.id}`}
              className={`absolute rounded-[2px] border  ${
                item.kind === "image"
                  ? "border-accent/60 bg-green-400/12"
                  : "border-green-400/65 bg-emerald-500/11"
              }`}
              style={{
                left: p.x,
                top: p.y,
                width: Math.max(2, item.width * minimap.scale),
                height: Math.max(2, item.height * minimap.scale),
              }}
            />
          );
        })}
        <div
          className="absolute rounded-[3px] border border-zinc-700/30 bg-zinc-500/5 shadow-[0_0_0_1px_rgba(24,24,27,0.2)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.22)]"
          style={{
            left: minimap.viewRect.left,
            top: minimap.viewRect.top,
            width: minimap.viewRect.width,
            height: minimap.viewRect.height,
          }}
        />
      </div>
    </div>
  );
};

export default MinimapOverlay;

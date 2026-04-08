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
                  ? "border-accent/30 bg-green-400/3"
                  : "border-green-400/30 bg-emerald-500/3"
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
          className="absolute rounded-[3px] border border-border/30 bg-zinc-500/3 dark:border-white/10 dark:bg-white/5"
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

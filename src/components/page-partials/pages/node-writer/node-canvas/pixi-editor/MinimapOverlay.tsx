import type { MinimapData } from "./utils/canvasContent";

type Props = {
  minimap: MinimapData;
  isMobile?: boolean;
};

const MinimapOverlay = ({ minimap, isMobile = false }: Props) => {
  const mapScale = isMobile ? 0.72 : 1;
  const padding = isMobile ? 6 : 8;
  const mapWidth = minimap.mapW * mapScale;
  const mapHeight = minimap.mapH * mapScale;

  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 z-[140] overflow-hidden rounded-lg bg-background/75 p-2 backdrop-blur-sm"
      style={{ width: mapWidth + padding * 2, height: mapHeight + padding * 2, padding }}
      aria-hidden
    >
      <div
        className="relative overflow-hidden rounded-md bg-zinc-100/10 dark:bg-zinc-950/10"
        style={{ width: mapWidth, height: mapHeight }}
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
                left: p.x * mapScale,
                top: p.y * mapScale,
                width: Math.max(2, item.width * minimap.scale * mapScale),
                height: Math.max(2, item.height * minimap.scale * mapScale),
              }}
            />
          );
        })}
        <div
          className="absolute rounded-[3px] border border-border/30 bg-zinc-500/3 dark:border-white/10 dark:bg-white/5"
          style={{
            left: minimap.viewRect.left * mapScale,
            top: minimap.viewRect.top * mapScale,
            width: minimap.viewRect.width * mapScale,
            height: minimap.viewRect.height * mapScale,
          }}
        />
      </div>
    </div>
  );
};

export default MinimapOverlay;

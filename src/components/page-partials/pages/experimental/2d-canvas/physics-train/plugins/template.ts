import { SketchPlugin } from "@components/page-partials/pages/experimental/2d-canvas/2d-sketch/init";

export function GraphPlugin(): SketchPlugin {
  let disposed = false;

  return {
    id: "graph",
    name: "Graph",
    mount() {},
    frame() {
      if (disposed) return;
      // статичний — нічого в кадрі не робить
    },
    onResize() {},
    dispose() {
      disposed = true;
      // тут можна звільнити ресурси
    },
  };
}

import { SketchPlugin } from "../../2d-sketch/init";

export function GridPlugin(cell = 50): SketchPlugin {
  let disposed = false;

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (disposed) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";

    for (let x = 0; x <= canvas.width; x += cell) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += cell) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.width, y + 0.5);
      ctx.stroke();
    }
  };
  return {
    id: "grid",
    name: "Grid",
    mount(ctx, canvas) {
      draw(ctx, canvas);
    },
    frame() {
      if (disposed) return;
      // статичний — нічого в кадрі не робить
    },
    onResize(ctx, canvas) {
      draw(ctx, canvas);
    },
    dispose() {
      disposed = true;
    },
  };
}

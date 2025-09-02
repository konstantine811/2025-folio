import { SketchPlugin } from "../../2d-sketch/init";

export function BouncingBall(): SketchPlugin {
  let disposed = false;
  let x = 100,
    y = 100,
    vx = 220,
    vy = 170;
  const r = 20;

  return {
    id: "ball",
    name: "BouncingBall",
    mount() {
      // нічого особливого
    },
    frame(ctx, canvas, dt) {
      if (disposed) return;
      // оновлення
      x += vx * dt;
      y += vy * dt;

      if (x - r < 0) {
        x = r;
        vx *= -1;
      }
      if (x + r > canvas.width) {
        x = canvas.width - r;
        vx *= -1;
      }
      if (y - r < 0) {
        y = r;
        vy *= -1;
      }
      if (y + r > canvas.height) {
        y = canvas.height - r;
        vy *= -1;
      }

      // рендер
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
      ctx.fill();
    },
    dispose() {
      disposed = true;
    },
  };
}

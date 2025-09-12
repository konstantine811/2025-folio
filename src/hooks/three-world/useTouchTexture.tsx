import { useCallback, useEffect, useMemo, useRef } from "react";
import { LinearFilter, RGBAFormat, Texture } from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";

interface Point {
  x: number;
  y: number;
  ageSec: number;
  force: number;
}

const useTouchTexture = ({
  size,
  isTest = false,
  persist = false,
  maxAgeSec = 5.0, // довший слід (було 3)
  radius = 0.03, // у UV; для "вікна" 200м це ≈ 6м (тюнь під свій масштаб)
  fadeInFrac = 0.1, // коротший фейд-ін
  darkenPerFrame = 0.02, // повільне затемнення 2%/кадр замість повного clear
  minAlpha = 0.35, // НЕ давати альфі падати нижче
  additive = true,
}: {
  size: number;
  isTest?: boolean;
  persist?: boolean;
  maxAgeSec?: number;
  radius?: number;
  fadeInFrac?: number;
  darkenPerFrame?: number;
  minAlpha?: number;
  additive?: boolean;
}) => {
  const canvasEl = useMemo(() => document.createElement("canvas"), []);
  const ctx = useMemo(() => canvasEl.getContext("2d"), [canvasEl]);
  const textureRef = useRef<Texture>(new Texture(canvasEl));
  textureRef.current.minFilter = LinearFilter;
  textureRef.current.magFilter = LinearFilter;
  textureRef.current.format = RGBAFormat;
  textureRef.current.needsUpdate = true;

  const trail = useRef<Point[]>([]);
  useEffect(() => {
    canvasEl.width = canvasEl.height = size;
    if (isTest) {
      canvasEl.style.position = "absolute";
      canvasEl.style.top = "57px";
      canvasEl.style.left = "0";
      canvasEl.style.zIndex = "9999";
      canvasEl.style.width = `${size}px`;
      canvasEl.style.height = `${size}px`;
      canvasEl.style.pointerEvents = "none";
      canvasEl.style.border = "1px solid #291515";
      document.body.appendChild(canvasEl);
    }
    if (ctx) {
      // ctx.fillStyle = "black";
      ctx.fillRect(0, 0, size, size);
    }
    return () => {
      if (isTest) {
        document.body.removeChild(canvasEl);
      }
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
      }
    };
  }, [size, canvasEl, ctx, isTest]);

  useFrame((_, dt) => {
    update(dt);
  });

  const clear = () => {
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
  };

  const drawTouch = (point: Point) => {
    if (!ctx) return;

    const pos = { x: point.x * size, y: (1 - point.y) * size };

    // альфа-фейд у часі
    let alpha = 1;
    if (!persist) {
      const fi = Math.max(1e-6, maxAgeSec * fadeInFrac);
      if (point.ageSec < fi) {
        const k = Math.min(1, point.ageSec / fi);
        alpha = k * k * (3 - 2 * k); // smoothstep in
      } else {
        const rem = Math.max(1e-6, maxAgeSec - fi);
        const k = Math.min(1, (point.ageSec - fi) / rem);
        alpha = 1 - k * k * (3 - 2 * k); // smoothstep out
      }
      // force тепер тільки підсилює, але не зводить до нуля
      const f = Math.min(1, Math.max(0, point.force));
      alpha *= minAlpha + (1 - minAlpha) * f;
    }

    const rPx = size * radius;

    // аддитивне накладання — плями «накопичуються»
    ctx.save();
    ctx.globalCompositeOperation = additive ? "lighter" : "source-over";
    ctx.globalAlpha = alpha;

    const grd = ctx.createRadialGradient(
      pos.x,
      pos.y,
      rPx * 0.2,
      pos.x,
      pos.y,
      rPx
    );
    grd.addColorStop(0, `rgba(255,255,255,1.0)`);
    grd.addColorStop(1, `rgba(255,255,255,0.0)`);

    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(pos.x, pos.y, rPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const update = (dt: number) => {
    if (!ctx) return;

    // Замість тотального clear — м'яке затемнення (afterglow)
    if (!persist) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = darkenPerFrame; // 2% згасання/кадр
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }

    // старіння у секундах
    trail.current = trail.current.filter((p) => {
      if (!persist) p.ageSec += dt;
      return persist || p.ageSec <= maxAgeSec;
    });

    // перемальовуємо всі точки
    trail.current.forEach(drawTouch);
    textureRef.current.needsUpdate = true;
  };

  const addTouch = useCallback(
    (point: { x: number; y: number }) => {
      // force від швидкості руху точки (у UV). Робимо «чутливішим».
      let force = 1;
      if (!persist) {
        const last = trail.current[trail.current.length - 1];
        if (last) {
          const dx = last.x - point.x;
          const dy = last.y - point.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          // масштабуй чутливість: 0..~1
          force = Math.min(1, d * 80); // було *10000 по d^2 — надто нестабільно
        }
      }
      trail.current.push({ ...point, ageSec: 0, force });
    },
    [persist]
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.uv) {
        const { x, y } = e.uv;
        addTouch({ x, y });
      }
    },
    [addTouch]
  );

  const saveAsDataURL = useCallback(
    (filename = "touchTexture.png", download = true) => {
      const dataURL = canvasEl.toDataURL("image/png");
      if (download) {
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = filename;
        a.click();
      }
      return dataURL;
    },
    [canvasEl]
  );

  return {
    texture: textureRef.current,
    onPointerMove,
    saveAsDataURL,
    clear,
    addTouch,
  };
};

export default useTouchTexture;

import { useCallback, useEffect, useMemo, useRef } from "react";
import { LinearFilter, RGBAFormat, Texture } from "three";
import { easeInOutQuad } from "@services/anim-util";
import { ThreeEvent, useFrame } from "@react-three/fiber";

interface Point {
  x: number;
  y: number;
  age: number;
  force: number;
}

const useTouchTexture = ({
  size,
  isTest = false,
  persist = false,
  maxAge = 100,
  radius = 0.1,
}: {
  size: number;
  isTest?: boolean;
  persist?: boolean;
  maxAge?: number;
  radius?: number;
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

  useFrame(() => {
    update();
  });

  const clear = () => {
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
  };

  const drawTouch = (point: Point) => {
    if (!ctx) return;

    // it's if we listen global gl.domElement
    // const pos = {
    //   x: ((point.x + 1) / 2) * size,
    //   y: ((1 - point.y) / 2) * size,
    // };

    const pos = {
      x: point.x * size,
      y: (1 - point.y) * size,
    };

    let intensity = 1;
    if (!persist) {
      if (point.age < maxAge * 0.3) {
        intensity = easeInOutQuad(point.age / (maxAge * 0.33), 0.43, 0.5, 0.8);
      } else {
        intensity = easeInOutQuad(
          1 - (point.age - maxAge * 0.1) / (maxAge * 1.0),
          0,
          1,
          1
        );
      }
      intensity *= point.force;
    }

    const r = size * radius * intensity;

    const grd = ctx.createRadialGradient(
      pos.x,
      pos.y,
      r * 0.25,
      pos.x,
      pos.y,
      r
    );
    grd.addColorStop(0, `rgba(255,255,255,1.0)`);
    grd.addColorStop(1, `rgba(255,255, 255,1.0)`);

    ctx.beginPath();
    ctx.fillStyle = grd;
    // ctx.rect(pos.x - r, pos.y - r, r * 2, r * 2);
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const update = () => {
    if (!persist) clear();

    trail.current = trail.current.filter((point) => {
      if (!persist) point.age++;
      return persist || point.age <= maxAge;
    });

    trail.current.forEach(drawTouch);
    textureRef.current.needsUpdate = true;
  };

  const addTouch = useCallback(
    (point: { x: number; y: number }) => {
      let force = 1;
      if (!persist) {
        const last = trail.current[trail.current.length - 1];
        if (last) {
          const dx = last.x - point.x;
          const dy = last.y - point.y;
          const dd = dx * dx + dy * dy;
          force = Math.min(dd * 10000, 1);
        }
      }
      trail.current.push({ ...point, age: 0, force });
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

  return { texture: textureRef.current, onPointerMove, saveAsDataURL, clear };
};

export default useTouchTexture;

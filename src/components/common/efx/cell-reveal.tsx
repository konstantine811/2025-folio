import CanvasOverlay from "@components/common/canvas-overlay";
import { IThemeColors, ThemePalette } from "@config/theme-colors.config";
import { useSprings } from "@react-spring/web";
import { useThemeStore } from "@storage/themeStore";
import { useCallback, useEffect, useRef, useState } from "react";

interface Cell {
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const CellReveal = ({
  rows = 15,
  columns = 15,
  show = true,
  duration = 300,
  delayPerPixel = 1.5,
  mixBlend = false,
  offsetTop = 0,
  zIndex = 10,
  color = "card",
  invertRipple = true,
}: {
  rows?: number;
  columns?: number;
  show?: boolean;
  duration?: number;
  delayPerPixel?: number;
  mixBlend?: boolean;
  offsetTop?: number;
  zIndex?: number;
  color?: keyof IThemeColors;
  invertRipple?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const [cells, setCells] = useState<Cell[]>([]);

  const onCanvasResize = useCallback(() => {
    const cells = [];
    const cellWidth = window.innerWidth / columns;
    const cellHeight = (window.innerHeight - offsetTop) / rows;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        cells.push({
          row,
          column,
          x: column * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      }
    }
    setCells(cells);
  }, [columns, rows, offsetTop]);

  const [springs, api] = useSprings(cells.length, () => ({
    scale: show ? 1 : 0,
    opacity: show ? 1 : 0,
  }));

  useEffect(() => {
    const centerX = window.innerWidth / 2;
    const centerY = (window.innerHeight - offsetTop) / 2;

    const distances = cells.map((cell) => {
      const cx = cell.x + cell.width / 2;
      const cy = cell.y + cell.height / 2;
      const dx = cx - centerX;
      const dy = cy - centerY;
      return Math.sqrt(dx * dx + dy * dy);
    });

    const maxDistance = Math.max(...distances);

    api.start((i) => {
      const cell = cells[i];
      const cx = cell.x + cell.width / 2;
      const cy = cell.y + cell.height / 2;
      const dx = cx - centerX;
      const dy = cy - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const delay = invertRipple
        ? (maxDistance - distance) * delayPerPixel
        : distance * delayPerPixel;

      return {
        scale: show ? 1 : 0,
        opacity: show ? 1 : 0,
        config: { bounce: 10 },
        delay,
      };
    });
  }, [show, api, cells, duration, delayPerPixel, offsetTop, invertRipple]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight - offsetTop);

      springs.forEach((spring, i) => {
        const { scale, opacity } = spring;
        const s = scale.get();
        const o = opacity.get();
        if (o <= 0) return;

        const cell = cells[i];
        const w = cell.width * s;
        const h = cell.height * s;
        const cx = cell.x + cell.width / 2;
        const cy = cell.y + cell.height / 2;

        ctx.globalAlpha = o;
        ctx.fillStyle = ThemePalette[selectedTheme][color] as string;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.globalAlpha = 1.0;
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [springs, cells, selectedTheme, offsetTop, color]);

  return (
    <CanvasOverlay
      ref={canvasRef}
      callbackResize={onCanvasResize}
      mixBlend={mixBlend}
      offsetTop={offsetTop}
      zIndex={zIndex}
    />
  );
};

export default CellReveal;

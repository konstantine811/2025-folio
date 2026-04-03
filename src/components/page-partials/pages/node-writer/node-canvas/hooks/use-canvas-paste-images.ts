import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import type { CanvasImageItem } from "../../types/types";
import {
  PASTED_IMAGE_MAX_SIDE,
  PASTED_IMAGE_MIN_SIDE,
} from "../constants";
import {
  activeElementAllowsCanvasShortcuts,
  isKeyboardTypingTarget,
} from "../utils/canvas-keyboard";
import { newCanvasImageId } from "../utils/node-ids";

function computeDisplaySize(nw: number, nh: number): { w: number; h: number } {
  let w = nw;
  let h = nh;
  if (w > PASTED_IMAGE_MAX_SIDE || h > PASTED_IMAGE_MAX_SIDE) {
    const r = Math.min(PASTED_IMAGE_MAX_SIDE / w, PASTED_IMAGE_MAX_SIDE / h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  w = Math.max(PASTED_IMAGE_MIN_SIDE, w);
  h = Math.max(PASTED_IMAGE_MIN_SIDE, h);
  return { w, h };
}

/** Ctrl+V: вставка зображення з буфера в центр видимої області полотна. */
export function useCanvasPasteImages(opts: {
  scrollRef: RefObject<HTMLDivElement | null>;
  scaleRef: RefObject<number>;
  /** `file` — те саме джерело, що й `item.url` (blob); потрібне для негайного upload у Storage. */
  onImagePasted: (item: CanvasImageItem, file: File) => void;
  /** Якщо false — слухач paste не підключається. */
  enabled?: boolean;
}) {
  const { scrollRef, scaleRef, onImagePasted, enabled = true } = opts;
  const onPastedRef = useRef(onImagePasted);
  onPastedRef.current = onImagePasted;

  useEffect(() => {
    if (!enabled) return;
    const onPaste = (e: ClipboardEvent) => {
      if (isKeyboardTypingTarget(e.target)) return;
      if (!activeElementAllowsCanvasShortcuts(scrollRef.current)) return;

      const items = e.clipboardData?.items;
      if (!items?.length) return;

      let file: File | null = null;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          file = it.getAsFile();
          break;
        }
      }
      if (!file) return;

      e.preventDefault();
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scroll = scrollRef.current;
        const s = Math.max(scaleRef.current, 0.01);
        if (!scroll) {
          URL.revokeObjectURL(url);
          return;
        }
        const { w, h } = computeDisplaySize(img.naturalWidth, img.naturalHeight);
        const cx = scroll.scrollLeft + scroll.clientWidth / 2;
        const cy = scroll.scrollTop + scroll.clientHeight / 2;
        const x = Math.max(0, cx / s - w / 2);
        const y = Math.max(0, cy / s - h / 2);
        onPastedRef.current(
          {
            id: newCanvasImageId(),
            x,
            y,
            width: w,
            height: h,
            url,
          },
          file,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [scrollRef, scaleRef, enabled]);
}

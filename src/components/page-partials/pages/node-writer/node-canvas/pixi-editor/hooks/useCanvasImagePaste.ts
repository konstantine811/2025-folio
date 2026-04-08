import { useEffect } from "react";
import type { RefObject } from "react";
import type { Viewport } from "pixi-viewport";
import type { ProjectPatchFn } from "../../../types/types";
import { PASTED_IMAGE_MAX_SIDE, PASTED_IMAGE_MIN_SIDE } from "../../constants";
import {
  activeElementAllowsCanvasShortcuts,
  isKeyboardTypingTarget,
} from "../../utils/canvas-keyboard";
import { newCanvasImageId } from "../../utils/node-ids";
import { NODE_WRITER_WORKSPACE_SCOPE } from "@/config/node-writer-access.config";
import { uploadNodeWriterCanvasPastedFile } from "@/services/firebase/node-writer-workspace";

type Params = {
  projectId: string;
  readOnly: boolean;
  viewport: Viewport | null;
  shortcutShellRef?: RefObject<HTMLElement | null>;
  onProjectPatch: (fn: ProjectPatchFn) => void;
};

function computePastedImageDisplaySize(nw: number, nh: number) {
  let w = nw;
  let h = nh;
  if (w > PASTED_IMAGE_MAX_SIDE || h > PASTED_IMAGE_MAX_SIDE) {
    const r = Math.min(PASTED_IMAGE_MAX_SIDE / w, PASTED_IMAGE_MAX_SIDE / h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  const scaleUp = Math.max(
    PASTED_IMAGE_MIN_SIDE / w,
    PASTED_IMAGE_MIN_SIDE / h,
  );
  if (scaleUp > 1) {
    w = Math.round(w * scaleUp);
    h = Math.round(h * scaleUp);
  }
  return { w, h };
}

export function useCanvasImagePaste({
  projectId,
  readOnly,
  viewport,
  shortcutShellRef,
  onProjectPatch,
}: Params) {
  useEffect(() => {
    if (readOnly || !viewport) return;

    const onPaste = (event: ClipboardEvent) => {
      if (isKeyboardTypingTarget(event.target)) return;
      if (
        !activeElementAllowsCanvasShortcuts(
          null,
          shortcutShellRef?.current ?? null,
        )
      ) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items?.length) return;

      let file: File | null = null;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          file = item.getAsFile();
          break;
        }
      }
      if (!file) return;

      event.preventDefault();

      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const { w, h } = computePastedImageDisplaySize(
          img.naturalWidth || PASTED_IMAGE_MIN_SIDE,
          img.naturalHeight || PASTED_IMAGE_MIN_SIDE,
        );
        const aspectRatio =
          img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1;
        const itemId = newCanvasImageId();
        const x = (viewport.center?.x ?? 0) - w / 2;
        const y = (viewport.center?.y ?? 0) - h / 2;

        onProjectPatch((prev) => ({
          ...prev,
          canvasImages: [
            ...(prev.canvasImages ?? []),
            {
              id: itemId,
              x,
              y,
              width: w,
              height: h,
              aspectRatio,
              url: blobUrl,
            },
          ],
        }));

        void uploadNodeWriterCanvasPastedFile(
          NODE_WRITER_WORKSPACE_SCOPE,
          projectId,
          itemId,
          file,
        )
          .then((httpsUrl) => {
            onProjectPatch((prev) => {
              if (prev.id !== projectId) return prev;
              const list = prev.canvasImages ?? [];
              if (!list.some((i) => i.id === itemId)) return prev;
              const image = list.find((i) => i.id === itemId);
              const oldUrl = image?.url ?? "";
              if (oldUrl.startsWith("blob:")) {
                try {
                  URL.revokeObjectURL(oldUrl);
                } catch {
                  // ignore
                }
              }
              return {
                ...prev,
                canvasImages: list.map((i) =>
                  i.id === itemId ? { ...i, url: httpsUrl } : i,
                ),
              };
            });
          })
          .catch((error) => {
            console.error(
              "[Node writer pixi] Не вдалося завантажити вставлене зображення в Storage",
              error,
            );
          });
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
      };
      img.src = blobUrl;
    };

    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, [onProjectPatch, projectId, readOnly, shortcutShellRef, viewport]);
}

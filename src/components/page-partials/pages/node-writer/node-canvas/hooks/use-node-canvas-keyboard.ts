import type { RefObject } from "react";
import { useEffect } from "react";
import {
  activeElementAllowsCanvasShortcuts,
  isKeyboardTypingTarget,
} from "../utils/canvas-keyboard";

export function useNodeCanvasKeyboard(opts: {
  scrollRef: RefObject<HTMLDivElement | null>;
  shortcutShellRef?: RefObject<HTMLElement | null>;
  fitViewToNodes: () => void;
  setTabPanArmed: (armed: boolean) => void;
}) {
  const { scrollRef, shortcutShellRef, fitViewToNodes, setTabPanArmed } = opts;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isKeyboardTypingTarget(e.target)) return;
      if (
        !activeElementAllowsCanvasShortcuts(
          scrollRef.current,
          shortcutShellRef?.current ?? null,
        )
      )
        return;

      if (
        e.code === "Slash" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        if (e.repeat) return;
        e.preventDefault();
        fitViewToNodes();
        return;
      }

      if (e.code !== "Tab") return;
      e.preventDefault();
      setTabPanArmed(true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Tab") return;
      setTabPanArmed(false);
    };

    const onWindowBlur = () => setTabPanArmed(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [scrollRef, shortcutShellRef, fitViewToNodes, setTabPanArmed]);
}

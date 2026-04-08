import { useCallback, useEffect, useRef } from "react";
import type { Project, ProjectPatchFn } from "../../../types/types";

const UNDO_STACK_MAX = 120;
const UNDO_DEBOUNCE_MS = 280;

type UseProjectHistoryParams = {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
};

export function useProjectHistory({
  project,
  onProjectPatch,
}: UseProjectHistoryParams) {
  const projectRef = useRef(project);
  const undoPastRef = useRef<Project[]>([]);
  const undoFutureRef = useRef<Project[]>([]);
  const burstRef = useRef<{
    snapshot: Project | null;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ snapshot: null, timer: null });
  const replayingHistoryRef = useRef(false);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    undoPastRef.current = [];
    undoFutureRef.current = [];
    if (burstRef.current.timer) {
      clearTimeout(burstRef.current.timer);
    }
    burstRef.current = { snapshot: null, timer: null };
  }, [project.id]);

  useEffect(() => {
    return () => {
      if (burstRef.current.timer) {
        clearTimeout(burstRef.current.timer);
      }
    };
  }, []);

  const pushPastSnapshot = useCallback((snapshot: Project) => {
    undoPastRef.current.push(snapshot);
    if (undoPastRef.current.length > UNDO_STACK_MAX) {
      undoPastRef.current.shift();
    }
  }, []);

  const flushBurstSnapshot = useCallback(() => {
    if (burstRef.current.timer) {
      clearTimeout(burstRef.current.timer);
      burstRef.current.timer = null;
    }
    const snap = burstRef.current.snapshot;
    if (!snap) return;
    if (snap !== projectRef.current) {
      pushPastSnapshot(snap);
    }
    burstRef.current.snapshot = null;
  }, [pushPastSnapshot]);

  const patchWithHistory = useCallback(
    (fn: ProjectPatchFn) => {
      const current = projectRef.current;
      const next = fn(current);
      if (next === current) return;

      if (!replayingHistoryRef.current) {
        if (!burstRef.current.snapshot) {
          burstRef.current.snapshot = current;
          undoFutureRef.current = [];
        }
        if (burstRef.current.timer) {
          clearTimeout(burstRef.current.timer);
        }
        burstRef.current.timer = setTimeout(() => {
          const snap = burstRef.current.snapshot;
          if (snap && snap !== projectRef.current) {
            pushPastSnapshot(snap);
          }
          burstRef.current = { snapshot: null, timer: null };
        }, UNDO_DEBOUNCE_MS);
      }

      onProjectPatch(() => next);
      projectRef.current = next;
    },
    [onProjectPatch, pushPastSnapshot],
  );

  const performUndo = useCallback(() => {
    flushBurstSnapshot();
    if (undoPastRef.current.length === 0) return false;
    const prev = undoPastRef.current.pop()!;
    const cur = projectRef.current;
    undoFutureRef.current.push(cur);
    if (undoFutureRef.current.length > UNDO_STACK_MAX) {
      undoFutureRef.current.shift();
    }
    replayingHistoryRef.current = true;
    onProjectPatch(() => prev);
    replayingHistoryRef.current = false;
    projectRef.current = prev;
    return true;
  }, [flushBurstSnapshot, onProjectPatch]);

  const performRedo = useCallback(() => {
    flushBurstSnapshot();
    if (undoFutureRef.current.length === 0) return false;
    const next = undoFutureRef.current.pop()!;
    const cur = projectRef.current;
    pushPastSnapshot(cur);
    replayingHistoryRef.current = true;
    onProjectPatch(() => next);
    replayingHistoryRef.current = false;
    projectRef.current = next;
    return true;
  }, [flushBurstSnapshot, onProjectPatch, pushPastSnapshot]);

  return {
    patchWithHistory,
    performUndo,
    performRedo,
  };
}

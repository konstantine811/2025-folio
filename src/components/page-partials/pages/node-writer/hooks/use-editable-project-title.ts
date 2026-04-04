import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ProjectPatchFn } from "../types/types";

export function useEditableProjectTitle(
  projectTitle: string,
  onProjectPatch: (fn: ProjectPatchFn) => void,
) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(projectTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingTitle) setDraftTitle(projectTitle);
  }, [projectTitle, editingTitle]);

  useLayoutEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (!editingTitle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setDraftTitle(projectTitle);
        setEditingTitle(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingTitle, projectTitle]);

  const commitTitle = useCallback(() => {
    const t = draftTitle.trim();
    if (t) {
      onProjectPatch((p) => ({
        ...p,
        title: t,
        lastModified: Date.now(),
      }));
    } else {
      setDraftTitle(projectTitle);
    }
    setEditingTitle(false);
  }, [draftTitle, onProjectPatch, projectTitle]);

  return {
    editingTitle,
    setEditingTitle,
    draftTitle,
    setDraftTitle,
    titleInputRef,
    commitTitle,
  };
}

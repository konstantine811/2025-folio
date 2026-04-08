import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Viewport } from "pixi-viewport";

import { NodeId } from "../shared/types";

type EditorState = {
  selectedNodeId: NodeId | null;
  selectedCanvasImageId: string | null;
  editingNodeId: NodeId | null;
  editingCanvasImageId: string | null;
  viewport: Viewport | null;
  viewportVersion: number;
  selectNode: (id: NodeId | null) => void;
  selectCanvasImage: (id: string | null) => void;
  startEditingNode: (id: NodeId) => void;
  startEditingCanvasImage: (id: string) => void;
  stopEditing: () => void;
  setViewport: (viewport: Viewport | null) => void;
  bumpViewportVersion: () => void;
  clearSelection: () => void;
};

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    selectedNodeId: null,
    selectedCanvasImageId: null,
    editingNodeId: null,
    editingCanvasImageId: null,
    viewport: null,
    viewportVersion: 0,
    selectNode: (id) =>
      set((state) => {
        state.selectedNodeId = id;
        state.selectedCanvasImageId = null;
      }),
    selectCanvasImage: (id) =>
      set((state) => {
        state.selectedCanvasImageId = id;
        state.selectedNodeId = null;
      }),
    startEditingNode: (id) =>
      set((state) => {
        state.selectedNodeId = id;
        state.selectedCanvasImageId = null;
        state.editingNodeId = id;
        state.editingCanvasImageId = null;
      }),
    startEditingCanvasImage: (id) =>
      set((state) => {
        state.selectedCanvasImageId = id;
        state.selectedNodeId = null;
        state.editingCanvasImageId = id;
        state.editingNodeId = null;
      }),
    stopEditing: () =>
      set((state) => {
        state.editingNodeId = null;
        state.editingCanvasImageId = null;
      }),
    setViewport: (viewport) =>
      set((state) => {
        state.viewport = viewport as typeof state.viewport;
      }),
    bumpViewportVersion: () =>
      set((state) => {
        state.viewportVersion += 1;
      }),
    clearSelection: () =>
      set((state) => {
        state.selectedNodeId = null;
        state.selectedCanvasImageId = null;
        state.editingNodeId = null;
        state.editingCanvasImageId = null;
      }),
  })),
);

import { VFXSettings } from "@/types/three/vfx-particles.model";
import { create } from "zustand";

type emitter = (params: VFXSettings) => void;

interface VFXState {
  emitters: Record<string, emitter>;
  registerEmitter: (name: string, emitter: emitter) => void;
  unRegisterEmitter: (name: string) => void;
  emit: (name: string, params: VFXSettings) => void;
}

export const useVFXStore = create<VFXState>((set, get) => ({
  emitters: {},
  registerEmitter: (name, emitter) => {
    if (get().emitters[name]) {
      console.error(`Emitter ${name} already exists`);
      return;
    }
    set((state) => {
      state.emitters[name] = emitter;
      return state;
    });
  },
  unRegisterEmitter: (name) => {
    set((state) => {
      delete state.emitters[name];
      return state;
    });
  },
  emit: (name, ...params) => {
    const emitter = get().emitters[name];
    if (!emitter) {
      console.error(`Emitter ${name} not found`);
      return;
    }
    emitter(...params);
  },
}));

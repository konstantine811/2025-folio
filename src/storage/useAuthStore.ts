import { create } from "zustand";
import { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  sessionVersion: number;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionVersion: 0,
  setUser: (user) =>
    set((s) => ({ user, sessionVersion: s.sessionVersion + 1 })),
  logout: () => set({ user: null }),
}));

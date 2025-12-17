import { create } from "zustand";

interface ScopedNavMenuState {
  scopes: Record<string, { isOpen: boolean }>;
  setScopeOpen: (scopeId: string, status: boolean) => void;
}

export const useScopedNavMenuStore = create<ScopedNavMenuState>((set) => ({
  scopes: {},
  setScopeOpen: (scopeId: string, status: boolean) => {
    set((state) => ({
      scopes: {
        ...state.scopes,
        [scopeId]: {
          isOpen: status,
        },
      },
    }));
  },
}));

// Helper hook for easier usage with a specific scope
export const useNavMenuScope = (scopeId: string) => {
  const isOpen = useScopedNavMenuStore(
    (state) => state.scopes[scopeId]?.isOpen ?? false
  );
  const setScopeOpen = useScopedNavMenuStore((state) => state.setScopeOpen);

  return {
    isOpen,
    setOpen: (status: boolean) => setScopeOpen(scopeId, status),
  };
};

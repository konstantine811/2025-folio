import { createContext } from "react";

interface ModelLoadingContextProps {
  isModelLoaded: boolean;
  setIsModelLoaded: (loaded: boolean) => void;
}

export const ModelLoadingContext =
  createContext<ModelLoadingContextProps | null>(null);


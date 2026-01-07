import { useContext } from "react";
import { ModelLoadingContext } from "./model-loading-context";

export const useModelLoading = () => {
  const context = useContext(ModelLoadingContext);
  if (!context) {
    throw new Error(
      "useModelLoading must be used within a ModelLoadingProvider"
    );
  }
  return context;
};


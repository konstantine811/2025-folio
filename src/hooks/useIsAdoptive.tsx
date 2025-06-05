import { BreakPoints } from "@/config/adaptive.config";
import { useWindowSizeStore } from "@/storage/windowSizeStore";

export function useIsAdoptive(size = BreakPoints.md) {
  const screenWidth = useWindowSizeStore((state) => state.screenWidth);
  return {
    screenWidth,
    isAdoptiveSize: screenWidth <= size,
  };
}

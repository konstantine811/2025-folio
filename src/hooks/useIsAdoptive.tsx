import { BreakPoints } from "@/config/adaptive.config";
import { useEffect, useState } from "react";

export function useIsAdoptive(size = BreakPoints.md): boolean {
  const [isAdoptiveSize, setIsAdoptiveSize] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth <= size;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsAdoptiveSize(window.innerWidth <= size);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  return isAdoptiveSize;
}

import { BreakPoints } from "@/config/adaptive.config";
import { useEffect, useState } from "react";

export function useIsAdoptive(size = BreakPoints.md) {
  const [isAdoptiveSize, setIsAdoptiveSize] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth <= size;
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsAdoptiveSize(window.innerWidth <= size);
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  return { isAdoptiveSize, screenWidth };
}

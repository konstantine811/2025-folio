// hooks/useProgressMV.ts
import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useScrollStore } from "../store/useScrollStore";

export function useProgressMV() {
  const progress = useScrollStore((s) => s.progress);
  const mv = useMotionValue(progress);
  useEffect(() => mv.set(progress), [mv, progress]);
  // трохи згладжуємо "ривки"
  const smooth = useSpring(mv, { stiffness: 120, damping: 20, mass: 0.7 });
  return smooth;
}

import { useLayoutEffect, useRef } from "react";

export function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // скидаємо висоту, потім встановлюємо по контенту
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  return ref;
}

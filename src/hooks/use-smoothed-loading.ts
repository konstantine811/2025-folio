import { useEffect, useRef, useState } from "react";

type Options = {
  /** Не показувати індикатор, якщо завантаження скінчилось раніше (мс). */
  showAfterMs?: number;
  /** Якщо вже показали — тримати щонайменше стільки (мс), щоб не «блимало». */
  minVisibleMs?: number;
};

/**
 * Згладжує короткі сплески loading: не показує прелоадер при дуже швидкому завантаженні
 * і не ховає його миттєво після появи.
 */
export function useSmoothedLoading(
  loading: boolean,
  { showAfterMs = 240, minVisibleMs = 450 }: Options = {},
): boolean {
  const [show, setShow] = useState(false);
  const loadingRef = useRef(loading);
  const visibleRef = useRef(false);
  const shownAtRef = useRef<number | null>(null);

  loadingRef.current = loading;

  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    if (loading) {
      if (visibleRef.current) {
        setShow(true);
        return;
      }
      showTimer = window.setTimeout(() => {
        if (!loadingRef.current) return;
        visibleRef.current = true;
        shownAtRef.current = Date.now();
        setShow(true);
      }, showAfterMs);
    } else if (visibleRef.current) {
      const elapsed = shownAtRef.current
        ? Date.now() - shownAtRef.current
        : 0;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      hideTimer = window.setTimeout(() => {
        visibleRef.current = false;
        shownAtRef.current = null;
        setShow(false);
      }, remaining);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [loading, showAfterMs, minVisibleMs]);

  return show;
}

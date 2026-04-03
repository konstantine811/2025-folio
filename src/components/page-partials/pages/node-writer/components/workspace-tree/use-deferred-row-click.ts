import { useCallback, useEffect, useRef } from "react";

export function useDeferredRowClick(delayMs: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPending(), [clearPending]);

  const schedule = useCallback(
    (action: () => void) => {
      clearPending();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        action();
      }, delayMs);
    },
    [clearPending, delayMs],
  );

  return { schedule, clearPending };
}

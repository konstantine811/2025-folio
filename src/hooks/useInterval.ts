import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, ms: number) {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

import { useWindowSizeStore } from "@/storage/windowSizeStore";
import { useEffect } from "react";

export const useResizeListener = () => {
  const setScreenWidth = useWindowSizeStore((state) => state.setScreenWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // ініціалізуємо

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setScreenWidth]);
};

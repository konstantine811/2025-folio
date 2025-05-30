import { useEffect } from "react";

export const useSwipeOpenDrawer = (onSwipeRight: () => void) => {
  useEffect(() => {
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      // 👉 Якщо свайпнув справа наліво більш ніж на 50px — вважаємо свайпом
      if (startX < 40 && deltaX > 50) {
        onSwipeRight();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeRight]);
};

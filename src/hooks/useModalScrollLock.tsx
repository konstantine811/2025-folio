import { useEffect, useRef, RefObject } from "react";
import Lenis from "lenis";

interface UseModalScrollLockOptions {
  isOpen: boolean;
  modalRef: RefObject<HTMLElement | null>;
  scrollContainerRef: RefObject<HTMLElement | null>;
  useNativeScroll?: boolean; // Якщо true, використовує нативний скрол замість Lenis
}

/**
 * Хук для блокування скролу основного вікна та створення окремого Lenis для модального вікна
 * Або використання нативного скролу, якщо useNativeScroll = true
 */
export function useModalScrollLock({
  isOpen,
  modalRef,
  scrollContainerRef,
  useNativeScroll = false,
}: UseModalScrollLockOptions) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Зупиняємо основний Lenis
      const lenisRoot = document.querySelector("[data-lenis-root]");
      let mainLenis: { stop: () => void; start: () => void } | null = null;
      if (lenisRoot) {
        mainLenis = (
          window as unknown as {
            lenis?: {
              stop: () => void;
              start: () => void;
            };
          }
        ).lenis || null;
        if (mainLenis) {
          mainLenis.stop();
        }
      }

      // Зберігаємо поточну позицію скролу
      const scrollY = window.scrollY;

      // Зберігаємо поточний overflow
      const originalOverflow = document.body.style.overflow;
      const originalOverflowX = document.body.style.overflowX;
      const originalOverflowY = document.body.style.overflowY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      // Блокуємо скролл на body
      document.body.style.overflow = "hidden";
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Блокуємо події скролу для основного вікна
      const preventMainScroll = (e: WheelEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        const scrollContainer = scrollContainerRef.current;

        // Перевіряємо, чи подія всередині scrollContainer (для нативного скролу)
        // або всередині modalRef (для Lenis)
        if (useNativeScroll) {
          if (
            scrollContainer &&
            (scrollContainer.contains(target) || scrollContainer === target)
          ) {
            return; // Дозволяємо скролл
          }
        } else {
          if (modalRef.current?.contains(target)) {
            return; // Дозволяємо скролл всередині модального вікна
          }
        }

        // Блокуємо скролл для всього іншого
        e.preventDefault();
        e.stopPropagation();
      };

      // Використовуємо document з capture для кращого контролю
      const eventOptions = { passive: false, capture: true };
      document.addEventListener("wheel", preventMainScroll, eventOptions);
      document.addEventListener("touchmove", preventMainScroll, eventOptions);

      // Створюємо новий Lenis для модального вікна (тільки якщо не використовуємо нативний скрол)
      let timeoutId: NodeJS.Timeout | null = null;
      if (!useNativeScroll) {
        const initLenis = () => {
          const scrollContainer = scrollContainerRef.current;
          if (!scrollContainer) {
            console.warn("useModalScrollLock: scrollContainer not found");
            return;
          }

          const content = scrollContainer.firstElementChild as HTMLElement;
          
          if (!content) {
            console.warn("useModalScrollLock: content element not found, using scrollContainer as content");
          }

          try {
            const lenis = new Lenis({
              wrapper: scrollContainer,
              content: content || scrollContainer,
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              smoothWheel: true,
              wheelMultiplier: 0.8,
              touchMultiplier: 2,
            });

            lenisRef.current = lenis;

            function raf(time: number) {
              if (lenisRef.current) {
                lenisRef.current.raf(time);
                rafIdRef.current = requestAnimationFrame(raf);
              }
            }

            rafIdRef.current = requestAnimationFrame(raf);
          } catch (error) {
            console.error("useModalScrollLock: Error initializing Lenis", error);
          }
        };

        timeoutId = setTimeout(initLenis, 100);
      }

      return () => {
        // Очищаємо timeout, якщо він ще не виконався
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Видаляємо обробники подій
        document.removeEventListener("wheel", preventMainScroll, { capture: true });
        document.removeEventListener("touchmove", preventMainScroll, { capture: true });

        // Зупиняємо та знищуємо локальний Lenis
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }

        // Повертаємо стилі
        document.body.style.overflow = originalOverflow;
        document.body.style.overflowX = originalOverflowX;
        document.body.style.overflowY = originalOverflowY;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;

        // Повертаємо позицію скролу
        window.scrollTo(0, scrollY);

        // Повертаємо основний Lenis
        if (mainLenis) {
          mainLenis.start();
        }
      };
    }
  }, [isOpen, modalRef, scrollContainerRef, useNativeScroll]);
}


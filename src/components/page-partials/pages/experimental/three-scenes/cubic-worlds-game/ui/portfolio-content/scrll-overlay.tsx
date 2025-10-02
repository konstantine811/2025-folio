// src/ui/ScrollOverlay.tsx
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // твій util, або заміни на clsx
import { useScrollStore } from "../../store/useScrollStore";
import FirstSection from "./first-sectiont";
import { Play } from "lucide-react";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import ScrollProgressIndicator from "./scroll-progress-indicator";
import SecondSection from "./second-section";
import ScrollProgressContent from "./scroll-progress-content";
import { Button } from "@/components/ui/button";
import { usePauseStore } from "../../store/usePauseMode";
import CloseButton from "./close-btn";

export default function ScrollOverlay() {
  const setProgress = useScrollStore((s) => s.setProgress);
  const hs = useHeaderSizeStore((s) => s.size);
  const setIsGameStarted = usePauseStore((s) => s.setIsGameStarted);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const [startScroll, setStartScroll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // власний контейнер із вертикальним скролом
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const compute = () => {
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    const onResize = () => compute();
    if (isGameStarted) {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    } else {
      el.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      compute();
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [setProgress, isGameStarted]);

  return (
    <>
      {!isGameStarted ? (
        <div
          // fixed оверлей поверх Canvas
          className={cn(
            "fixed inset-0 z-10 overflow-y-auto overscroll-none",
            "transition-opacity duration-300"
          )}
          ref={ref}
        >
          <div
            style={{ top: hs }}
            className="fixed right-20 z-50 cursor-pointer pointer-events-auto"
          >
            <CloseButton
              onClick={() => {
                setIsGameStarted(true);
              }}
            />
          </div>
          <div
            className="bg-background/50 relative flex flex-col"
            style={{ height: `calc(100vh - ${hs}px)`, top: hs }}
          >
            {/* Твої секції, hero, текст, картинки тощо */}
            {/* Можеш використовувати position: sticky для елементів */}
            {!startScroll ? (
              <div
                onClick={() => {
                  setStartScroll(true);
                }}
                className="grow hover:bg-background/0 bg-background/40 transition-all duration-500 backdrop-blur-md flex flex-col justify-center items-center gap-4"
              >
                <Play className="cursor-pointer transition-all duration-700" />
              </div>
            ) : (
              <>
                <ScrollProgressContent />
                <ScrollProgressIndicator />
                <div className="container mx-auto border border-muted-foreground/30">
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    <FirstSection />
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  ></section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    <SecondSection />
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Three.js section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Backand Data section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Visualize Data Section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Frontend JS & TS & React & Angular & Vue.js section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    UI Section MUI, Tailwind, Shadcn etc
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Mapbox section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Kernel Section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    UDReam Sectioin
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    Other Exp Section
                  </section>
                  <section
                    className="grid"
                    style={{ minHeight: `calc(100vh - ${hs}px)` }}
                  >
                    About own game section
                    <Button onClick={() => setIsGameStarted(true)}>
                      Start Game
                    </Button>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

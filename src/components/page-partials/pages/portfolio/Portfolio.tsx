import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { Trans, useTranslation } from "react-i18next";
import DialogContact from "./DialogContact/DialogContact";
import {
  StatusWorkData,
  subscribeToStatusWork,
} from "@/services/firebase/statusWork";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.3";
const Portfolio = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  const [t] = useTranslation();
  const [statusWork, setStatusWork] = useState<StatusWorkData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStatusWork((data) => {
      setStatusWork(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <div
      className="container mx-auto flex flex-col py-10"
      style={{ minHeight: `calc(100vh - ${hs}px)` }}
    >
      <header className="relative w-full flex flex-col gap-5 justify-between grow px-10">
        <div className="font-mono text-xs text-muted-foreground tracking-widest border-l border-muted-foreground/40 pl-4">
          {t("portfolio.coord")}
          <br />
          {t("portfolio.sys_ver", { app_version: APP_VERSION })}
        </div>

        <div className="relative z-10 mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5 backdrop-blur-md w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                statusWork?.status_work ? "bg-red-500" : "bg-emerald-500"
              )}
            ></span>
          </span>
          <span className="font-mono text-xs font-medium text-foreground/80 tracking-[0.2em] uppercase">
            {statusWork?.status_work
              ? t("portfolio.status_work.busy")
              : t("portfolio.status_work.available")}
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-[12vw] leading-[0.85] font-semibold font-display tracking-tight text-foreground mix-blend-overlay opacity-90">
            <Trans
              i18nKey="portfolio.title"
              components={{
                br: <br />,
              }}
            />
          </h1>
          <h1
            className="text-[12vw] leading-[0.85] font-semibold font-display tracking-tight text-transparent stroke-text absolute top-0 left-0 pointer-events-none"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
          >
            <Trans
              i18nKey="portfolio.title"
              components={{
                br: <br />,
              }}
            />
          </h1>
        </div>

        <div className="mt-12 max-w-xl border-l border-card md:pl-8">
          <p className="font-mono text-xs md:text-sm text-muted-foreground leading-relaxed uppercase tracking-wide">
            {t("portfolio.description")}
          </p>

          <div className="mt-8 flex gap-8">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("projects");
                if (target) {
                  // Використовуємо Lenis для плавного скролу, якщо він доступний
                  // Спробуємо знайти Lenis instance через DOM
                  const lenisRoot = document.querySelector("[data-lenis-root]");
                  if (lenisRoot) {
                    const lenisInstance = (
                      window as unknown as {
                        lenis?: {
                          scrollTo: (
                            target: HTMLElement,
                            options?: { offset?: number; duration?: number }
                          ) => void;
                        };
                      }
                    ).lenis;
                    if (lenisInstance && lenisInstance.scrollTo) {
                      lenisInstance.scrollTo(target, {
                        offset: -hs, // Враховуємо висоту header
                        duration: 1.2,
                      });
                      return;
                    }
                  }
                  // Fallback до стандартного smooth scroll
                  const y =
                    target.getBoundingClientRect().top +
                    window.pageYOffset -
                    hs;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="text-xs font-mono uppercase text-foreground border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
            >
              {t("portfolio.view_dossier")}
            </a>
            <DialogContact />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Portfolio;

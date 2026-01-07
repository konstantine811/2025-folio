import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Lenis from "lenis";
import { Project } from "./Experience/constant";

interface ProjectSlideOverProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSlideOver: React.FC<ProjectSlideOverProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const slideOverRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
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

      // Блокуємо події скролу для основного Lenis
      const preventMainScroll = (e: WheelEvent | TouchEvent) => {
        // Перевіряємо, чи подія відбулася всередині модального вікна
        const target = e.target as HTMLElement;
        if (slideOverRef.current?.contains(target)) {
          return; // Дозволяємо скролл всередині модального вікна
        }
        e.preventDefault();
        e.stopPropagation();
      };

      window.addEventListener("wheel", preventMainScroll, { passive: false });
      window.addEventListener("touchmove", preventMainScroll, {
        passive: false,
      });

      // Створюємо новий Lenis для модального вікна
      const scrollContainer = scrollContainerRef.current;
      const lenis = new Lenis({
        wrapper: scrollContainer,
        content: scrollContainer,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
      });

      lenisRef.current = lenis;

      // Функція для оновлення Lenis
      function raf(time: number) {
        lenis.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      }

      rafIdRef.current = requestAnimationFrame(raf);

      return () => {
        // Видаляємо обробники подій
        window.removeEventListener("wheel", preventMainScroll);
        window.removeEventListener("touchmove", preventMainScroll);

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
      };
    }
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-[110]" ref={slideOverRef}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card-background border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/5 bg-card-background">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {t("portfolio.project_slideover.project_details")}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-foreground/5 rounded-full"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight mb-2">
                  {project.title}
                </h2>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-10 border-b border-foreground/10 pb-4">
                  {project.subtitle}
                </p>
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
                {project.images && project.images.length > 0 && (
                  <div className="mt-10 space-y-8">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 font-medium">
                      {t("portfolio.project_slideover.gallery_title")}
                    </h3>
                    <div className="space-y-8">
                      {project.images.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="space-y-3"
                        >
                          <div className="relative w-full rounded-lg overflow-hidden border border-foreground/10 bg-background/50">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-auto object-contain"
                              loading="lazy"
                              onError={(e) => {
                                console.error(
                                  "Failed to load image:",
                                  image.src
                                );
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                            {image.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="px-8 py-6 border-t border-foreground/5 bg-card-background flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted-foreground">
                {project.websiteUrl
                  ? t("portfolio.project_slideover.confidentiality_public")
                  : t("portfolio.project_slideover.confidentiality_not_public")}
              </span>
              <div className="flex gap-4 items-center">
                {project.websiteUrl ? (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={t("portfolio.project_slideover.visit_website")}
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    className="text-muted-foreground/50 font-mono text-[10px] cursor-not-allowed"
                    title={t("portfolio.project_slideover.not_public")}
                  >
                    {t("portfolio.project_slideover.not_public")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSlideOver;

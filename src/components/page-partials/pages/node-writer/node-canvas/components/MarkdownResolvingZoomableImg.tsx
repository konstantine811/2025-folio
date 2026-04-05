import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { resolveNodeWriterMediaUrlForDisplay } from "@/services/firebase/node-writer-workspace";
import { cn } from "@/utils/classname";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  compact?: boolean;
  fitContent?: boolean;
};

/**
 * Як `MarkdownResolvingImg`, плюс клік — повноекранний перегляд (оверлей у `document.body`, без обрізання батьками).
 */
export function MarkdownResolvingZoomableImg({
  src,
  alt,
  className,
  compact = true,
  fitContent = false,
}: Props) {
  const [resolved, setResolved] = useState(src ?? "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const s = src?.trim() ?? "";
    if (!s) {
      setResolved("");
      return;
    }
    let cancelled = false;
    void resolveNodeWriterMediaUrlForDisplay(s).then((out) => {
      if (!cancelled) setResolved(out);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!resolved) setIsLoaded(false);
  }, [resolved]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  if (!resolved) return null;

  const sizeClass = compact
    ? "max-h-[min(36vh,22rem)]"
    : "max-h-[min(40vh,26rem)]";

  return (
    <div
      className={cn(fitContent ? "inline-block max-w-full align-middle" : "w-full")}
    >
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "relative flex cursor-zoom-in justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring",
          fitContent ? "w-fit max-w-full" : "w-full",
        )}
        onClick={() => setIsFullscreen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFullscreen(true);
          }
        }}
        aria-label="Збільшити зображення"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <motion.img
          src={resolved}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "mx-auto object-contain transition-all duration-300 hover:opacity-95",
            fitContent ? "h-auto w-auto max-w-full" : "w-full max-w-full",
            sizeClass,
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isFullscreen ? (
              <motion.div
                key="nw-img-fs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2147483646] flex cursor-zoom-out items-center justify-center bg-background/95 backdrop-blur-sm"
                onClick={() => setIsFullscreen(false)}
                role="presentation"
                aria-modal="true"
              >
                <motion.img
                  src={resolved}
                  alt={alt ?? ""}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.92 }}
                  transition={{ duration: 0.25 }}
                  className="box-border max-h-[min(100dvh,100vh)] max-w-[min(100vw,100dvw)] object-contain p-4"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

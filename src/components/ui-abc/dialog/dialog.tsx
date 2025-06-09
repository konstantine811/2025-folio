import { motion, AnimatePresence } from "framer-motion";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { useEffect } from "react";
import { cn } from "@/utils/classname";

const DialogTask = ({
  isOpen,
  setOpen,
  children,
  className = "p-4",
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const setHover = useHoverStore((s) => s.setHover);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setTimeout(() => {
      setHover(false, null, HoverStyleElement.circle);
    }, 100);
  }, [setHover, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.9, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed left-0 top-0 z-[11] h-full flex justify-center overflow-auto items-center bg-background/80 backdrop-blur-xs w-full"
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              `overflow-auto h-full md:h-auto rounded-xl shadow-lg w-full max-w-lg border border-foreground/20 backdrop-blur-xs ${className}`
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogTask;

import { motion, AnimatePresence } from "framer-motion";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { useEffect } from "react";
import { cn } from "@/utils/classname";

const DialogTask = ({
  isOpen,
  setOpen,
  children,
  className = "px-4 pt-20 pb-24 md:p-6",
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const setHover = useHoverStore((s) => s.setHover);

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }

  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [isOpen]);

  useEffect(() => {
    setTimeout(() => {
      setHover(false, null, HoverStyleElement.circle);
    }, 100);
  }, [setHover, isOpen]);

  return (
    <>
      {isOpen && (
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.9, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "absolute z-50 left-0 top-0 h-full flex justify-center items-center overflow-y-auto bg-background/80 backdrop-blur-xs w-full"
          )}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              `bg-background/80 rounded-xl  shadow-lg w-full max-w-lg border border-foreground/20 backdrop-blur-xs max-h-screen overflow-y-auto ${className}`
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
    </>
  );
};

export default DialogTask;

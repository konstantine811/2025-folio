import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@utils/classname";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const ImageWithLoader = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hS = useHeaderSizeStore((state) => state.size);
  return (
    <div className="pt-2 pb-3 md:pb-5 lg:pb-10">
      <div
        className="relative w-full flex justify-center cursor-zoom-in "
        onClick={() => setIsFullscreen(true)}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-primary" />
          </div>
        )}
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "rounded-lg  mb-4 last:mb-0 mx-auto transition-all duration-300 hover:scale-101",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000000] bg-background/80  flex items-center justify-center cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
            style={{ top: hS }}
          >
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="max-w-full w-full h-full object-contain"
              style={{ maxHeight: `calc(100vh - ${hS}px)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageWithLoader;

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export const SideMenu: React.FC<{
  overlayColor?: string;
  width?: number;
  children: React.ReactNode;
}> = ({ overlayColor = "bg-background/50", width = 400, children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isActive ? "active" : "inactive");
  }, [isActive, controls]);

  const sidekickBodyStyles = {
    active: { x: 0 },
    inactive: { x: width },
  };

  const menuHandlerStyles = {
    active: { x: 0, color: "#fff" },
    inactive: { x: -60, color: "#fff" },
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${overlayColor} pointer-events-auto z-0 ${
          isActive ? "block" : "hidden"
        }`}
        onClick={() => setIsActive(false)}
      />

      {/* Side Panel on Right */}
      <motion.div
        className="absolute right-0 w-full top-0 bottom-0 z-10 pointer-events-auto bg-card h-full box-border flex flex-col touch-none"
        style={{ maxWidth: `${width}px` }}
        drag="x"
        dragElastic={{
          left: 0,
          right: 0.9, // Allow dragging to the left only
        }}
        dragConstraints={{ left: 0, right: 0 }}
        dragMomentum={false}
        onDragEnd={(_event, info) => {
          // console.log("info.offset.x", info.offset.x);
          const isDraggingRight = info.offset.x > 170;
          // setIsActive(isDraggingRight);
          // console.log("Is dragging right:", isDraggingRight);
          const multiplier = isDraggingRight ? 2 / 3 : 1 / 4;
          const threshold = width * multiplier;

          setIsActive(isDraggingRight);
          controls.start(isDraggingRight ? "active" : "inactive");
        }}
        animate={controls}
        variants={sidekickBodyStyles}
        transition={{ type: "spring", damping: 30, stiffness: 180 }}
      >
        {/* Toggle Button */}
        <motion.button
          onTap={() => setIsActive((s) => !s)}
          className="absolute top-20 left-2 text-sm font-medium text-foreground bg-card"
          variants={menuHandlerStyles}
          transition={{ type: "spring", damping: 30, stiffness: 180 }}
        >
          {isActive ? "Close" : "Open"}
        </motion.button>

        <div className="flex-1 overflow-y-auto px-7 pb-10 pt-15">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SideMenu;

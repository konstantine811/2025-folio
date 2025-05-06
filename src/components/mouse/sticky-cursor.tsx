import { useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useHoverStore } from "@storage/hoverStore";
import { HoverStyleElement } from "@custom-types/sound";

const StickCursor = () => {
  const defaultSize = 1;

  const { isHovering, boundingBox, isHoveringWrapper, hoverStyleElement } =
    useHoverStore((s) => s);
  const smoothMouseProps = { stiffness: 733, damping: 36, mass: 0.3 };
  const smoothSizeProps = { stiffness: 500, damping: 30, mass: 0.1 };
  const classBorderColor = "border-accent";
  const classHoverLink = `${classBorderColor} absolute w-3 h-3`;
  // розмір курсора — плавний
  const sizeWidth = useMotionValue(defaultSize);
  const sizeHeight = useMotionValue(defaultSize);
  const animatedSizeWidth = useSpring(sizeWidth, smoothSizeProps);
  const animatedSizeHeight = useSpring(sizeHeight, smoothSizeProps);
  const mousePos = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothMousePos = {
    x: useSpring(mousePos.x, smoothMouseProps),
    y: useSpring(mousePos.y, smoothMouseProps),
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if (isHovering && boundingBox) {
        const { left, top, width, height } = boundingBox;
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        mousePos.x.set(centerX - sizeWidth.get() / 2);
        mousePos.y.set(centerY - sizeHeight.get() / 2);
      } else {
        mousePos.x.set(clientX - sizeWidth.get() / 2);
        mousePos.y.set(clientY - sizeHeight.get() / 2);
      }
    },
    [mousePos.x, mousePos.y, sizeWidth, isHovering, boundingBox, sizeHeight]
  );

  // 👇 оновлюємо розмір при зміні стану наведення
  useEffect(() => {
    if (boundingBox) {
      if (isHovering) {
        sizeWidth.set(boundingBox.width);
        sizeHeight.set(boundingBox.height);
      }
    } else {
      sizeWidth.set(defaultSize);
      sizeHeight.set(defaultSize);
    }
  }, [isHovering, sizeWidth, boundingBox, sizeHeight]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <motion.div
      className={`fixed rounded-full z-[100000] pointer-events-none cursor-none   ${
        !isHoveringWrapper || hoverStyleElement !== HoverStyleElement.quad
          ? `border ${classBorderColor}`
          : "border-none"
      }`}
      style={{
        left: smoothMousePos.x,
        top: smoothMousePos.y,
        width: animatedSizeWidth,
        height: animatedSizeHeight,
      }}
    >
      {hoverStyleElement === HoverStyleElement.quad && isHoveringWrapper && (
        <>
          {/* top-left */}
          <span
            className={`${classHoverLink} top-0 left-0 border-t-2 border-l-2 rounded-tl-[4px]`}
          />

          {/* top-right */}
          <span
            className={`${classHoverLink} top-0 right-0 border-t-2 border-r-2 rounded-tr-[4px]`}
          />

          {/* bottom-left */}
          <span
            className={`${classHoverLink} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[4px]`}
          />

          {/* bottom-right */}
          <span
            className={`${classHoverLink} bottom-0 right-0 border-b-2 border-r-2 rounded-br-[4px]`}
          />
        </>
      )}
    </motion.div>
  );
};

export default StickCursor;

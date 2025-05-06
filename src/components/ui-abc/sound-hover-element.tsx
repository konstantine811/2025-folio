import { ReactNode, useRef, ElementType, memo } from "react";
import { useHoverStore } from "@storage/hoverStore";
import { SoundTypeElement } from "@custom-types/sound";
import { forwardRef } from "react";
import clsx from "clsx"; // опціонально
import { motion, MotionProps } from "motion/react";
import { MOTION_FRAME_TRANSITION } from "@config/animations";

type SoundHoverElementProps = {
  children: ReactNode;
  hoverTypeElement?: SoundTypeElement;
  as?: ElementType;
  className?: string;
  hoverAnimType?: "scale" | "rotate" | "translate"; // тип анімації при наведенні
  animValue?: number;
} & React.HTMLAttributes<HTMLElement> &
  MotionProps;

const SoundHoverElement = forwardRef<HTMLElement, SoundHoverElementProps>(
  (
    {
      children,
      hoverTypeElement = SoundTypeElement.BUTTON,
      as: Tag = "div",
      className,
      hoverAnimType = "scale",
      animValue = 1.1,
      ...rest
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement>(null!);
    const ref = (forwardedRef as React.RefObject<HTMLElement>) ?? internalRef;
    const setHover = useHoverStore((s) => s.setHover);
    const MotionTag = motion.create(Tag as ElementType);
    const hoverTransition = MOTION_FRAME_TRANSITION.spring;
    const handleMouseEnter = () => {
      const rect = ref.current?.getBoundingClientRect?.();
      if (rect) {
        setHover(true, hoverTypeElement, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const handleMouseLeave = () => {
      setHover(false, hoverTypeElement);
    };

    function getHoverTypeAnimation() {
      switch (hoverAnimType) {
        case "scale":
          return {
            scale: animValue,
            transition: hoverTransition,
          };
        case "translate":
          return {
            y: animValue,
            transition: hoverTransition,
          };
      }
    }

    return (
      <MotionTag
        ref={ref}
        onHoverStart={handleMouseEnter} // 🧠 замість onMouseEnter
        onHoverEnd={handleMouseLeave}
        className={clsx(className)}
        whileHover={getHoverTypeAnimation()}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  }
);

export default memo(SoundHoverElement);

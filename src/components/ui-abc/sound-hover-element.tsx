import { ReactNode, useRef, ElementType } from "react";
import { useHoverStore } from "@storage/hoverStore";
import { SoundTypeElement } from "@custom-types/sound";
import { forwardRef } from "react";
import clsx from "clsx"; // опціонально
import { motion, MotionProps } from "motion/react";

type SoundHoverElementProps = {
  children: ReactNode;
  hoverTypeElement?: SoundTypeElement;
  as?: ElementType;
  className?: string;
  hoverAnimType?: "scale" | "rotate" | "translate"; // тип анімації при наведенні
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
      ...rest
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement>(null!);
    const ref = (forwardedRef as React.RefObject<HTMLElement>) ?? internalRef;
    const setHover = useHoverStore((s) => s.setHover);
    const MotionTag = motion(Tag as ElementType);
    const hoverTransition = {
      type: "spring",
      stiffness: 300,
      damping: 8,
    };
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
            scale: 1.1,
            transition: hoverTransition,
          };
        case "translate":
          return {
            y: -2,
            transition: hoverTransition,
          };
      }
    }

    return (
      <MotionTag
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={clsx(className)}
        whileHover={getHoverTypeAnimation()}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  }
);

export default SoundHoverElement;

// import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import clsx from "clsx";
import { forwardRef, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  isFullHeight?: boolean;
};

const MainWrapperOffset = forwardRef<HTMLDivElement, Props>(
  ({ children, className = "", isFullHeight = false }, ref) => {
    const fs = useHeaderSizeStore((s) => s.footerSize);
    const hs = useHeaderSizeStore((s) => s.size);
    const height = isFullHeight
      ? `calc(100vh - ${hs + fs}px)`
      : `calc(100vh - ${fs}px)`;
    return (
      <div
        className={clsx(className, "relative")}
        style={{ height, top: isFullHeight ? hs : 0 }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default MainWrapperOffset;

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
    const hs = useHeaderSizeStore((s) => s.size);
    return (
      <div
        className={clsx(
          className,
          "relative overflow-hidden",
          isFullHeight &&
            "box-border flex min-h-0 min-w-0 flex-1 flex-col",
        )}
        style={
          isFullHeight
            ? { paddingTop: hs }
            : { height: "100vh" }
        }
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

export default MainWrapperOffset;

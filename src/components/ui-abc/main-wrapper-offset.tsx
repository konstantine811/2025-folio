// import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import clsx from "clsx";
import { forwardRef, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const MainWrapperOffset = forwardRef<HTMLDivElement, Props>(
  ({ children, className = "" }, ref) => {
    // const hs = useHeaderSizeStore((s) => s.size);
    return (
      <div
        className={clsx(className, "h-screen")}
        // style={{ height: `calc(100vh - ${hs}px)` }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default MainWrapperOffset;

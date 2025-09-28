import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { forwardRef, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const MainWrapperOffset = forwardRef<HTMLDivElement, Props>(
  ({ children, className = "" }, ref) => {
    const hs = useHeaderSizeStore((s) => s.size);
    return (
      <div
        className={className}
        style={{ height: `calc(100vh - ${hs}px)` }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default MainWrapperOffset;

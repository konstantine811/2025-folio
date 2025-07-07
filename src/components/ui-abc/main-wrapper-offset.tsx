import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { ReactNode } from "react";

const MainWrapperOffset = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const hs = useHeaderSizeStore((s) => s.size);
  return (
    <div className={className} style={{ height: `calc(100vh - ${hs}px)` }}>
      {children}
    </div>
  );
};

export default MainWrapperOffset;

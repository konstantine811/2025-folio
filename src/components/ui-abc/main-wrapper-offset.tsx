import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { ReactNode } from "react";

const MainWrapperOffset = ({ children }: { children: ReactNode }) => {
  const hs = useHeaderSizeStore((s) => s.size);
  return <div style={{ height: `calc(100vh - ${hs}px)` }}>{children}</div>;
};

export default MainWrapperOffset;

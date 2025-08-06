import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { ReactNode } from "react";

const UISection = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const hs = useHeaderSizeStore((state) => state.size);
  return (
    <section
      className={`max-w-[1024px] mx-auto p-10 ${className}`}
      style={{ height: `calc(100vh - ${hs}px)` }}
    >
      {children}
    </section>
  );
};

export default UISection;

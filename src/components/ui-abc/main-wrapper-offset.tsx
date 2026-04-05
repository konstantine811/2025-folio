// import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import clsx from "clsx";
import { forwardRef, type CSSProperties, type ReactNode } from "react";

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
            ? ({
                boxSizing: "border-box",
                paddingTop: hs,
                // Для дочірніх елементів (напр. сайдбар Node Writer): висота смуги під хедером.
                ["--nw-header-offset" as string]: `${Math.max(hs, 56)}px`,
                // min-height сам по собі не дає «definite height» для height:100% у дітей — потрібна явна height.
                height: "100dvh",
                minHeight: "100dvh",
              } as CSSProperties)
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

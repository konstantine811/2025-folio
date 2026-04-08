import { cn } from "@/lib/utils";
import {
  type KeyboardEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

type Placement = "above" | "below";

type Props = {
  open: boolean;
  anchorX: number;
  anchorY: number;
  placement: Placement;
  onApply: (href: string) => void;
  onDismiss: () => void;
};

function stop(e: SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function MarkdownLinkUrlPopover({
  open,
  anchorX,
  anchorY,
  placement,
  onApply,
  onDismiss,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const transform =
    placement === "above"
      ? "translate(-50%, calc(-100% - 10px))"
      : "translate(-50%, 10px)";

  return createPortal(
    <div
      data-md-link-popover=""
      className="pointer-events-auto fixed z-[310]"
      style={{ left: anchorX, top: anchorY, transform }}
      role="dialog"
      aria-label="Посилання"
      onMouseDown={stop}
      onPointerDown={stop}
    >
      <div className="relative">
        <div
          className={cn(
            "flex min-w-[min(260px,calc(100vw-32px))] max-w-[min(340px,calc(100vw-24px))] items-center rounded-md border border-border/30 bg-popover/93 px-2.5 py-2 text-popover-foreground shadow-[0_10px_26px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="Type or paste URL"
            className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.code === "Escape") {
                e.preventDefault();
                onDismiss();
                return;
              }
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                e.preventDefault();
                onApply(e.currentTarget.value);
              }
            }}
          />
        </div>
        {/* pointer toward selected text */}
        {placement === "above" ? (
          <span
            className="pointer-events-none absolute left-1/2 top-full -mt-px -translate-x-1/2 h-0 w-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-border/40"
            aria-hidden
          />
        ) : (
          <span
            className="pointer-events-none absolute bottom-full left-1/2 -mb-px -translate-x-1/2 h-0 w-0 border-x-[7px] border-x-transparent border-b-[8px] border-b-border/40"
            aria-hidden
          />
        )}
      </div>
    </div>,
    document.body,
  );
}

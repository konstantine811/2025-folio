import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { resolveNodeWriterMediaUrlForDisplay } from "@/services/firebase/node-writer-workspace";
import { cn } from "@/utils/classname";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
};

/**
 * Markdown `![]()` / raw `<img>`: оновлює застарілі Firebase Storage https (токен) та `nw-storage:`.
 */
export function MarkdownResolvingImg({
  src,
  alt,
  className,
  width,
  height,
  style,
}: Props) {
  const [resolved, setResolved] = useState("");
  const [status, setStatus] = useState<
    "idle" | "resolving" | "loading" | "loaded" | "error"
  >("idle");

  useEffect(() => {
    const s = src?.trim() ?? "";
    if (!s) {
      setResolved("");
      setStatus("idle");
      return;
    }
    setResolved("");
    setStatus("resolving");
    let cancelled = false;
    void resolveNodeWriterMediaUrlForDisplay(s)
      .then((out) => {
        if (cancelled) return;
        setResolved(out);
        setStatus(out ? "loading" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setResolved("");
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const isBusy = status === "resolving" || status === "loading";
  const shouldFillParent =
    className?.includes("h-full") || className?.includes("w-full");
  const isBlockImage =
    shouldFillParent ||
    className?.includes("block") ||
    className?.includes("max-w-full");

  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "relative overflow-hidden align-middle",
        isBlockImage ? "block" : "inline-block",
        shouldFillParent ? "h-full w-full" : "min-h-24 max-w-full",
      )}
      style={
        shouldFillParent
          ? undefined
          : {
              width: width ?? undefined,
              height: height ?? undefined,
            }
      }
    >
      {isBusy ? (
        <span
          aria-label="Зображення завантажується"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/35 backdrop-blur-[1px]"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/80 border-t-transparent" />
        </span>
      ) : null}

      {status === "error" ? (
        <span className="flex min-h-24 items-center justify-center rounded border border-border/25 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
          Не вдалося завантажити зображення
        </span>
      ) : null}

      {resolved ? (
        <img
          src={resolved}
          alt={alt ?? ""}
          className={cn(
            className,
            "transition-opacity duration-200",
            status === "loaded" ? "opacity-100" : "opacity-0",
          )}
          width={width}
          height={height}
          style={style}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : null}
    </span>
  );
}

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { resolveNodeWriterMediaUrlForDisplay } from "@/services/firebase/node-writer-workspace";

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

  useEffect(() => {
    const s = src?.trim() ?? "";
    if (!s) {
      setResolved("");
      return;
    }
    setResolved("");
    let cancelled = false;
    void resolveNodeWriterMediaUrlForDisplay(s).then((out) => {
      if (!cancelled) setResolved(out);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!resolved) return null;

  return (
    <img
      src={resolved}
      alt={alt ?? ""}
      className={className}
      width={width}
      height={height}
      style={style}
      loading="lazy"
      decoding="async"
    />
  );
}

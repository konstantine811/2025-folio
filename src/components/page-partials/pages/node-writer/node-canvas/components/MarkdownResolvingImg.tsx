import { useEffect, useState } from "react";
import { resolveNodeWriterMediaUrlForDisplay } from "@/services/firebase/node-writer-workspace";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Markdown `![]()` / raw `<img>`: оновлює застарілі Firebase Storage https (токен) та `nw-storage:`.
 */
export function MarkdownResolvingImg({ src, alt, className }: Props) {
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
      loading="lazy"
      decoding="async"
    />
  );
}

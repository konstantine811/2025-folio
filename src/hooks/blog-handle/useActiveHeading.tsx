import { useEffect, useState } from "react";

export function useActiveHeading(headings: string[], headerOffset = 0) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${headerOffset - 10}px 0px -60% 0px`, // точне зміщення
        threshold: [0, 1],
      }
    );

    headings.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, headerOffset]);

  return activeId;
}

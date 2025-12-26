"use client";

import React, { useEffect, useRef } from "react";

export interface SectionProgress {
  index: number;
  progress: number; // 0..1
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  childrens: React.ReactNode[];

  // вихідні refs:
  // pageIndexRef -> індекс ПЕРЕХОДУ (0..n-2)
  // sectionProgressRef -> прогрес ПЕРЕХОДУ (0..1)
  pageIndexRef: React.RefObject<number>;
  sectionProgressRef: React.RefObject<number>;

  className?: string;
  style?: React.CSSProperties;

  // опційно: прогреси секцій (0..1) для дебагу/UI
  onSectionProgress?: (progresses: SectionProgress[]) => void;

  // опційно: активний ПЕРЕХІД (index=pageIndex, progress=transitionProgress)
  onActiveSection?: (active: SectionProgress) => void;
};

export default function ScrollSectionProgress({
  childrens,
  pageIndexRef,
  sectionProgressRef,
  onSectionProgress,
  onActiveSection,
  className,
  style,
}: Props) {
  const elsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const lastActiveRef = useRef<SectionProgress>({ index: 0, progress: 0 });

  // метрики секцій у document-координатах
  const metricsRef = useRef<{
    starts: number[]; // start Y кожної секції (document Y)
    ends: number[]; // end Y кожної секції (document Y)
    maxScroll: number; // максимальний scrollY
  }>({ starts: [], ends: [], maxScroll: 0 });

  const recalcMetrics = () => {
    const els = elsRef.current;
    const n = els.length;
    if (!n) return;

    const starts = new Array(n).fill(0).map((_, i) => {
      const el = els[i];
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY; // document Y
    });

    // Перша секція завжди стартує з 0 (початок сторінки)
    starts[0] = 0;

    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);

    // end секції = start наступної секції; для останньої секції — maxScroll
    const ends = new Array(n).fill(0).map((_, i) => {
      if (i < n - 1) return starts[i + 1];
      return maxScroll;
    });

    // safety: не даємо нульової довжини
    for (let i = 0; i < n; i++) {
      if (ends[i] <= starts[i]) ends[i] = starts[i] + 1;
    }

    metricsRef.current = { starts, ends, maxScroll };
  };

  const compute = () => {
    const { starts, ends, maxScroll } = metricsRef.current;
    const n = starts.length;
    if (!n) return;

    // нормалізований y (0..maxScroll)
    const y =
      clamp01(maxScroll === 0 ? 0 : window.scrollY / maxScroll) * maxScroll;

    // 1) визначаємо sectionIdx (в якій секції зараз y)
    let sectionIdx = 0;
    for (let i = n - 1; i >= 0; i--) {
      if (y >= starts[i]) {
        sectionIdx = i;
        break;
      }
    }

    // 2) ПЕРЕХОДИ: їх на 1 менше (n-1 секція не має переходу "вперед")
    const maxPageIndex = Math.max(0, n - 2);

    // pageIndex = індекс переходу (0..n-2)
    const pageIndex = Math.min(sectionIdx, maxPageIndex);

    // 3) Прогрес РАХУЄМО ВІД pageIndex (це прибирає скачок в останній секції)
    let transitionProgress = 0;

    if (n <= 1) {
      transitionProgress = 0;
    } else {
      const start = starts[pageIndex];
      const end =
        pageIndex === maxPageIndex
          ? maxScroll // останній перехід тягнеться до кінця скролу
          : starts[pageIndex + 1]; // звичайний перехід до початку наступної секції

      transitionProgress = clamp01((y - start) / Math.max(1, end - start));
    }

    // 4) Видаємо refs як треба для морфу
    pageIndexRef.current = pageIndex;
    sectionProgressRef.current = transitionProgress;

    // 5) (Опційно) прогреси СЕКЦІЙ (0..1) — для UI/дебагу
    if (onSectionProgress) {
      const progresses: SectionProgress[] = new Array(n).fill(0).map((_, i) => {
        const pi = clamp01((y - starts[i]) / Math.max(1, ends[i] - starts[i]));
        return { index: i, progress: pi };
      });
      onSectionProgress(progresses);
    }

    // 6) (Опційно) активний ПЕРЕХІД
    if (onActiveSection) {
      const next = { index: pageIndex, progress: transitionProgress };
      const prev = lastActiveRef.current;

      if (
        prev.index !== next.index ||
        Math.abs(prev.progress - next.progress) > 0.002
      ) {
        lastActiveRef.current = next;
        onActiveSection(next);
      }
    }
  };

  const schedule = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      compute();
    });
  };

  useEffect(() => {
    // первинний підрахунок
    recalcMetrics();
    compute();

    const onScroll = () => schedule();
    const onResize = () => {
      recalcMetrics();
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrens.length]);

  return (
    <div className={className} style={style}>
      {childrens.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            elsRef.current[i] = el;
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

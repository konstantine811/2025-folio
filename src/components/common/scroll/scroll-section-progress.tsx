import { useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export interface SectionProgress {
  index: number;
  progress: number;
}

// Окремий компонент для кожної секції
const ScrollSection = ({
  index,
  children,
  onProgress,
  isFirst,
  isLast,
}: {
  index: number;
  children: React.ReactNode;
  onProgress: (index: number, progress: number) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Налаштовуємо offset залежно від позиції секції
  // Для першої: починаємо коли вона з'являється знизу (start end), закінчуємо коли start досягає start viewport
  // Для останньої: починаємо коли end досягає end viewport, закінчуємо коли вона повністю виходить зверху (start start)
  // Для середніх: використовуємо стандартний offset
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isFirst
      ? (["start end", "start start"] as const) // Перша секція: від появи знизу до початку viewport
      : isLast
      ? (["end end", "start start"] as const) // Остання секція: від кінця viewport до повного виходу зверху
      : (["start end", "end start"] as const), // Середні секції: стандартний offset
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    onProgress(index, latest);
  });

  return <div ref={ref}>{children}</div>;
};

const ScrollSectionProgress = ({
  childrens,
  onSectionProgress,
}: {
  childrens: React.ReactNode[];
  onSectionProgress?: (progresses: SectionProgress[]) => void;
}) => {
  const progressesRef = useRef<Map<number, number>>(new Map());

  const handleProgress = (index: number, progress: number) => {
    progressesRef.current.set(index, progress);

    if (onSectionProgress) {
      // Конвертуємо Map в масив SectionProgress
      const progresses: SectionProgress[] = Array.from(
        progressesRef.current.entries()
      ).map(([index, progress]) => ({ index, progress }));

      // Сортуємо за індексом
      progresses.sort((a, b) => a.index - b.index);

      onSectionProgress(progresses);
    }
  };

  return (
    <div>
      {childrens.map((child, index) => (
        <ScrollSection
          key={index}
          index={index}
          onProgress={handleProgress}
          isFirst={index === 0}
          isLast={index === childrens.length - 1}
        >
          {child}
        </ScrollSection>
      ))}
    </div>
  );
};

export default ScrollSectionProgress;

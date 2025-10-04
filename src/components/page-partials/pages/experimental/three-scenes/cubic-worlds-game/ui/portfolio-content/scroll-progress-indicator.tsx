// src/ui/ScrollProgressIndicator.tsx
import { memo, useMemo } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { useScrollStore } from "../../store/useScrollStore";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

type Props = {
  /** 0..1 */
  /** необов’язково: показувати відсоток біля курсора */
  showPercent?: boolean;
  className?: string;
};

/**
 * Лівий вертикальний індикатор скролу з мітками та “лінією-курсором”.
 * Не перехоплює події миші (pointer-events-none), тож не блокує кліки по контенту.
 */
function ScrollProgressIndicator({ showPercent = true, className }: Props) {
  const progress = useScrollStore((s) => s.progress);
  const hs = useHeaderSizeStore((s) => s.size);
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  // позиції міток (кожні 20%)
  const ticks = useMemo(() => [0, 20, 40, 60, 80, 100], []);

  return (
    <div
      className={clsx(
        "fixed -left-6 lg:left-0 top-0 w-24 md:w-28 z-50",
        "select-none",
        "text-[10px] md:text-xs py-10",
        className
      )}
      style={{ top: hs, height: `calc(100vh - ${hs}px)` }}
      aria-hidden
    >
      <div className="relative h-full w-full">
        {/* вертикальна основна лінія */}
        <div className="absolute left-9 md:left-10 top-0 h-full w-px bg-yellow-500/60" />

        {/* мітки */}
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute left-7 md:left-8"
            style={{ top: `${t}%` }}
          >
            {/* маленька рисочка */}
            <div className="h-px w-4 bg-yellow-500/60" />
            {/* підпис зверху/знизу і на 0% */}
            <div
              className={clsx(
                "text-yellow-500/50 tracking-widest -translate-y-full",
                t === 100 && "translate-y-[2px]"
              )}
            >
              {t}%
            </div>
          </div>
        ))}

        {/* рухома горизонтальна лінія-покажчик (як на скріні) */}
        <motion.div
          className="absolute left-9 md:left-10"
          style={{ top: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 30,
            mass: 0.4,
          }}
        >
          {/* сама лінія, що “вказує” вправо */}
          <div className="h-[2px] w-2 bg-yellow-500" />
          {/* маленька товстіша риска на осі */}
          <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 h-3 w-[0px] bg-yellow-500" />
          {showPercent && (
            <div className="absolute -left-2 -top-4 text-yellow-400 font-medium">
              {pct.toFixed(0)}%
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default memo(ScrollProgressIndicator);

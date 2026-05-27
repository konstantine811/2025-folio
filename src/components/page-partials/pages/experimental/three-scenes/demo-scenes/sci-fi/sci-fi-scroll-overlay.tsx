import { Button } from "@/components/ui/button";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { Play } from "lucide-react";
import { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";

type SciFiScrollOverlayProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onStart: () => void;
};

const titleLines = ["DIGITAL", "ARCHITECT"];

const systemVersion = "ВЕРСІЯ СИСТЕМИ: 1.0.114";

const heroDescription =
  "Перетворюю мільйони точок даних на інтерактивні 3D веб-проекти. Спеціалізуюся на WebGL, React Three Fiber та високопродуктивних картографічних системах.";

const matrixTypeBaseMs = 26;
const matrixTypeStartDelayMs = 1100;
const matrixScrambleChars = "アイウエオカ01239$#%&<>[]{}|/\\";

const getMatrixTypeDelay = (char: string) => {
  if (char === "." || char === ",") return matrixTypeBaseMs * 5;
  if (char === " ") return matrixTypeBaseMs * 0.55;
  return matrixTypeBaseMs;
};

const projectStats = [
  { value: "12+", label: "WebGL сцен", tone: "cyan" },
  { value: "3D", label: "React Three Fiber", tone: "mint" },
  { value: "60fps", label: "інтерактивні карти", tone: "sky" },
] as const;

const statLabelNeonClass: Record<
  (typeof projectStats)[number]["tone"],
  string
> = {
  cyan: "text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.75)]",
  mint: "text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.7)]",
  sky: "text-sky-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.75)]",
};

const slotDigits = ["7", "2", "9", "4", "0", "6", "3", "8"];
const dialFrames = 6;
const dialFrameMs = 115;

const letterWidths: Record<string, string> = {
  A: "0.62em",
  C: "0.58em",
  D: "0.61em",
  E: "0.52em",
  G: "0.61em",
  H: "0.6em",
  I: "0.34em",
  L: "0.48em",
  R: "0.58em",
  T: "0.55em",
};

const getSlotWidth = (letter: string) => letterWidths[letter] ?? "0.58em";

const ScrollGlyphs = () => (
  <div className="pointer-events-none absolute top-0 left-1/2 z-0 min-h-full w-screen max-w-none -translate-x-1/2 overflow-hidden opacity-20">
    {Array.from({ length: 8 }).map((_, index) => (
      <span
        key={index}
        className="absolute font-mono text-[10px] text-cyan-200/45"
        style={
          {
            left: `${(index * 37) % 100}%`,
            top: `${8 + ((index * 19) % 82)}%`,
          } as CSSProperties
        }
      >
        {index % 3 === 0 ? "0101" : index % 3 === 1 ? "SYS" : "R3F"}
      </span>
    ))}
  </div>
);

const DialLetter = ({
  letter,
  index,
  lineIndex,
}: {
  letter: string;
  index: number;
  lineIndex: number;
}) => {
  const frames = useMemo(
    () =>
      Array.from({ length: dialFrames }, (_, frameIndex) => {
        return slotDigits[
          (frameIndex + index + lineIndex * 2) % slotDigits.length
        ];
      }),
    [index, lineIndex],
  );
  const [displayValue, setDisplayValue] = useState(frames[0]);

  useEffect(() => {
    const timers: number[] = [];
    const startDelay = (lineIndex * 180 + index * 55);

    frames.forEach((frame, frameIndex) => {
      timers.push(
        window.setTimeout(() => {
          setDisplayValue(frame);
        }, startDelay + frameIndex * dialFrameMs),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setDisplayValue(letter);
      }, startDelay + frames.length * dialFrameMs),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [frames, index, letter, lineIndex]);

  return (
    <span
      className="sci-fi-title-letter"
      style={
        {
          "--slot-width": getSlotWidth(letter),
        } as CSSProperties
      }
    >
      <span className="sci-fi-dial-cell">{displayValue}</span>
    </span>
  );
};

const MatrixTypewriter = ({
  text,
  startDelay = matrixTypeStartDelayMs,
}: {
  text: string;
  startDelay?: number;
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [scrambleChar, setScrambleChar] = useState("");
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleCount(text.length);
      return;
    }

    const startTimer = window.setTimeout(() => setIsActive(true), startDelay);
    return () => window.clearTimeout(startTimer);
  }, [prefersReducedMotion, startDelay, text.length]);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    if (visibleCount >= text.length) {
      setScrambleChar("");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const nextChar = text[visibleCount];
    const maxScrambleTicks = nextChar === " " ? 0 : 2;
    const pauseBefore =
      visibleCount === 0
        ? 0
        : getMatrixTypeDelay(text[visibleCount - 1] ?? " ");

    const schedule = (delay: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, delay));
    };

    schedule(pauseBefore, () => {
      if (cancelled) return;

      let scrambleTicks = 0;

      const runScramble = () => {
        if (cancelled) return;

        if (scrambleTicks >= maxScrambleTicks) {
          setScrambleChar("");
          setVisibleCount((count) => count + 1);
          return;
        }

        const randomIndex = Math.floor(
          Math.random() * matrixScrambleChars.length,
        );
        setScrambleChar(matrixScrambleChars[randomIndex] ?? "0");
        scrambleTicks += 1;
        schedule(matrixTypeBaseMs * 0.85, runScramble);
      };

      runScramble();
    });

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isActive, prefersReducedMotion, text, visibleCount]);

  const typedText = text.slice(0, visibleCount);
  const isComplete = visibleCount >= text.length;

  if (prefersReducedMotion) {
    return (
      <p className="sci-fi-matrix-type max-w-2xl font-mono text-xs leading-7 tracking-[0.18em] uppercase sm:text-sm">
        {text}
      </p>
    );
  }

  return (
    <p
      className="sci-fi-matrix-type max-w-2xl font-mono text-xs leading-7 tracking-[0.18em] uppercase sm:text-sm"
      aria-label={text}
    >
      {typedText}
      {!isComplete && scrambleChar ? (
        <span className="sci-fi-matrix-scramble">{scrambleChar}</span>
      ) : null}
      <span className="sci-fi-matrix-cursor" aria-hidden>
        ▌
      </span>
    </p>
  );
};

const SlotWord = ({ word, lineIndex }: { word: string; lineIndex: number }) => {
  return (
    <span className="block whitespace-nowrap">
      {word.split("").map((letter, index) => (
        <DialLetter
          key={`${word}-${index}`}
          letter={letter}
          index={index}
          lineIndex={lineIndex}
        />
      ))}
    </span>
  );
};

export const SciFiScrollOverlay = ({
  scrollContainerRef: _scrollContainerRef,
  onStart,
}: SciFiScrollOverlayProps) => {
  return (
    <div className="sci-fi-overlay-enter relative min-h-[300vh] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen max-w-none -translate-x-1/2"
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="sci-fi-scanline absolute inset-0 opacity-25" />
      </div>
      <ScrollGlyphs />

      <section className="relative z-10 flex min-h-[var(--sci-fi-viewport-height)] flex-col pt-12 pb-8">
        <div className="relative flex flex-1 flex-col px-5 sm:px-8 lg:px-[11vw]">
        <div className="flex items-start gap-6 font-mono text-[10px] tracking-[0.28em] text-zinc-500 sm:text-xs">
          <div className="mt-1 h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
          <div className="border-l border-white/10 pl-4 uppercase leading-relaxed sm:pl-5">
            {systemVersion}
          </div>
        </div>

        <div className="mt-auto w-full max-w-[1180px] pb-[10vh] pt-[14vh]">
          <h1
            className="sci-fi-hero-title font-display text-[clamp(3rem,10.3vw,9.5rem)] leading-[1.02] font-normal uppercase text-zinc-200"
            aria-label="Digital Architect"
          >
            {titleLines.map((line, index) => (
              <SlotWord key={line} word={line} lineIndex={index} />
            ))}
          </h1>

          <div className="mt-12 grid max-w-5xl gap-8 border-l border-white/10 pl-5 sm:ml-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:pl-8">
            <MatrixTypewriter text={heroDescription} />

            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
              {projectStats.map(({ value, label, tone }) => (
                <div key={label} className="border-t border-white/10 pt-3">
                  <div className="font-display text-2xl text-zinc-200">
                    {value}
                  </div>
                  <div
                    className={`mt-1 font-mono text-[9px] uppercase tracking-[0.22em] ${statLabelNeonClass[tone]}`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="relative z-10 flex min-h-[var(--sci-fi-viewport-height)] items-center px-5 py-24 sm:px-8 lg:px-[11vw]">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200/70">
              selected systems
            </p>
            <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] text-zinc-100 uppercase sm:text-7xl lg:text-8xl">
              spatial interfaces for data-heavy products
            </h2>
          </div>

          <div className="self-end border-l border-white/10 pl-6 font-mono text-xs leading-7 tracking-[0.18em] text-zinc-500 uppercase">
            3D dashboards, point-cloud visualisation, procedural worlds,
            realtime controls and cinematic product scenes.
          </div>
        </div>
      </section>

      <section className="relative z-10 flex min-h-[var(--sci-fi-viewport-height)] items-center justify-center px-5 py-24 sm:px-8 lg:px-[11vw]">
        <div className="max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.34em] text-zinc-500">
            interactive mode
          </p>
          <h2 className="mt-5 font-display text-5xl leading-none text-zinc-100 uppercase sm:text-7xl">
            enter the ship
          </h2>
          <p className="mx-auto mt-6 max-w-md font-mono text-xs leading-7 tracking-[0.18em] text-zinc-500 uppercase">
            Запусти сцену, щоб перейти від scroll-презентації до керування
            персонажем всередині sci-fi середовища.
          </p>

          <SoundHoverElement
            className="mt-8 inline-flex rounded-full"
            hoverTypeElement={SoundTypeElement.SELECT_2}
            hoverStyleElement={HoverStyleElement.quad}
          >
            <Button
              variant="default"
              className="h-12 cursor-pointer rounded-full bg-zinc-100 px-6 font-mono text-xs uppercase tracking-[0.22em] text-black hover:bg-cyan-200"
              onClick={onStart}
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Play
            </Button>
          </SoundHoverElement>
        </div>
      </section>

      <style>{`
        .sci-fi-hero-title {
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.18),
            0 5px 18px rgba(0, 0, 0, 0.62);
          -webkit-text-stroke: 0.35px rgba(255, 255, 255, 0.12);
        }

        .sci-fi-title-letter {
          display: inline-block;
          width: var(--slot-width);
          height: 1.04em;
          text-align: center;
          vertical-align: baseline;
        }

        .sci-fi-dial-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 1.04em;
          line-height: 1.04em;
        }

        .sci-fi-scanline {
          background:
            linear-gradient(transparent 50%, rgba(148, 163, 184, 0.06) 50%),
            linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.05), transparent);
          background-size: 100% 4px, 100% 100%;
        }

        .sci-fi-matrix-type {
          color: #86efac;
          text-shadow:
            0 0 8px rgba(74, 222, 128, 0.65),
            0 0 20px rgba(16, 185, 129, 0.28);
        }

        .sci-fi-matrix-scramble {
          color: #4ade80;
          text-shadow: 0 0 12px rgba(74, 222, 128, 0.9);
        }

        .sci-fi-matrix-cursor {
          margin-left: 1px;
          color: #34d399;
          text-shadow: 0 0 10px rgba(52, 211, 153, 0.85);
          animation: sci-fi-matrix-cursor-blink 0.9s step-end infinite;
        }

        @keyframes sci-fi-matrix-cursor-blink {
          0%,
          45% {
            opacity: 1;
          }

          50%,
          100% {
            opacity: 0.15;
          }
        }

        .sci-fi-overlay-enter {
          animation: sci-fi-overlay-enter 0.85s ease-out both;
        }

        @keyframes sci-fi-overlay-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sci-fi-scanline {
            animation: none;
          }

          .sci-fi-overlay-enter {
            animation: none;
          }

          .sci-fi-matrix-cursor {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

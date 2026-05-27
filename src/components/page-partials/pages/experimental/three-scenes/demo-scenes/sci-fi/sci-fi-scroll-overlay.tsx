import { Button } from "@/components/ui/button";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { ArrowDown, Play, Radio } from "lucide-react";
import { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";

type SciFiScrollOverlayProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onStart: () => void;
};

const titleLines = ["DIGITAL", "ARCHITECT"];

const telemetryItems = [
  "КООРДИНАТИ: 48.9226° N, 24.7111° E",
  "ВЕРСІЯ СИСТЕМИ: 1.0.114",
];

const projectStats = [
  ["12+", "WebGL сцен"],
  ["3D", "React Three Fiber"],
  ["60fps", "інтерактивні карти"],
];

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
  scrollContainerRef,
  onStart,
}: SciFiScrollOverlayProps) => {
  const scrollToPortfolio = () => {
    scrollContainerRef.current?.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative min-h-[300vh] text-zinc-100">
      <div
        className="pointer-events-none absolute top-0 left-1/2 z-0 min-h-full w-screen max-w-none -translate-x-1/2 bg-black/20"
        aria-hidden
      />
      <ScrollGlyphs />

      <section className="relative flex min-h-[var(--sci-fi-viewport-height)] flex-col overflow-hidden pt-12 pb-8">
        <div
          className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-screen max-w-none -translate-x-1/2"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="sci-fi-scanline absolute inset-0 opacity-25" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 sm:px-8 lg:px-[11vw]">
        <div className="flex items-start justify-between gap-6 font-mono text-[10px] tracking-[0.28em] text-zinc-500 sm:text-xs">
          <div className="mt-1 h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
          <div className="mr-auto border-l border-white/10 pl-4 uppercase leading-relaxed sm:pl-5">
            {telemetryItems.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 uppercase text-zinc-400 md:flex">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            live signal
          </div>
        </div>

        <div className="mt-[14vh] flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/45 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-300 sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.95)]" />
          доступний для проектів
        </div>

        <div className="mt-auto w-full max-w-[1180px] pb-[10vh]">
          <h1
            className="sci-fi-hero-title font-display text-[clamp(3rem,10.3vw,9.5rem)] leading-[1.02] font-normal uppercase text-zinc-200"
            aria-label="Digital Architect"
          >
            {titleLines.map((line, index) => (
              <SlotWord key={line} word={line} lineIndex={index} />
            ))}
          </h1>

          <div className="mt-12 grid max-w-5xl gap-8 border-l border-white/10 pl-5 sm:ml-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:pl-8">
            <p className="max-w-2xl font-mono text-xs leading-7 tracking-[0.2em] text-zinc-500 uppercase sm:text-sm">
              Перетворюю мільйони точок даних на інтерактивні 3D веб-проекти.
              Спеціалізуюся на WebGL, React Three Fiber та високопродуктивних
              картографічних системах.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
              {projectStats.map(([value, label]) => (
                <div key={label} className="border-t border-white/10 pt-3">
                  <div className="font-display text-2xl text-zinc-200">
                    {value}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-6 pl-5 sm:pl-12">
            <button
              type="button"
              className="group flex items-center gap-2 border-b border-zinc-200 pb-1 font-mono text-xs uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:text-cyan-200"
              onClick={scrollToPortfolio}
            >
              переглянути портфоліо
              <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-1" />
            </button>
            <a
              className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200"
              href="mailto:hello@abcfolio.dev"
            >
              зв'язатися
            </a>
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

        @media (prefers-reduced-motion: reduce) {
          .sci-fi-scanline {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

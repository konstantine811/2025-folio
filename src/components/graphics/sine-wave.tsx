import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimationPlaybackControlsWithThen,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";

type Props = {
  width?: number;
  height?: number;
  amplitude?: number;
  frequency?: number;
  segments?: number;
  duration?: number;
  stopAnimate?: boolean;
};

const buildSinePath = (
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  segments: number,
  phase01: number,
  energy01: number
) => {
  const midY = height / 2;
  const pts: string[] = [];
  const A = amplitude * energy01;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y =
      midY + A * Math.sin(2 * Math.PI * (frequency * (x / width) + phase01));
    pts.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
  }
  return pts.join(" ");
};

const SineWave = ({
  width = 30,
  height = 20,
  amplitude = 3,
  frequency = 2,
  segments = 30,
  duration = 1.3,
  stopAnimate = false,
}: Props) => {
  const theme = useThemeStore((s) => s.selectedTheme);
  const phaseControls = useRef<AnimationPlaybackControlsWithThen>(null);
  const [d, setD] = useState(() =>
    buildSinePath(width, height, amplitude, frequency, segments, 0, 1)
  );

  const phase = useMotionValue(0);
  const energy = useMotionValue(1);

  const updatePath = useCallback(() => {
    setD(
      buildSinePath(
        width,
        height,
        amplitude,
        frequency,
        segments,
        phase.get(),
        energy.get()
      )
    );
  }, [amplitude, energy, frequency, height, phase, segments, width]);

  useMotionValueEvent(phase, "change", updatePath);
  useMotionValueEvent(energy, "change", updatePath);

  useEffect(() => {
    phaseControls.current?.stop();
    phaseControls.current = animate(phase, [phase.get(), phase.get() + 1], {
      duration,
      repeat: Infinity,
      ease: "linear",
    });
    return () => phaseControls.current?.stop();
  }, [phase, duration]);

  useEffect(() => {
    if (stopAnimate) {
      phaseControls.current?.pause();
      animate(energy, 0, { duration: 0.5, ease: "easeOut" });
    } else {
      animate(energy, 1, { duration: 0.25, ease: "easeOut" }).then(() => {
        phaseControls.current?.play();
      });
    }
  }, [stopAnimate, width, height, amplitude, frequency, segments, energy]);

  useEffect(() => {
    updatePath();
  }, [updatePath]);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <line
          strokeWidth={0.4}
          stroke={ThemePalette[theme]["muted-foreground"]}
          x1="0"
          x2="100%"
          y1={height / 2}
          y2={height / 2}
        />
        <motion.path
          d={d}
          fill="none"
          strokeWidth={0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={ThemePalette[theme].foreground}
        />
      </g>
    </svg>
  );
};

export default SineWave;

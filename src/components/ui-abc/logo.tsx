import { ThemePalette } from "@config/theme-colors.config";
import { useThemeStore } from "@storage/themeStore";
import { motion, Variants } from "motion/react";
import { forwardRef, useEffect, useState } from "react";

const LogoAnimated = forwardRef<SVGSVGElement>((_, ref) => {
  const themeType = useThemeStore((state) => state.selectedTheme);
  const [colors, setColors] = useState(ThemePalette.dark);
  const strokeWidth = 3;
  const pathVariants: Variants = {
    initial: { pathLength: 0, scale: 1.01, opacity: 0 },
    animate: (i: number) => ({
      pathLength: 1,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        delay: i * 0.3,
        ease: "easeInOut",
      },
    }),
  };

  useEffect(() => {
    const themeColors = ThemePalette[themeType];
    setColors(themeColors);
  }, [themeType]);

  const paths: string[] = [
    "M128.5 57L146.5 34.5H102L110.5 57H128.5Z",
    "M136 4.5L147.5 31H100L126 95H174.5L185.5 120.5H108.5L57 5L136 4.5Z",
    "M89.5 145.5L109 121H186L170 145.5H89.5Z",
    "M5 121.5L57 5.5L108.5 121L89.5 145.5L57 72L23.5 144L5 121.5Z",
    "M50 146H27L57.5 78L70 102L50 146Z",
    "M2.5 122L53.5 2.5H136L147.5 31L128 57.5L144 95H174.5L185.5 121L170.5 145.5L24 146L2.5 122Z",
  ];

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 190 150"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "auto" }} // 👈 responsive
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill={i === 5 ? "none" : "url(#mainGradient)"} // останній path без заливки
          stroke={colors.foreground}
          strokeWidth={strokeWidth}
          variants={pathVariants}
          initial="initial"
          animate="animate"
          custom={i}
        />
      ))}

      <defs>
        <linearGradient
          id="mainGradient"
          x1="0"
          y1="150"
          x2="0"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={colors["muted-foreground"]} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
      </defs>
    </motion.svg>
  );
});

export default LogoAnimated;

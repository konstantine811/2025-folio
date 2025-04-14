import { motion } from "motion/react";

const LogoAnimated = () => {
  const pathVariants = {
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

  const stroke = "#0F0F0F";
  const strokeWidth = 3;
  const gradientBottomColor = "#015C01";
  const gradientTopColor = "#F5F521";

  const paths: string[] = [
    "M128.5 57L146.5 34.5H102L110.5 57H128.5Z",
    "M136 4.5L147.5 31H100L126 95H174.5L185.5 120.5H108.5L57 5L136 4.5Z",
    "M89.5 145.5L109 121H186L170 145.5H89.5Z",
    "M5 121.5L57 5.5L108.5 121L89.5 145.5L57 72L23.5 144L5 121.5Z",
    "M50 146H27L57.5 78L70 102L50 146Z",
    "M2.5 122L53.5 2.5H136L147.5 31L128 57.5L144 95H174.5L185.5 121L170.5 145.5L24 146L2.5 122Z",
  ];

  return (
    <svg
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
          stroke={stroke}
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
          <stop offset="0%" stopColor={gradientBottomColor} />
          <stop offset="100%" stopColor={gradientTopColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LogoAnimated;

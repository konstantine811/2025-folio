import { motion } from "framer-motion";

interface GeniverseTextProps {
  show: boolean;
}

const GeniverseText = ({ show }: GeniverseTextProps) => {
  const word = "geniverse";
  const letters = word.split("");

  return (
    <motion.div
      className="absolute inset-0 flex items-end justify-center pointer-events-none bottom-1/4"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.9 }}
    >
      <motion.div
        className="text-white text-6xl md:text-8xl font-bold tracking-tight"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          textTransform: "lowercase",
        }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{
              opacity: 0,
              y: 20,
              filter: "blur(10px)",
            }}
            animate={
              show
                ? {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }
                : {
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)",
                  }
            }
            transition={{
              delay: index * 0.1,
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default GeniverseText;

import { motion } from "framer-motion";

type Layer = { color: string; z: number; offset: number };

type Props = {
  size?: number;
  speedSec?: number;
  amplitude?: number;
  layerDelay?: number;
  layers?: Layer[];
};

const defaultLayers: Layer[] = [
  { color: "#7CC1F6", z: 30, offset: -16 },
  { color: "#F27683", z: 20, offset: 0 },
  { color: "#F0C16E", z: 10, offset: 16 },
  { color: "#A384F2", z: 0, offset: 32 },
];

export default function StackLayers({
  size = 50,
  speedSec = 6.8,
  amplitude = 2,
  layerDelay = 4.38,
  layers = defaultLayers,
}: Props) {
  return (
    <div
      className="relative select-none rotate-x-45"
      style={{ width: size, height: size }}
      aria-label="Animated stacked layers"
    >
      {/* тінь під стопкою */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-4 w-24 rounded-full bg-black/10 blur-md" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {layers.map((l, i) => (
          <motion.div
            key={i}
            className="absolute will-change-transform"
            style={{ zIndex: l.z }}
            animate={{ y: [-amplitude, amplitude, -amplitude] }}
            transition={{
              duration: speedSec,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * layerDelay, // мікро-затримка між шарами
            }}
          >
            <div
              className="rotate-45 shadow-md"
              style={{
                // важливо: НІЯКОГО transform тут
                marginTop: l.offset, // офсет шару
                width: size * 0.6,
                height: size * 0.6,
                backgroundColor: l.color,
                borderRadius: size * 0.18,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

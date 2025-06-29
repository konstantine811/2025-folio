// BirdyBeatsCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const rhythms = [300, 500, 700]; // ms delay per beat for 3 example rhythms

interface Bird {
  id: number;
  x: number;
  y: number;
  rhythm: number | null; // index of rhythm
  beat: boolean;
}

const useBirds = (count: number) => {
  const [birds, setBirds] = useState<Bird[]>(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 100 + i * 100,
      y: 200,
      rhythm: null,
      beat: false,
    }))
  );

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    birds.forEach((bird) => {
      if (bird.rhythm !== null) {
        const interval = setInterval(() => {
          setBirds((prev) =>
            prev.map((b) => (b.id === bird.id ? { ...b, beat: true } : b))
          );
          setTimeout(() => {
            setBirds((prev) =>
              prev.map((b) => (b.id === bird.id ? { ...b, beat: false } : b))
            );
          }, 100);
        }, rhythms[bird.rhythm]);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [birds]);

  const setRhythm = (id: number, rhythm: number) => {
    setBirds((prev) => prev.map((b) => (b.id === id ? { ...b, rhythm } : b)));
  };

  return { birds, setRhythm };
};

const BirdyBeatsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { birds, setRhythm } = useBirds(7);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    let animationFrameId: number;

    const background = new Image();
    background.src = "/images/birdy-beats/bg-house.png";

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (background.complete) {
        ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      birds.forEach((bird) => {
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.beat ? 30 : 20, 0, Math.PI * 2);
        ctx.fillStyle = "orange";
        ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText(`Bird ${bird.id + 1}`, bird.x - 20, bird.y + 40);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [birds]);

  return (
    <div className="relative w-full h-screen bg-blue-100 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1024}
        height={600}
        className="block mx-auto mt-2 border"
      />

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {birds.map((bird) => (
          <motion.div key={bird.id} className="text-center">
            <label className="block text-sm mb-1">Bird {bird.id + 1}</label>
            <select
              className="border px-2 py-1 rounded"
              onChange={(e) => setRhythm(bird.id, parseInt(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                🎵 Select rhythm
              </option>
              {rhythms.map((_, i) => (
                <option key={i} value={i}>
                  Rhythm {i + 1}
                </option>
              ))}
            </select>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BirdyBeatsCanvas;

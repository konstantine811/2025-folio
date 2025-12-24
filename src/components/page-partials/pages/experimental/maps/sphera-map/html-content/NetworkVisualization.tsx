import { motion } from "framer-motion";
import {
  CreditCard,
  SmartphoneNfc,
  Wallet,
  Bitcoin,
  Landmark,
  Globe,
  Hexagon,
  LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  position: { top: string; left: string };
  path: { x: number; y: number };
}

const nodes: Node[] = [
  {
    id: "1",
    icon: CreditCard,
    label: "Visa Net",
    color: "blue",
    position: { top: "25%", left: "20%" },
    path: { x: 0.2, y: 0.25 },
  },
  {
    id: "2",
    icon: SmartphoneNfc,
    label: "Apple Pay",
    color: "green",
    position: { top: "25%", left: "80%" },
    path: { x: 0.8, y: 0.25 },
  },
  {
    id: "3",
    icon: Wallet,
    label: "PayPal",
    color: "pink",
    position: { top: "75%", left: "25%" },
    path: { x: 0.25, y: 0.75 },
  },
  {
    id: "4",
    icon: Bitcoin,
    label: "Crypto API",
    color: "yellow",
    position: { top: "75%", left: "75%" },
    path: { x: 0.75, y: 0.75 },
  },
  {
    id: "5",
    icon: Landmark,
    label: "SEPA",
    color: "purple",
    position: { top: "50%", left: "10%" },
    path: { x: 0.1, y: 0.5 },
  },
  {
    id: "6",
    icon: Globe,
    label: "SWIFT",
    color: "cyan",
    position: { top: "50%", left: "90%" },
    path: { x: 0.9, y: 0.5 },
  },
];

const colorClasses = {
  blue: "border-blue-500/30 hover:border-blue-400 text-blue-400",
  green: "border-green-500/30 hover:border-green-400 text-green-400",
  pink: "border-pink-500/30 hover:border-pink-400 text-pink-400",
  yellow: "border-yellow-500/30 hover:border-yellow-400 text-yellow-400",
  purple: "border-purple-500/30 hover:border-purple-400 text-purple-400",
  cyan: "border-cyan-500/30 hover:border-cyan-400 text-cyan-400",
};

const NetworkVisualization = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    // Inject CSS for flow animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes flow {
        0% {
          offset-distance: 0%;
          opacity: 0;
          transform: scale(0.5);
        }
        10% {
          opacity: 1;
          transform: scale(1.2);
        }
        90% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          offset-distance: 100%;
          opacity: 0;
          transform: scale(0.5);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const updatePaths = () => {
      if (!svgRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.5;
      const cy = h * 0.5;

      const newPaths = nodes.map((node) => {
        const x = w * node.path.x;
        const y = h * node.path.y;
        return `M${cx} ${cy} L${x} ${y}`;
      });

      setPaths(newPaths);
      svgRef.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
    };

    updatePaths();
    window.addEventListener("resize", updatePaths);
    return () => window.removeEventListener("resize", updatePaths);
  }, []);

  return (
    <motion.div
      className="w-full max-w-6xl mt-32 relative z-20 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-1 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-xl mb-6">
          <span className="px-4 py-1.5 text-xs font-medium text-slate-300 rounded-full bg-slate-800 border border-slate-700 shadow-sm">
            Integration Ecosystem
          </span>
          <span className="px-4 py-1.5 text-xs font-medium text-slate-500">
            Public Nodes
          </span>
          <span className="px-4 py-1.5 text-xs font-medium text-slate-500">
            Private Cloud
          </span>
        </div>
      </div>

      {/* Network Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[600px] border border-white/[0.05] rounded-3xl bg-[#0B0E14]/50 backdrop-blur-sm shadow-2xl overflow-hidden"
      >
        {/* SVG Layer for Lines */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection Lines */}
          {paths.map((path, index) => {
            const colors = [
              "#60A5FA",
              "#34D399",
              "#F472B6",
              "#FBBF24",
              "#A78BFA",
              "#22D3EE",
            ];
            const durations = [3, 4, 3.5, 5, 4.5, 3.8];
            const delays = [0, 0.5, 1, 0.2, 1.5, 0.8];
            return (
              <g key={index}>
                <path
                  d={path}
                  vectorEffect="non-scaling-stroke"
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  className="opacity-20"
                />
                <circle
                  r="3"
                  fill={colors[index]}
                  filter="url(#glow)"
                  style={{
                    offsetPath: `path('${path}')`,
                    animation: `flow ${durations[index]}s infinite ease-in-out ${delays[index]}s`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-950 border border-slate-800 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] animate-pulse">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20"
              style={{
                animation: "spin 10s linear infinite",
              }}
            />
            <Hexagon className="w-10 h-10 text-white relative z-10" />
          </div>
        </div>

        {/* Satellite Nodes */}
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-3"
              style={{
                top: node.position.top,
                left: node.position.left,
              }}
            >
              <div
                className={`relative w-12 h-12 rounded-full bg-[#1e293b] border flex items-center justify-center shadow-lg group transition-colors cursor-pointer ${
                  colorClasses[node.color as keyof typeof colorClasses]
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-widest uppercase text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {node.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NetworkVisualization;

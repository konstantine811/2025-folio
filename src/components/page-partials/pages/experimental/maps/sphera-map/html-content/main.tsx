import { motion } from "framer-motion";
import { Layers, BarChart3, Globe2, LucideIcon } from "lucide-react";
import { useEffect } from "react";
import NetworkVisualization from "./NetworkVisualization";
import AppsSection from "./AppsSection";
import TrustedUsersSection from "./TrustedUsersSection";

const Main = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Ensure smooth scrolling is enabled
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.scrollBehavior = "smooth";

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="bg-[#020408] text-slate-300 font-['Inter'] antialiased w-full overflow-hidden">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        * {
          scroll-behavior: smooth;
        }
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main Content */}
      <main
        className="relative w-full flex flex-col items-center pt-32 isolate overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* Background Ambient Light */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-[-1]" />

        {/* Typography Section */}
        <TypographySection />

        {/* The 3D Planet Environment */}
        <div className="relative w-full mt-16 md:mt-28 z-10 flex flex-col items-center">
          {/* 3D Sphere Object */}
          <Sphere />

          {/* Interactive Grid Cards */}
          <CardsGrid />

          {/* Network Integration Visualization */}
          <NetworkVisualization />
          <div className="w-full">{children}</div>
        </div>
      </main>

      {/* Apps Section */}
      <AppsSection />

      {/* Trusted Users Section */}
      <div className="bg-white pt-[200px] pb-[400px]">
        <TrustedUsersSection />
      </div>
    </div>
  );
};

const TypographySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="text-center px-6 max-w-4xl mx-auto z-20 flex flex-col items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-7xl md:text-9xl font-semibold tracking-tight mb-8 text-gradient leading-[0.9]"
        variants={itemVariants}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
        }}
        style={{
          background: "linear-gradient(to bottom, #ffffff 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          transform: "translateZ(0)",
        }}
      >
        SPHERA
      </motion.h1>
      <motion.p
        className="text-base md:text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto"
        variants={itemVariants}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
        }}
        style={{
          transform: "translateZ(0)",
        }}
      >
        Seamlessly integrating on-premise infrastructure with cloud environments
        through a unified, intelligent management interface.
      </motion.p>
    </motion.div>
  );
};

const Sphere = () => {
  return (
    <motion.div
      className="absolute top-[60px] w-[250vw] h-[250vw] md:w-[140vw] md:h-[140vw] rounded-full sphere-surface z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.2,
        delay: 0.6,
        ease: "easeOut",
      }}
      style={{
        background:
          "radial-gradient(circle at 50% -50%, #1e293b 0%, #0f172a 40%, #020408 100%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 -60px 150px -20px rgba(37,99,235,0.45), inset 0 4px 20px rgba(100, 200, 255, 0.1)",
        transform: "translateZ(0)",
        willChange: "transform, opacity",
      }}
    />
  );
};

const CardsGrid = () => {
  const cards = [
    {
      icon: Layers,
      title: "Procurement",
      description:
        "Integrated hyper-converged solutions for public sector scalability and unified management control.",
      delay: 0.6,
    },
    {
      icon: BarChart3,
      title: "Investment",
      description:
        "Analyzing infrastructure ROI with real-time telemetry and predictive cost modeling.",
      delay: 0.8,
    },
    {
      icon: Globe2,
      title: "Global Reach",
      description:
        "Connecting international project nodes via secure, encrypted tunnels for seamless data replication.",
      delay: 1.0,
      highlight: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.8,
      },
    },
  };

  return (
    <motion.div
      className="relative w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 md:mt-48 z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <Card key={index} {...card} />
      ))}
    </motion.div>
  );
};

const Card = ({
  icon: Icon,
  title,
  description,
  delay,
  highlight = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  highlight?: boolean;
}) => {
  return (
    <motion.div
      className={`group flex flex-col items-start text-left p-6 md:p-8 rounded-xl backdrop-blur-sm transition-all duration-500 ${
        highlight
          ? "bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-2xl hover:bg-white/[0.04] hover:border-white/[0.1]"
          : "border border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]"
      }`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
    >
      {highlight && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
      <div
        className={`mb-4 ${
          highlight
            ? "text-white"
            : "text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3
        className={`text-xs font-medium tracking-widest uppercase mb-3 ${
          highlight ? "text-white" : "text-slate-200"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${
          highlight
            ? "text-slate-400"
            : "text-slate-500 group-hover:text-slate-400 transition-colors duration-500"
        }`}
      >
        {description}
      </p>
    </motion.div>
  );
};

export default Main;

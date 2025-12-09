import {
  BoxIcon,
  CpuIcon,
  DatabaseIcon,
  MapIcon,
  Server,
  Zap,
} from "lucide-react";
import TechCard from "./TechCard";
import { useTranslation } from "react-i18next";

const TechStack = () => {
  const { t } = useTranslation();
  return (
    <section id="stack" className="py-20 container mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          {t("portfolio.tech_stack.title")}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          [ TECH_STACK_INIT ]
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-l border-foreground/10">
        <TechCard
          icon={
            <CpuIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="FRONTEND (RxJS, Zustand)"
          description="Angular / React"
        />
        <TechCard
          icon={
            <BoxIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="Shaders, Physics"
          description="Three.js / R3F"
        />
        <TechCard
          icon={
            <MapIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="D3.js Visualization"
          description="Mapbox / ArcGIS"
        />
        <TechCard
          icon={
            <Server className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="Backend"
          description="Node.js, Express, Next.js"
        />
        <TechCard
          icon={
            <DatabaseIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="DATA"
          description="IndexedDB, MongoDB, Firebase"
        />
        <TechCard
          icon={
            <Zap className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors stroke-[1.5]" />
          }
          title="Animation"
          description="Gsap, Framer Motion, Theatre.js"
        />
      </div>
    </section>
  );
};

export default TechStack;

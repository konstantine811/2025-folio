import { useTranslation } from "react-i18next";
import ExperienceCard from "./ExperienceCard";

const Experience = () => {
  const { t } = useTranslation();
  return (
    <section id="experience" className="lg:py-32 relative overflow-hidden">
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-muted-foreground to-transparent md:-translate-x-1/2"></div>

      <div className="max-w-5xl mx-auto px-6 relative">
        <h2 className="text-center text-sm font-mono text-muted-foreground uppercase tracking-widest mb-16 relative z-10 bg-muted-foreground/20 inline-block px-4 left-1/2 -translate-x-1/2">
          {t("portfolio.experience.title")}
        </h2>
        <ExperienceCard
          status={t("portfolio.experience.u_studio.status")}
          isCurrent={true}
          title="UStudio"
          description={t("portfolio.experience.u_studio.description")}
          technologies={[
            "React",
            "Mapbox",
            "OSM",
            "Redux",
            "Tailwind CSS",
            "D3.js",
            "Node.js",
          ]}
          circleClassName="bg-accent"
        />
        <ExperienceCard
          status={t("portfolio.experience.cubic_worlds_game.status")}
          title="Cubic Worlds Game"
          isRight={true}
          description={t("portfolio.experience.cubic_worlds_game.description")}
          technologies={[
            "React Three Fiber",
            "Zustand",
            "Three.js",
            "Shaders",
            "R3F",
            "WebGL",
          ]}
          circleClassName="bg-violet-500"
        />
        <ExperienceCard
          status={t("portfolio.experience.kernel.status")}
          title={t("portfolio.experience.kernel.title")}
          description={t("portfolio.experience.kernel.description")}
          technologies={[
            "Angular",
            "ArcGIS",
            "Mapbox",
            "D3.js",
            "IndexedDB",
            "AG Grid",
            "Material UI",
          ]}
          circleClassName="bg-zinc-700"
        />
        <ExperienceCard
          status={t("portfolio.experience.ixlayer.status")}
          isRight={true}
          title={t("portfolio.experience.ixlayer.title")}
          description={t("portfolio.experience.ixlayer.description")}
          technologies={["Vue.js", "Animation", "API"]}
          circleClassName="bg-yellow-500"
        />
        <ExperienceCard
          status={t("portfolio.experience.computools.status")}
          title="Computools"
          description={t("portfolio.experience.computools.description")}
          technologies={[
            "HTML",
            "CSS",
            "JavaScript",
            "Angular",
            "TypeScript",
            "Agile",
          ]}
          circleClassName="bg-green-200"
        />
      </div>
    </section>
  );
};

export default Experience;

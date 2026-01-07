import React from "react";
import { useTranslation } from "react-i18next";
import { PROJECTS_DATA } from "./constant";
import { ArrowUpRight } from "lucide-react";

const CaseStadies = ({
  openProject,
}: {
  openProject: (id: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <section id="projects" className="py-20 container mx-auto">
      <div className="flex items-end justify-between mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          {t("portfolio.case_studies.title")}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {t("portfolio.case_studies.subtitle")}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          "map_dream",
          "dashboard_fields",
          "passport_field",
          "ixlayer_landing",
        ].map((id) => {
          const p = PROJECTS_DATA[id];
          const gradients: Record<string, string> = {
            indigo: "from-indigo-900/30",
            emerald: "from-emerald-900/30",
            amber: "from-amber-900/30",
            pink: "from-pink-900/30",
          };
          return (
            <div
              key={id}
              onClick={() => openProject(id)}
              className="project-trigger group relative h-[360px] bg-background border border-muted-foreground/30 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:border-border/20"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  gradients[p.color || "indigo"]
                } via-transparent to-background/40 opacity-40 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs text-muted-foreground tracking-widest">
                    [ {p.category} ]
                  </span>
                  <div className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center transform transition-all duration-500 group-hover:rotate-45 group-hover:scale-110">
                    <ArrowUpRight className="w-5 h-5 stroke-2" />
                  </div>
                </div>
                <div>
                  <span
                    className={`font-mono text-[10px] text-muted-foreground mb-2 block tracking-widest`}
                  >
                    {p.subtitle}
                  </span>
                  <h3 className="font-display text-4xl md:text-5xl text-foreground tracking-tight uppercase leading-[0.9] group-hover:translate-x-2 transition-transform duration-300">
                    {p.title.split(" ").map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        <br />
                      </React.Fragment>
                    ))}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CaseStadies;

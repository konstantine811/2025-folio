import { getExperienceList } from "./constant";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const SelectedWorks = ({
  openProject,
}: {
  openProject: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const experienceList = getExperienceList(t);

  return (
    <section id="experience" className="py-12 container mx-auto">
      <div className="mb-16 border-b border-foreground/10 pb-4 flex justify-between items-baseline">
        <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-foreground uppercase">
          Selected Works
        </h2>
        <span className="font-mono text-xs uppercase text-muted-foreground">
          [ CLICK FOR DETAILS ]
        </span>
      </div>

      <div className="space-y-0">
        {experienceList.map((item) => (
          <div
            key={item.id}
            onClick={() => openProject(item.id)}
            className="project-trigger cursor-pointer group border-b border-foreground/5 py-10 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-foreground/5 transition-colors px-4 -mx-4 rounded-lg"
          >
            <div className="md:w-1/3">
              <span className="font-mono text-[10px] text-muted-foreground mb-2 block tracking-widest">
                {item.number} / {item.category}
              </span>
              <h3
                className={`text-2xl md:text-3xl font-display font-medium tracking-tight text-foreground ${item.colorClass} transition-colors duration-300 flex items-center gap-2`}
              >
                {item.title}
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
            </div>
            <div className="md:w-1/3">
              <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-sm">
                {item.description}
              </p>
            </div>
            <div className="md:w-1/6 flex justify-end">
              <div className="flex flex-col items-end gap-2 text-muted-foreground">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/10 px-2 py-1 font-mono text-[10px] uppercase rounded bg-background/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SelectedWorks;

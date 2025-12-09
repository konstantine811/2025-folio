import { cn } from "@/lib/utils";

const ExperienceCard = ({
  status,
  title,
  description,
  technologies,
  circleClassName,
  isRight = false,
  isCurrent = false,
}: {
  status: string;
  isCurrent?: boolean;
  title: string;
  description: string;
  technologies: string[];
  circleClassName: string;
  isRight?: boolean;
}) => {
  return (
    <div className="font-display relative grid md:grid-cols-2 gap-8 mb-24 items-center">
      <div
        className={cn(
          "md:text-right",
          isRight
            ? "order-2 md:order-1 md:text-right"
            : "order-2 md:order-0 pl-8 md:pl-0"
        )}
      >
        <div
          className={cn(
            isRight && "order-2 md:order-1 pl-8 md:pl-0 md:text-left"
          )}
        >
          <span
            className={cn(
              "text-xs mb-2 block",
              isCurrent ? "text-accent" : "text-muted-foreground"
            )}
          >
            {status}
          </span>
          <h3 className="text-2xl font-medium text-foreground tracking-tight">
            {title}
          </h3>
          <p className="font-mono text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "absolute -left-[5px] md:left-1/2 w-3 h-3 rounded-full md:-translate-x-1/2 glow-point ring-4 ring-card",
          circleClassName
        )}
      ></div>

      <div
        className={cn(
          !isRight ? "order-1 md:order-2 pl-8 md:pl-0" : "pl-8 md:pl-0"
        )}
      >
        <div
          className={cn(
            "flex flex-wrap gap-2",
            isRight ? "md:justify-end" : "md:justify-start"
          )}
        >
          {technologies.map((technology) => (
            <span
              key={technology}
              className="px-2 py-1 rounded bg-card border border-muted-foreground/10 text-[10px] text-muted-foreground uppercase tracking-wider"
            >
              {technology}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;

import { ReactNode } from "react";

const TechCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="aspect-square border-r border-b border-foreground/10 p-6 flex flex-col justify-between hover:bg-card transition-colors group">
      {icon}
      <div>
        <span className="font-mono text-[10px] text-muted-foreground block mb-1">
          {title}
        </span>
        <span className="font-display text-lg tracking-tight text-foreground/80 group-hover:text-foreground">
          {description}
        </span>
      </div>
    </div>
  );
};

export default TechCard;

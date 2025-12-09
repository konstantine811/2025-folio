import { cn } from "@/lib/utils";

const HorizontalLine = ({ className }: { className?: string }) => {
  return <div className={cn("w-full h-px bg-foreground/10", className)}></div>;
};

export default HorizontalLine;

import { cn } from "@/utils/classname";

export function StyledKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-semibold font-mono tracking-tight",
        "bg-background text-accent border border-background-alt shadow-sm",
        "transition-all duration-150",
        "hover:shadow-md hover:bg-surface",
        "active:scale-95"
      )}
    >
      {children}
    </kbd>
  );
}

import { cn } from "@/utils/classname";

export function StyledKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-semibold font-mono tracking-tight",
        "bg-background text-primary border border-card shadow-sm",
        "transition-all duration-150",
        "hover:shadow-md hover:bg-primary/10",
        "active:scale-95"
      )}
    >
      {children}
    </kbd>
  );
}

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatSeconds } from "@/utils/time.util";

const TaskLocalTimeStatic = ({
  timeInSeconds,
  revert = false,
  tooltipText,
}: {
  timeInSeconds: number;
  revert?: boolean;
  tooltipText?: string;
}) => {
  const isNegative = timeInSeconds < 0;
  const { hours, minutes } = formatSeconds(Math.abs(timeInSeconds));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`flex items-center gap-0.5 font-mono text-xs pl-5 relative ${
            isNegative ? "text-destructive/70" : "text-accent/70"
          } ${!revert && "text-muted-foreground"}`}
        >
          {revert && isNegative && <span className="absolute left-2">-</span>}
          <span>{String(hours).padStart(2, "0")}</span>
          <span className="text-muted-foreground">:</span>
          <span>{String(minutes).padStart(2, "0")}</span>
        </div>
      </TooltipTrigger>
      {tooltipText && (
        <TooltipContent className="text-xs text-card">
          {tooltipText}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default TaskLocalTimeStatic;

import { SlidingNumber } from "@/components/ui/sliding-number";
import { formatSeconds } from "@/utils/time.util";
import { useEffect, useState } from "react";
import { useTaskManager } from "./context/use-task-manger-context";

const TaskTimer = () => {
  const playingTask = useTaskManager((s) => s.playingTask);
  const startedAt = useTaskManager((s) => s.startedAt);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playingTask && startedAt) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setTime(playingTask.timeDone + elapsed);
      }

      // if you want to reset the timer when the task is completed   } else {
      //     setTime(0);
      //   }
    }, 1000);

    return () => clearInterval(interval);
  }, [playingTask, startedAt]);

  const { hours, minutes, seconds } = formatSeconds(time);

  return (
    <div className="flex items-center gap-0.5 font-mono">
      <SlidingNumber value={hours} padStart={true} />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={minutes} padStart={true} />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={seconds} padStart={true} />
    </div>
  );
};

export default TaskTimer;

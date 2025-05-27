import { SlidingNumber } from "@/components/ui/sliding-number";
import { useTaskManagerStore } from "@/storage/task-manager/task-manager";
import { formatSeconds } from "@/utils/time.util";
import { useEffect, useState } from "react";

const TaskTimer = () => {
  const playingTask = useTaskManagerStore((s) => s.playingTask);
  const startedAt = useTaskManagerStore((s) => s.startedAt);
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

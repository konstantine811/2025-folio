import { ItemTask } from "@/types/drag-and-drop.model";
import TaskLocalTimeStatic from "../task-local-time-static";

const TaskDeterminedTime = ({
  task,
  titleDeterminedTime,
  titleSpendingTime,
}: {
  task: ItemTask;
  titleDeterminedTime: string;
  titleSpendingTime: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <TaskLocalTimeStatic
        timeInSeconds={task.time}
        tooltipText={titleDeterminedTime}
      />
      <TaskLocalTimeStatic
        timeInSeconds={task.timeDone}
        revert
        tooltipText={titleSpendingTime}
      />
    </div>
  );
};

export default TaskDeterminedTime;

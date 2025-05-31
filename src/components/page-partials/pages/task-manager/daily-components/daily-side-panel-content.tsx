import TaskFutureTimeline from "../future-task-components/task-future-timeline";
import { useDailyTaskContext } from "../hooks/useDailyTask";
import DailyCalendar from "./daily-calendar";

const DailySidePanelContent = () => {
  const { plannedTasks } = useDailyTaskContext();

  return (
    <div className="flex flex-col gap-4">
      <DailyCalendar />
      {plannedTasks && plannedTasks.length > 0 && (
        <TaskFutureTimeline tasks={plannedTasks} />
      )}
    </div>
  );
};

export default DailySidePanelContent;

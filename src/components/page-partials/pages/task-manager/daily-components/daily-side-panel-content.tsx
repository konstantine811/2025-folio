import { useTranslation } from "react-i18next";
import TaskFutureTimeline from "../future-task-components/task-future-timeline";
import { useDailyTaskContext } from "../hooks/useDailyTask";
import DailyCalendar from "./daily-calendar";

const DailySidePanelContent = () => {
  const { plannedTasks } = useDailyTaskContext();
  const [t] = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <DailyCalendar />
      {plannedTasks && plannedTasks.length > 0 && (
        <div>
          <h3 className="text-md font-medium">
            {t("task_manager.planned_tasks")}
          </h3>
          <TaskFutureTimeline tasks={plannedTasks} />
        </div>
      )}
    </div>
  );
};

export default DailySidePanelContent;

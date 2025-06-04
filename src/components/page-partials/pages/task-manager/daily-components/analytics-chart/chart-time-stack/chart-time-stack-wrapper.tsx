import { useEffect, useState } from "react";
import ChartTimeStackTasks from "./chart-time-stack-tasks";
import ChartTimeToggle from "./chart-time-stack-toggle";
import { useDailyTaskContext } from "../../../hooks/useDailyTask";
import {
  TaskAnalyticsBarOrientation,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { getDailyTaskAnalyticsData } from "@/services/task-menager/analytics/daily-handle-data";
import ChartTitle from "../../../chart/chart-title";

const ChartTimeStackWrapper = () => {
  const { dailyTasks } = useDailyTaskContext();
  // const [normalizedTasks, setNormalizedTasks] = useState<NormalizedTask[]>([]);
  const [dailyEntity, setDailyEntity] = useState<TaskAnalyticsIdEntity>({});
  const [orientation, setOrientation] =
    useState<TaskAnalyticsBarOrientation>("horizontal");
  useEffect(() => {
    const { dailyEntity } = getDailyTaskAnalyticsData(dailyTasks);
    setDailyEntity(dailyEntity);
  }, [dailyTasks]);
  return (
    <>
      {dailyTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <ChartTitle title="chart.task_day_count" />
            <ChartTimeToggle
              value={orientation}
              onValueChange={(value) => {
                setOrientation(value);
              }}
            />
          </div>
          <ChartTimeStackTasks data={dailyEntity} direction={orientation} />
        </div>
      )}
    </>
  );
};

export default ChartTimeStackWrapper;

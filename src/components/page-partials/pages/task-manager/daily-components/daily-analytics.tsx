import { useEffect, useState } from "react";
import { useDailyTaskContext } from "../hooks/useDailyTask";
import ChartTimeStackWrapper from "./analytics-chart/chart-time-stack/chart-time-stack-wrapper";
import {
  CategoryAnalyticsNameEntity,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { getDailyTaskAnalyticsData } from "@/services/task-menager/analytics/daily-handle-data";
import ChartPieCateogoryWrap from "./analytics-chart/chart-pie-category/chart-pie-category-wrap";

const DailyAnalytics = () => {
  const { dailyTasks } = useDailyTaskContext();
  const [dailyEntity, setDailyEntity] = useState<TaskAnalyticsIdEntity>({});
  const [categoryEntity, setCategoryEntity] =
    useState<CategoryAnalyticsNameEntity>({});

  useEffect(() => {
    const { dailyEntity, categoryEntity } =
      getDailyTaskAnalyticsData(dailyTasks);
    setDailyEntity(dailyEntity);
    setCategoryEntity(categoryEntity);
  }, [dailyTasks]);
  return (
    <>
      <ChartTimeStackWrapper data={dailyEntity} />
      <ChartPieCateogoryWrap data={categoryEntity} />
    </>
  );
};

export default DailyAnalytics;

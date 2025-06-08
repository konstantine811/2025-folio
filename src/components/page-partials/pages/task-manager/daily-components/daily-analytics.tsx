import { useEffect, useState } from "react";
import { useDailyTaskContext } from "../hooks/useDailyTask";
import ChartTimeStackWrapper from "./analytics-chart/chart-time-stack/chart-time-stack-wrapper";
import {
  CategoryAnalyticsNameEntity,
  DailyAnalyticsData,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { getDailyTaskAnalyticsData } from "@/services/task-menager/analytics/daily-handle-data";
import ChartPieCateogoryWrap from "./analytics-chart/chart-pie-category/chart-pie-category-wrap";
import DailyAnalyticsTable from "./analytics-chart/daily-analytics-table";

const DailyAnalytics = () => {
  const { dailyTasks } = useDailyTaskContext();
  const [dailyEntity, setDailyEntity] = useState<TaskAnalyticsIdEntity>({});
  const [categoryEntity, setCategoryEntity] =
    useState<CategoryAnalyticsNameEntity>({});
  const [dailyAnaltyics, setDailyAnaltyics] = useState<DailyAnalyticsData>();

  useEffect(() => {
    const { dailyEntity, categoryEntity, dailyAnaltyics } =
      getDailyTaskAnalyticsData(dailyTasks);
    setDailyEntity(dailyEntity);
    setCategoryEntity(categoryEntity);
    setDailyAnaltyics(dailyAnaltyics);
  }, [dailyTasks]);
  return (
    <>
      {dailyAnaltyics && <DailyAnalyticsTable data={dailyAnaltyics} />}
      <ChartTimeStackWrapper data={dailyEntity} />
      <ChartPieCateogoryWrap data={categoryEntity} />
    </>
  );
};

export default DailyAnalytics;

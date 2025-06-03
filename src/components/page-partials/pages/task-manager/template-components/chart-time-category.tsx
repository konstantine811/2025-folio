import { getCategoryTimeCountByPeriod } from "@/services/analytics/task-menager/template-handle-data";
import {
  CategoryCountTime,
  TypeAnalyticsPeriod,
} from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";
import { useEffect, useState } from "react";
import SelectPeriodTime from "./select/select-period-time";
import ChartPieCategory from "./chart-pie-category";
import ChartTitle from "../chart/chart-title";

const ChartTimeCategory = ({ templateTasks }: { templateTasks: Items }) => {
  const [analyticsData, setAnalyticsData] = useState<CategoryCountTime>();
  const [period, setPeriod] = useState<TypeAnalyticsPeriod>(); // Додано для зберігання вибраного періоду
  useEffect(() => {
    const analyticsData = getCategoryTimeCountByPeriod(templateTasks); // 🔄 Виклик функції для обробки шаблонних завдань
    setAnalyticsData(analyticsData);
  }, [templateTasks]);

  useEffect(() => {
    if (period) {
      const analyticsData = getCategoryTimeCountByPeriod(templateTasks, period);
      setAnalyticsData(analyticsData);
    }
  }, [templateTasks, period]);

  useEffect(() => {
    console.log(analyticsData);
  }, [analyticsData]);

  return (
    <>
      {analyticsData && (
        <>
          <div className="flex justify-center items-center gap-2">
            <ChartTitle title="chart.period_count_chart_title" />
            <SelectPeriodTime onChange={setPeriod} />
          </div>
          <div className="max-w-md mx-auto">
            <ChartPieCategory data={analyticsData} />
          </div>
        </>
      )}
    </>
  );
};

export default ChartTimeCategory;

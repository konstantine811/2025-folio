import { getCategoryTimeCountByPeriod } from "@/services/analytics/task-menager/template-handle-data";
import {
  CategoryCountTime,
  TypeAnalyticsPeriod,
} from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";
import { useEffect, useState } from "react";
import SelectPeriodTime from "./select/select-period-time";
import ChartPieCategory from "./chart-pie-category";

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
    <div>
      <SelectPeriodTime onChange={setPeriod} />
      {analyticsData && (
        <div className="max-w-xs">
          <ChartPieCategory data={analyticsData} />
        </div>
      )}
    </div>
  );
};

export default ChartTimeCategory;

import { getTaskAnalyticsData } from "@/services/analytics/task-menager/template-handle-data";
import { TaskAnalytics } from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";
import { useEffect, useState } from "react";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import ChartTimeCount from "./chart-time-count";
import ChartTimeCategory from "./chart-time-category";

const TemplateRightPanel = ({ templateTasks }: { templateTasks: Items }) => {
  const [analyticsData, setAnalyticsData] = useState<TaskAnalytics>();
  const hS = useHeaderSizeStore((s) => s.size);
  useEffect(() => {
    const analyticsData = getTaskAnalyticsData(templateTasks); // 🔄 Виклик функції для обробки шаблонних завдань
    setAnalyticsData(analyticsData);
  }, [templateTasks]);

  return (
    <>
      <div
        className="min-w-xs sm:min-w-md sticky pt-8 h-full"
        style={{ top: `${hS}px` }}
      >
        {analyticsData ? <ChartTimeCount taskAnalytics={analyticsData} /> : ""}
        <ChartTimeCategory templateTasks={templateTasks} />
      </div>
    </>
  );
};

export default TemplateRightPanel;

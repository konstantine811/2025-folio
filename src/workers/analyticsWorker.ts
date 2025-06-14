import { getDailyTaskAnalyticsData } from "@/services/task-menager/analytics/daily-handle-data";
import { DailyTaskRecord } from "@/types/drag-and-drop.model";

self.onmessage = (e) => {
  const rangeTasks = e.data as DailyTaskRecord[];

  const analyticsData = rangeTasks.map((item) => {
    const { date, items } = item;
    const data = getDailyTaskAnalyticsData(items);
    return { date, data };
  });

  postMessage(analyticsData);
};

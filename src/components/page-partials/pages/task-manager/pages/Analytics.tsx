import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useEffect, useState } from "react";
import { loadDailyTasksByRange } from "@/services/firebase/taskManagerData";
import { CalendarDatePicker } from "../analytics-comonents/calendar-date-picker";

import AnalyticsWorker from "@/workers/analyticsWorker?worker";
import { DailyTaskRecord } from "@/types/drag-and-drop.model";
import { DailyTaskAnalyticRecord } from "@/types/analytics/task-analytics.model";

const Analytics = () => {
  const hS = useHeaderSizeStore((s) => s.size);
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [rangeTasks, setRangeTasks] = useState<DailyTaskRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DailyTaskAnalyticRecord[]>(
    []
  );
  useEffect(() => {
    loadDailyTasksByRange(range.from, range.to).then((rangeTasks) => {
      setRangeTasks(rangeTasks);
    });
  }, [range]);

  useEffect(() => {
    const worker = new AnalyticsWorker();
    worker.postMessage(rangeTasks);
    worker.onmessage = (e) => {
      const analyticsData = e.data as DailyTaskAnalyticRecord[];
      console.log("Analytics data received:", analyticsData);
      setAnalyticsData(analyticsData);
    };
    return () => {
      worker.terminate();
    };
  }, [rangeTasks]);
  return (
    <div className="w-full" style={{ minHeight: `calc(100vh - ${hS}px)` }}>
      <header className=" border-b border-muted-foreground/30 py-2">
        <div className="container mx-auto flex items-center justify-end">
          <CalendarDatePicker
            date={range}
            onDateSelect={(newRange) => {
              setRange(newRange);
            }}
            variant="outline"
          />
        </div>
      </header>
      <main className={`w-full flex-1 px-4`}>
        {/* <h2 className="text-center text-foreground/50 text-sm mb-4 mt-2">
            {`${t("task_manager.daily_task_title")} : ${dateVal || ""}`}
          </h2> */}
      </main>
    </div>
  );
};

export default Analytics;

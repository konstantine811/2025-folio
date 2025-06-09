import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import AnalyticsCalendar from "../analytics-comonents/calendar";
import { useEffect } from "react";
import { fetchAllDailyTasks } from "@/services/firebase/taskManagerData";

const Analytics = () => {
  const hS = useHeaderSizeStore((s) => s.size);
  useEffect(() => {
    fetchAllDailyTasks().then((data) => {
      console.log("Fetched all daily tasks:", data);
    });
  }, []);
  return (
    <div
      className="flex w-full justify-center"
      style={{ minHeight: `calc(100vh - ${hS}px)` }}
    >
      {/* Ліва колонка */}

      <div className="flex-1" />

      {/* Центральна колонка */}
      <main
        className={`w-full flex-1 px-4 flex flex-col justify-center`}
        style={{ minHeight: `calc(100vh - ${hS}px)` }}
      >
        {/* <h2 className="text-center text-foreground/50 text-sm mb-4 mt-2">
            {`${t("task_manager.daily_task_title")} : ${dateVal || ""}`}
          </h2> */}

        <AnalyticsCalendar />
      </main>

      {/* Права колонка */}
      <div className="flex-1" />
    </div>
  );
};

export default Analytics;

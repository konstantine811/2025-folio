import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useEffect } from "react";
import { fetchAllDailyTasks } from "@/services/firebase/taskManagerData";
import SelectPeriod from "../analytics-comonents/select-period";
import CardDatePicker from "../analytics-comonents/card-date-picker";

const Analytics = () => {
  const hS = useHeaderSizeStore((s) => s.size);
  useEffect(() => {
    fetchAllDailyTasks().then((data) => {
      console.log("Fetched all daily tasks:", data);
    });
  }, []);
  return (
    <div className="w-full" style={{ minHeight: `calc(100vh - ${hS}px)` }}>
      {/* Центральна колонка */}
      <header className="flex flex-col items-center">
        <SelectPeriod />
        <CardDatePicker />
      </header>
      <main
        className={`w-full flex-1 px-4`}
        style={{ minHeight: `calc(100vh - ${hS}px)` }}
      >
        {/* <h2 className="text-center text-foreground/50 text-sm mb-4 mt-2">
            {`${t("task_manager.daily_task_title")} : ${dateVal || ""}`}
          </h2> */}
      </main>
    </div>
  );
};

export default Analytics;

import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useEffect, useState } from "react";
import { fetchAllDailyTasks } from "@/services/firebase/taskManagerData";
import { CalendarDatePicker } from "../analytics-comonents/calendar-date-picker";

const Analytics = () => {
  const hS = useHeaderSizeStore((s) => s.size);
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  useEffect(() => {
    fetchAllDailyTasks().then((data) => {
      console.log("Fetched all daily tasks:", data);
    });
  }, []);
  return (
    <div className="w-full" style={{ minHeight: `calc(100vh - ${hS}px)` }}>
      <header className=" border-b border-muted-foreground py-2">
        <div className="container mx-auto flex items-center justify-end">
          <CalendarDatePicker
            date={range}
            onDateSelect={(newRange) => setRange(newRange)}
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

import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useEffect, useState } from "react";
import { loadDailyTasksByRange } from "@/services/firebase/taskManagerData";
import { CalendarDatePicker } from "../analytics-comonents/calendar-date-picker";

import AnalyticsWorker from "@/workers/analyticsWorker?worker";
import { DailyTaskRecord } from "@/types/drag-and-drop.model";
import {
  AnalyticsData,
  ItemTimeMap,
  ItemTimeMapKeys,
} from "@/types/analytics/task-analytics.model";
import LineChartTask from "../analytics-comonents/line-chart-task";
import { useTranslation } from "react-i18next";
import ChartPieCategoryWrap from "../daily-components/analytics-chart/chart-pie-category/chart-pie-category-wrap";
import ChartTitle from "../chart/chart-title";
import ChartPieItem from "../template-components/chart-pie-item";

const Analytics = () => {
  const hS = useHeaderSizeStore((s) => s.size);
  const [t] = useTranslation();
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [rangeTasks, setRangeTasks] = useState<DailyTaskRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>();
  const [categoryDoneEntity, setCategoryDoneEntity] = useState<ItemTimeMap>({});
  useEffect(() => {
    loadDailyTasksByRange(range.from, range.to).then((rangeTasks) => {
      setRangeTasks(rangeTasks);
    });
  }, [range]);

  useEffect(() => {
    const worker = new AnalyticsWorker();
    worker.postMessage(rangeTasks);
    worker.onmessage = (e) => {
      const analyticsData = e.data as AnalyticsData;
      console.log("Analytics data received:", analyticsData);
      if (analyticsData.categoryEntity) {
        const categoryTime: ItemTimeMap = {};
        Object.entries(analyticsData.categoryEntity).forEach(([key, value]) => {
          if (value.countDoneTime > 0) {
            categoryTime[key] = value.countDoneTime;
          }
        });
        setCategoryDoneEntity(categoryTime);
      }
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
        <div className="container mx-auto flex flex-col items-center gap-4 pt-10 pb-20">
          {analyticsData ? (
            <>
              <LineChartTask data={analyticsData.rangeTasks} />
              <div className="flex flex-wrap gap-4 justify-around items-start">
                <ChartPieCategoryWrap data={analyticsData.categoryEntity} />
                <div>
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    <ChartTitle title="chart.period_count_category_title" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <ChartPieItem
                      data={categoryDoneEntity}
                      type={ItemTimeMapKeys.category}
                      height={430}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            t("not_data")
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;

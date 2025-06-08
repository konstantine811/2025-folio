import { DailyAnalyticsData } from "@/types/analytics/task-analytics.model";
import { paresSecondToTime } from "@/utils/time.util";
import { useCallback } from "react";

const DailyAnalyticsTable = ({ data }: { data: DailyAnalyticsData }) => {
  const parseTime = useCallback((time: number) => {
    const { minutes, hours } = paresSecondToTime(time);
    return `${hours}:${minutes}`;
  }, []);
  return (
    <div className="text-foreground">
      <div>Кількість задач {data.countAllTask}</div>
      <div>Всьго часу {parseTime(data.countTime)}</div>
      <div>Кількість зроблених задач {data.countDoneTask}</div>
      <div>Зроблено {parseTime(data.countDoneTime)}</div>
      <div>Залишилось задач {data.countAllTask - data.countDoneTask}</div>
      <div>Лишилось {parseTime(data.countTime - data.countDoneTime)}</div>
    </div>
  );
};

export default DailyAnalyticsTable;

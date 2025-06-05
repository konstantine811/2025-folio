import { CategoryAnalyticsNameEntity } from "@/types/analytics/task-analytics.model";
import ChartPieCategory from "./chart-pie-category";
import ChartTitle from "../../../chart/chart-title";

const ChartPieCateogoryWrap = ({
  data,
}: {
  data: CategoryAnalyticsNameEntity;
}) => {
  return (
    <div className="max-w-md mx-auto py-8 flex flex-col items-center gap-4">
      <ChartTitle title="chart.pie_category_daily_time" />
      <ChartPieCategory data={data} />
    </div>
  );
};

export default ChartPieCateogoryWrap;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailyAnalyticsData } from "@/types/analytics/task-analytics.model";
import { paresSecondToTime } from "@/utils/time.util";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const DailyAnalyticsTable = ({ data }: { data: DailyAnalyticsData }) => {
  const [t] = useTranslation();
  const parseTime = useCallback(
    (time: number) => {
      const { minutes, hours } = paresSecondToTime(time);
      let timeStr = "";
      const numHours = Number(hours);
      const numMinutes = Number(minutes);
      if (numHours !== 0) {
        timeStr = `${numHours}${t("chart.hour")}:`;
      }
      timeStr += `${numMinutes}${t("chart.minute")}`;
      return timeStr;
    },
    [t]
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-muted-foreground/20">
        <Table className="text-foreground text-sm">
          <TableHeader className="bg-muted-foreground/10">
            <TableRow className="border-muted-foreground/20">
              <TableHead className="font-semibold text-foreground/70">
                {t("task_manager.analytics.daily_table.indicator")}
              </TableHead>
              <TableHead className="font-semibold text-foreground/70">
                {t("task_manager.analytics.daily_table.count")}
              </TableHead>
              <TableHead className="font-semibold text-foreground/70">
                {t("task_manager.analytics.daily_table.time")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            <TableRow className="border-muted-foreground/20">
              <TableCell>Загально</TableCell>
              <TableCell className="font-mono">{data.countAllTask}</TableCell>
              <TableCell className="font-mono">
                {parseTime(data.countTime)}
              </TableCell>
            </TableRow>
            <TableRow className="border-muted-foreground/20">
              <TableCell>Затрекані</TableCell>
              <TableCell className="font-mono">{data.countDoneTask}</TableCell>
              <TableCell className="font-mono">
                {parseTime(data.countDoneTime)}
              </TableCell>
            </TableRow>
            <TableRow className="border-muted-foreground/20">
              <TableCell>Залишкові</TableCell>
              <TableCell className="font-mono">
                {data.countAllTask - data.countDoneTask}
              </TableCell>
              <TableCell className="font-mono">
                {parseTime(data.countTime - data.countDoneTime)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DailyAnalyticsTable;

import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import DailyCalendar from "../daily-components/daily-calendar";
import DailyRightDrawer from "../daily-components/daily-right-drawer";

import DailyTaskWrapper from "../daily-components/daily-task-wrapper";
import { useOutletContext } from "react-router";
import { TaskManagerOutletContext } from "../TaskManager";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const DailyTask = () => {
  const mdSize = useIsAdoptive();
  const hS = useHeaderSizeStore((s) => s.size);
  const outletContext = useOutletContext<TaskManagerOutletContext>();
  return (
    <div className="flex w-full" style={{ minHeight: `calc(100vh - ${hS}px)` }}>
      {/* Ліва колонка */}
      <div className="flex-1" />

      {/* Центральна колонка */}
      <main
        className={`w-full max-w-2xl px-4 flex flex-col justify-center ${outletContext.className}`}
        style={{ minHeight: `calc(100vh - ${hS}px)` }}
      >
        <DailyTaskWrapper />
      </main>

      {/* Права колонка */}
      <div className="flex-1 pt-8">
        {mdSize ? <DailyRightDrawer /> : <DailyCalendar />}
      </div>
    </div>
  );
};

export default DailyTask;

import { Calendar } from "@/components/ui/calendar";
import { format, Locale } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { uk, enUS } from "date-fns/locale";
import { useNavigate, useParams } from "react-router";
import { RoutPath } from "@/config/router-config";
import { DateTemplate } from "@/config/data-config";
import { parseDate } from "@/utils/date.util";
import { Items, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { FirebaseCollection } from "@/config/firebase.config";
import { subscribeToNonEmptyTaskDates } from "@/services/firebase/taskManagerData";
import { Unsubscribe } from "firebase/auth";

const locales: Record<string, Locale> = {
  en: enUS,
  ua: uk,
};

const DailyCalendar = () => {
  const { id: dateId } = useParams();
  const parsedDate = parseDate(
    dateId ?? format(new Date(), DateTemplate.dayMonthYear)
  );

  const [date, setDate] = useState<Date | undefined>(parsedDate);
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<Date[]>([]);

  const navigate = useNavigate();
  const today = new Date();

  const handleUpdatePlannedTasks = useCallback((dates: Date[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // обнуляємо час

    const futureOrTodayDates = dates.filter((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    });

    setPlannedTasks(futureOrTodayDates);
  }, []);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    subscribeToNonEmptyTaskDates<Items>(
      FirebaseCollection.dailyTasks,
      (dates) => {
        setActiveDates(dates);
      }
    ).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    subscribeToNonEmptyTaskDates<ItemTaskCategory[]>(
      FirebaseCollection.plannedTasks,
      handleUpdatePlannedTasks
    ).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [handleUpdatePlannedTasks]);

  const handleDate = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const formatted = format(date, DateTemplate.dayMonthYear);
        navigate(
          `${RoutPath.TASK_MANAGER}/${RoutPath.TASK_MANAGER_DAILY.replace(
            ":id",
            formatted
          )}`
        );
        setTimeout(() => {
          setDate(date);
        });
      }
    },
    [navigate]
  );

  const { i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex justify-center w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => handleDate(date)}
        className="h-full w-full flex"
        classNames={{
          months:
            "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
          month: "space-y-4 w-full flex flex-col",
          table: "w-full h-full border-collapse space-y-1",
          head_row: "",
          row: "w-full mt-2",
          day: "w-full flex justify-center items-center py-2 rounded-sm h-full",
        }}
        locale={locales[lang] ?? enUS}
        modifiers={{
          active: activeDates,
          today: today,
          hasTasks: plannedTasks,
        }}
        modifiersClassNames={{
          selected: "!bg-accent !text-foreground border border-background",
          today: "bg-background shadow-md shadow-accent border border-accent",
          active: "bg-foreground/20 text-foreground",
          hasTasks:
            "after:block after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-foreground after:rounded-full", // 👈 стилізуємо це окремо
        }}
      />
    </div>
  );
};

export default DailyCalendar;

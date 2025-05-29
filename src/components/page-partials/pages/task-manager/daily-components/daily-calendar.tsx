import { Calendar } from "@/components/ui/calendar";
import { Locale } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { uk, enUS } from "date-fns/locale";
import { loadAllNonEmptyDailyTaskDates } from "@/services/firebase/taskManagerData";

const locales: Record<string, Locale> = {
  en: enUS,
  ua: uk,
};

const DailyCalendar = ({
  onChangeDate,
}: {
  onChangeDate: (date: Date) => void;
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const today = new Date();
  useEffect(() => {
    loadAllNonEmptyDailyTaskDates().then((dates) => {
      setActiveDates(dates);
    });
  });
  useEffect(() => {
    if (date) {
      onChangeDate(date);
    }
  }, [date, onChangeDate]);
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow capitalize"
        locale={locales[lang] ?? enUS}
        modifiers={{
          active: activeDates,
          today: today,
        }}
        modifiersClassNames={{
          selected:
            "!bg-accent shadow-md shadow-foreground/60 border border-background",
          today: "bg-background shadow-md shadow-accent border border-accent",
          active: "bg-foreground/20 text-foreground",
        }}
      />
    </div>
  );
};

export default DailyCalendar;

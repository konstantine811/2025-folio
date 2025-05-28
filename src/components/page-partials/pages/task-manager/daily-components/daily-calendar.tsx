import { Calendar } from "@/components/ui/calendar";
import { Locale } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { uk, enUS } from "date-fns/locale";

const locales: Record<string, Locale> = {
  en: enUS,
  ua: uk,
};

const DailyCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
        modifiersClassNames={{
          today: "bg-foreground text-background border-4 border-accent/30", // змінює фон і текст
        }}
      />
    </div>
  );
};

export default DailyCalendar;

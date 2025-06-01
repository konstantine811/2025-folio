import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DayNumber } from "@/types/drag-and-drop.model";
import { ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface LabelSelectWeekProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  weekData: DayNumber[];
  toggleDay: (day: DayNumber) => void;
  selectedDays: DayNumber[];
  label: string;
  prefixWeedDay: string;
}

const LabelSelectWeek = ({
  weekData,
  toggleDay,
  selectedDays,
  label,
  prefixWeedDay,
}: LabelSelectWeekProps) => {
  const [t] = useTranslation();
  return (
    <>
      <Label>{t(label)}</Label>
      <div className="col-span-3 flex items-center justify-center gap-1">
        {weekData.map((day) => (
          <Button
            key={day}
            variant={"ghost"}
            onClick={() => toggleDay(day)}
            className={`w-7 h-8 rounded-full border hover:bg-foreground/40 border-foreground/10 transition-all duration-200 ${
              selectedDays.includes(day)
                ? "bg-foreground text-background border-accent"
                : "bg-transparent text-foreground/30 border-foreground/30 "
            }`}
          >
            {t(`${prefixWeedDay}.${day}`)}
          </Button>
        ))}
      </div>
    </>
  );
};

export default LabelSelectWeek;

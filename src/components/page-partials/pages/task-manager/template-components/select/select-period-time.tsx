import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ANALYTICS_PERIODS } from "@/config/task-analytics.config";
import { TypeAnalyticsPeriod } from "@/types/analytics/task-analytics.model";
import { DayNumber } from "@/types/drag-and-drop.model";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SelectPeriodTime = ({
  onChange,
}: {
  onChange: (period: TypeAnalyticsPeriod) => void;
}) => {
  const initialPeriod = ANALYTICS_PERIODS[0]; // Встановлюємо початковий період
  const [period, setPeriod] = useState<string | undefined>(initialPeriod);
  function parsePeriod(period: string | undefined): TypeAnalyticsPeriod {
    return isNaN(Number(period))
      ? (period as "all" | "by_all_week")
      : (Number(period) as DayNumber);
  }
  useEffect(() => {
    onChange(initialPeriod);
  }, [onChange, initialPeriod]);
  const [t] = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="inline-block">
          <SoundHoverElement animValue={1}>
            <Button
              className="w-56 hover:bg-card border-foreground/40"
              variant="outline"
            >
              {t(`task_manager.day_names.${period}`)}
            </Button>
          </SoundHoverElement>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-foreground/30">
        <DropdownMenuLabel>{t("chart.period")}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-foreground/40" />
        <DropdownMenuRadioGroup
          value={period}
          onValueChange={(val) => {
            setPeriod(val);
            onChange(parsePeriod(val)); // Викликаємо onChange з новим періодом
          }}
        >
          {ANALYTICS_PERIODS.map((period) => {
            return (
              <DropdownMenuRadioItem key={period} value={period.toString()}>
                {t(`task_manager.day_names.${period}`)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SelectPeriodTime;

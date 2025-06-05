import { useCallback, useRef } from "react";
import * as d3 from "d3";
import { paresSecondToTime } from "@/utils/time.util";
import { useTranslation } from "react-i18next";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";

type ShowTooltipParams = {
  event: PointerEvent;
  title: string;
  time: number;
};

const useChartTooltip = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isAdoptiveSize } = useIsAdoptive();
  const [t] = useTranslation();
  const showTooltip = useCallback(
    ({ event, title, time }: ShowTooltipParams) => {
      if (!ref.current) return;
      const tooltip = ref.current;
      const { hours, minutes } = paresSecondToTime(time);
      const svgRect = (
        ref.current.parentElement?.querySelector("svg") as SVGSVGElement
      )?.getBoundingClientRect();
      if (!svgRect) return;

      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;

      const currentRef = d3
        .select(ref.current)

        .style("display", "flex")
        .style("opacity", 1).html(`
        <h3 class="text-foreground/80 text-center text-sm"><strong>${t(
          title
        )}</strong></h3>
        <div class="bg-accent/50 rounded-md text-center text-sm border border-foreground/50 inline-block px-2">
          ${hours !== "00" ? hours + t("chart.hour") : ""} ${
        minutes !== "00" ? minutes + t("chart.minute") : ""
      }
        </div>
      `);

      if (isAdoptiveSize) {
        // currentRef.style("left", `calc(${x}px - 50% - 20px)`);
      } else {
        currentRef.style(
          "transform",
          `translate(calc(${x}px - 100% - 20px), ${y + 28}px)`
        );
      }

      const { left } = tooltip.getBoundingClientRect();
      if (left < 0) {
        currentRef.style(
          "transform",
          `translate(calc(${x}px - 20px), ${y + 28}px)`
        );
      }
    },
    [t]
  );

  const hideTooltip = useCallback(() => {
    if (!ref.current) return;
    d3.select(ref.current).style("display", "none").style("opacity", 0);
  }, []);

  const TooltipElement = (
    <div
      ref={ref}
      className="absolute z-50 max-w-sm p-2 top-0 text-sm bg-background border border-foreground/20 foreground rounded shadow-lg shadow-background will-change-transform pointer-events-none opacity-0 items-center flex-col gap-2"
    />
  );

  return { TooltipElement, showTooltip, hideTooltip };
};

export default useChartTooltip;

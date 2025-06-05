import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";
import { paresSecondToTime } from "@/utils/time.util";
import useChartTooltip from "../../../chart/hooks/use-chart-tooltip";
import {
  TaskAnalyticsBarOrientation,
  TaskAnalyticsData,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette, ThemeStaticPalette } from "@/config/theme-colors.config";
import { isTouchDevice } from "@/utils/touch-inspect";

const ChartTimeStackTasks = ({
  data,
  direction = "horizontal",
}: {
  data: TaskAnalyticsIdEntity;
  direction?: TaskAnalyticsBarOrientation;
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const { TooltipElement, showTooltip, hideTooltip } = useChartTooltip();
  const themeName = useThemeStore((s) => s.selectedTheme);
  const [svgHeight, setSvgHeight] = useState<number>(0);
  const activeNodeRef = useRef<SVGGElement | null>(null);
  const barSize = 30;
  const timeLength = 600;

  const onHideTooltip = useCallback((self: SVGGElement) => {
    d3.select(self)
      .select("rect")
      .transition()
      .duration(300)
      .attr("transform", "scale(1)")
      .attr("fill", "transparent");
  }, []);

  const handleInteraction = useCallback(
    (self: SVGGElement, event: PointerEvent, d: TaskAnalyticsData) => {
      const activeNode = activeNodeRef.current;

      // Якщо такий же — приховуємо
      if (activeNode === self) {
        onHideTooltip(self);
        hideTooltip();
        activeNodeRef.current = null;
        return;
      }

      // Якщо інший активний — ховаємо
      if (activeNode && activeNode !== self) {
        onHideTooltip(activeNode);
        hideTooltip();
      }

      activeNodeRef.current = self;

      d3.select(self)
        .select("rect")
        .transition()
        .duration(200)
        .attr("fill", ThemePalette[themeName]["foreground"]);

      showTooltip({ event, title: d.title, time: d.time });
    },
    [showTooltip, hideTooltip, onHideTooltip, themeName]
  );

  useEffect(() => {
    if (!ref.current) return;

    const margin =
      direction === "horizontal"
        ? { top: 0, right: 3, bottom: 10, left: 4 }
        : { top: 3, right: 0, bottom: 7, left: 17 };

    const width =
      direction === "horizontal"
        ? timeLength + margin.left + margin.right
        : barSize + margin.left + margin.right;

    const height =
      direction === "horizontal"
        ? barSize + margin.top + margin.bottom + 15
        : timeLength + margin.top + margin.bottom;
    setSvgHeight(height);
    const tasks = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => {
        if (a.isDone && !b.isDone) return -1;
        if (!a.isDone && b.isDone) return 1;
        return b.time - a.time;
      });

    const totalTime = d3.sum(tasks, (d) => d.time);
    const doneTime = d3.sum(tasks, (d) => (d.isDone ? d.time : 0));
    const pendingTime = totalTime - doneTime;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const group = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const scale = d3
      .scaleLinear()
      .domain([0, totalTime])
      .range(direction === "horizontal" ? [0, innerW] : [innerH, 0]);

    group
      .append("rect")
      .attr(
        direction === "horizontal" ? "x" : "y",
        direction === "horizontal" ? 0 : scale(doneTime)
      )
      .attr(direction === "horizontal" ? "y" : "x", 0)
      .attr(
        direction === "horizontal" ? "width" : "height",
        direction === "horizontal"
          ? scale(doneTime)
          : scale(0) - scale(doneTime)
      )
      .attr(direction === "horizontal" ? "height" : "width", barSize)
      .attr("fill", ThemePalette[themeName]["primary"])
      .attr("rx", 2);

    // create gradient for stack
    // 👉 Вирахуємо відсотки
    const redOffset =
      totalTime > 0 ? `${(16 * 3600 * 100) / totalTime}%` : "0%";
    const yellowOffset =
      totalTime > 0 ? `${(10 * 3600 * 100) / totalTime}%` : "0%";

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "stackGradient")
      .attr("x1", direction === "horizontal" ? "0%" : "0%")
      .attr("y1", direction === "horizontal" ? "0%" : "100%")
      .attr("x2", direction === "horizontal" ? "100%" : "0%")
      .attr("y2", direction === "horizontal" ? "0%" : "0%");

    // 🟢 до 13 годин — primary
    gradient
      .append("stop")
      .attr("offset", yellowOffset)
      .attr("stop-color", ThemeStaticPalette.green);

    gradient
      .append("stop")
      .attr("offset", redOffset)
      .attr("stop-color", ThemeStaticPalette.yellow);

    // 🔴 після 16 годин — destructive (червоний)
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", ThemePalette[themeName]["destructive"]);

    // Створюємо прямокутник для стека
    group
      .append("rect")
      .attr(
        direction === "horizontal" ? "x" : "y",
        direction === "horizontal" ? scale(doneTime) : 0
      )
      .attr(direction === "horizontal" ? "y" : "x", 0)
      .attr(
        direction === "horizontal" ? "width" : "height",
        direction === "horizontal" ? scale(pendingTime) : scale(doneTime)
      )
      .attr(direction === "horizontal" ? "height" : "width", barSize)
      .attr("fill", "url(#stackGradient)")
      .attr("fill-opacity", 1);

    let offset = 0;

    const taskGroups = group
      .selectAll("g.task")
      .data(tasks)
      .join("g")
      .attr("class", "task");

    if (isTouchDevice) {
      taskGroups.on("pointerdown", function (event, d) {
        handleInteraction(this as SVGGElement, event, d);
      });
    } else {
      taskGroups
        .on("pointerenter", function (event, d) {
          handleInteraction(this as SVGGElement, event, d);
        })
        .on("mouseleave", function () {
          if (activeNodeRef.current === this) {
            onHideTooltip(this as SVGGElement);
            hideTooltip();
            activeNodeRef.current = null;
          }
        });
    }

    taskGroups
      .append("rect")
      .attr("x", (d) =>
        direction === "horizontal"
          ? (() => {
              const current = offset;
              offset += d.time;
              return scale(current);
            })()
          : 0
      )
      .attr("y", (d) =>
        direction === "vertical"
          ? (() => {
              const current = offset;
              offset += d.time;
              return scale(current + d.time);
            })()
          : 0
      )
      .attr("width", (d) =>
        direction === "horizontal" ? scale(d.time) - scale(0) : barSize
      )
      .attr("height", (d) =>
        direction === "vertical"
          ? scale(offset - d.time) - scale(offset)
          : barSize
      )
      .attr("fill", "transparent")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("vector-effect", "non-scaling-stroke");

    const roundedMax = Math.ceil(totalTime / 3600) * 3600;
    const tickStep = 3600;
    const tickValues = d3.range(0, roundedMax, tickStep);

    const tickFormatter = (d: d3.NumberValue): string => {
      const { hours } = paresSecondToTime(d as number);
      return String(Number(hours));
    };

    if (direction === "horizontal") {
      group
        .append("g")
        .attr("transform", `translate(0, ${barSize + 1})`)
        .call(
          d3.axisBottom(scale).tickValues(tickValues).tickFormat(tickFormatter)
        )
        .attr("class", "text-lg lg:text-xs text-muted-foreground");
    } else {
      group
        .append("g")
        .call(
          d3.axisLeft(scale).tickValues(tickValues).tickFormat(tickFormatter)
        )
        .attr("class", "text-xs text-muted-foreground");
    }
  }, [
    data,
    showTooltip,
    hideTooltip,
    direction,
    barSize,
    timeLength,
    themeName,
    onHideTooltip,
    handleInteraction,
  ]);

  return (
    <div className="relative w-full">
      {TooltipElement}
      <svg
        ref={ref}
        className="w-full h-auto"
        style={{
          height: svgHeight,
        }}
      />
    </div>
  );
};

export default ChartTimeStackTasks;

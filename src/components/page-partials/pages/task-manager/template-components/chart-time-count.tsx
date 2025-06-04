import { ThemePalette, ThemeStaticPalette } from "@/config/theme-colors.config";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useThemeStore } from "@/storage/themeStore";
import {
  StackedDay,
  TaskAnalytics,
} from "@/types/analytics/task-analytics.model";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as d3 from "d3";
import { paresSecondToTime } from "@/utils/time.util";
import ChartTitle from "../chart/chart-title";
import useChartTooltip from "../chart/hooks/use-chart-tooltip";
import { Items } from "@/types/drag-and-drop.model";
import { getTaskAnalyticsData } from "@/services/task-menager/analytics/template-handle-data";

const ChartTimeCount = ({ templateTasks }: { templateTasks: Items }) => {
  const [analyticsData, setAnalyticsData] = useState<TaskAnalytics>();
  const hS = useHeaderSizeStore((s) => s.size);
  const [t] = useTranslation();
  const themeName = useThemeStore((s) => s.selectedTheme);
  const { TooltipElement, showTooltip, hideTooltip } = useChartTooltip();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const analyticsData = getTaskAnalyticsData(templateTasks); // 🔄 Виклик функції для обробки шаблонних завдань
    setAnalyticsData(analyticsData);
  }, [templateTasks]);

  useEffect(() => {
    if (!ref.current) return;
    if (!analyticsData) return;
    const tasks = analyticsData.flattenTasks;
    const margin = { top: 20, right: 20, bottom: 30, left: 70 };
    const width = 800;
    const height = 600;
    const heightViewOffset = 40;
    const widthOffset = width - margin.left - margin.right;
    const heightOffset = height - margin.top - margin.bottom;
    const colors = ThemePalette[themeName];
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clean before render

    const group = svg
      .attr("viewBox", `0 0 ${width} ${height + heightViewOffset}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // console.log("Flattened tasks:", tasks);

    // Group and pivot
    const grouped = d3.group(tasks, (d) => d.day);

    const stackData: StackedDay[] = Array.from(grouped, ([day, group]) => {
      const entry: StackedDay = { day };
      group.forEach((task) => {
        entry[task.title] =
          typeof task.duration === "number" ? task.duration : 0;
      });
      return entry;
    });

    const keys = Array.from(new Set(tasks.map((d) => d.title)));

    // Сортуємо ключі за середньою тривалістю задач
    const keyDurations = new Map<string, number>();

    keys.forEach((key) => {
      const total = d3.sum(
        tasks.filter((t) => t.title === key).map((t) => t.duration || 0)
      );
      keyDurations.set(key, total);
    });

    const sortedKeys = [...keys].sort(
      (a, b) => (keyDurations.get(a) ?? 0) - (keyDurations.get(b) ?? 0)
    );
    // потім вже стек
    const stack = d3.stack<StackedDay>().keys(sortedKeys)(stackData);

    // Максимальна тривалість (у секундах)
    const maxSeconds =
      d3.max(stackData, (d) => d3.sum(keys, (k) => (d[k] as number) || 0)) || 0;

    const maxHours = Math.ceil(maxSeconds / 3600);
    const tickValues = Array.from({ length: maxHours + 1 }, (_, i) => i * 3600);

    const x = d3
      .scaleBand()
      .domain(stackData.map((d) => d.day.toString()))
      .range([0, widthOffset])
      .padding(0.6);

    const y = d3
      .scaleLinear()
      .domain([0, maxHours * 3600])
      .nice()
      .range([heightOffset, 0]);

    // X Axis
    group
      .append("g")
      .attr("transform", `translate(0, ${heightOffset})`)
      .attr("class", "text-foreground/80 text-[14px]")
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          return t(`task_manager.day_names.${d}`);
        })
      )
      .call((g) => {
        g.select(".domain").remove(); // <– ця лінія внизу
        g.selectAll(".tick line").remove(); // <– видаляє вертикальні лінії (опційно)
      });

    // Add Y Axis label
    group
      .append("g")
      .attr("transform", `translate(${margin.right - 20},0)`)
      .attr("class", "text-foreground/90 text-md")
      .call(
        d3
          .axisLeft(y)
          .tickValues(tickValues)
          .tickFormat((time) => {
            const { hours } = paresSecondToTime(time as number);
            return String(Number(hours));
          })
      )
      .call((g) => {
        g.selectAll(".domain").remove();
        g.selectAll(".tick line").remove();
      });

    // add grid lines
    group
      .append("g")
      .selectAll("line.grid-x")
      .data(x.domain())
      .join("line")
      .attr("class", "grid-x stroke stroke-foreground/30")
      .attr("x1", (d) => x(d)! + x.bandwidth() / 2)
      .attr("x2", (d) => x(d)! + x.bandwidth() / 2)
      .attr("y1", 0)
      .attr("y2", heightOffset);

    group
      .append("g")
      .selectAll("line.grid-y")
      .data(tickValues)
      .join("line")
      .attr("class", "grid-y")
      .attr("x1", 0)
      .attr("x2", widthOffset)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "currentColor") // або ThemePalette[themeName].foreground
      .attr("stroke-opacity", 0.2)
      .attr("stroke-width", 1);
    // add vertical label
    group
      .append("g")
      .append("text")
      .attr("x", -heightOffset / 2)
      .attr("y", -margin.right - 10)
      .attr("text-anchor", "middle")
      .attr("class", "fill-foreground text-lg -rotate-90")
      .text(t("chart.hours"));

    group
      .append("text") // X-вісь
      .attr("x", widthOffset / 2)
      .attr("y", heightOffset + margin.bottom + 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("class", "fill-foreground text-lg")
      .text(t("chart.days"));
    // Bars
    const totalPerDay = stackData.map((d) => ({
      day: d.day,
      total: d3.sum(keys, (k) => (d[k] as number) || 0),
    }));

    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "barGradient")
      .attr("gradientUnits", "userSpaceOnUse") // 👈 важливо!
      .attr("x1", "0")
      .attr("y1", y(0))
      .attr("x2", "0")
      .attr("y2", y(18 * 3600)); // верхня межа (16 годин)

    gradient
      .append("stop")
      .attr("offset", "40%")
      .attr("stop-color", colors.accent); // 0h (синій)

    gradient
      .append("stop")
      .attr("offset", `${(1 - y(20 * 3600) / y(0)) * 100}%`)
      .attr("stop-color", ThemeStaticPalette.yellow); // 13h (жовтий)

    gradient
      .append("stop")
      .attr("offset", `${(1 - y(40 * 3600) / y(0)) * 100}%`)
      .attr("stop-color", colors.destructive); // 16h (червоний)

    group
      .append("g")
      .selectAll("rect")
      .data(totalPerDay)
      .join("rect")
      .attr("x", (d) => x(d.day.toString())!)
      .attr("y", (d) => y(d.total))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.total))
      .attr("rx", 8)
      .attr("fill", "url(#barGradient)");

    let activeNode: d3.BaseType | SVGGElement;
    group
      .selectAll("g.layer-outline")
      .data(stack)
      .join("g")
      .attr("class", "stroke stroke-background fill-transparent")
      .selectAll("rect")
      .data((d) => d)

      .join("rect")
      .attr("x", (d) => x(d.data.day.toString())!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => {
        const h = y(d[0]) - y(d[1]);
        return isNaN(h) ? 0 : h;
      })
      .attr("width", x.bandwidth())
      .attr("rx", 4)
      .on("pointerenter", function (event, d) {
        if (activeNode && activeNode !== this) {
          hideTooltip();
        }

        activeNode = this as SVGGElement;
        const parentGroup = d3.select(event.currentTarget.parentNode);
        const taskTitle = (parentGroup.datum() as { key: string }).key;
        const timeInSeconds = d[1] - d[0];
        d3.select(this).attr("class", "fill-foreground/50");
        showTooltip({
          event,
          title: taskTitle,
          time: timeInSeconds,
        });
      })
      .on("mouseleave", function () {
        d3.select(this).attr("class", "fill-transparent");
        if (activeNode && activeNode === this) {
          hideTooltip();
          activeNode = null;
        }
      });
  }, [analyticsData, ref, hS, t, themeName, showTooltip, hideTooltip]);
  return (
    <div className="w-full relative">
      {TooltipElement}
      <ChartTitle title="chart.count_chart_title" />
      <svg ref={ref} className="w-full h-auto" />
    </div>
  );
};

export default ChartTimeCount;

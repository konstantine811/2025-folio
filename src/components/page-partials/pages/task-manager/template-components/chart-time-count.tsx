import { ThemePalette } from "@/config/theme-colors.config";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useThemeStore } from "@/storage/themeStore";
import {
  StackedDay,
  TaskAnalytics,
} from "@/types/analytics/task-analytics.model";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as d3 from "d3";
import { paresSecondToTime } from "@/utils/time.util";

const ChartTimeCount = ({
  taskAnalytics,
}: {
  taskAnalytics: TaskAnalytics;
}) => {
  const hS = useHeaderSizeStore((s) => s.size);
  const [t] = useTranslation();
  const themeName = useThemeStore((s) => s.selectedTheme);

  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!taskAnalytics) return;
    const tasks = taskAnalytics.flattenTasks;
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
      );

    // Add Y Axis label
    group
      .append("g")
      .attr("transform", `translate(${margin.right - 20},0)`)
      .attr("class", "text-foreground/80 text-md")
      .call(
        d3
          .axisLeft(y)
          .tickValues(tickValues)
          .tickFormat((time) => {
            if (!time) return "";
            const { hours } = paresSecondToTime(time as number);
            return hours;
          })
      )
      .call((g) => g.selectAll(".domain").remove());

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
      .attr("stop-color", "#FACC15"); // 13h (жовтий)

    gradient
      .append("stop")
      .attr("offset", `${(1 - y(40 * 3600) / y(0)) * 100}%`)
      .attr("stop-color", colors.destructive); // 16h (червоний)

    const tooltip = d3.select("#tooltip");
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
      .attr("rx", 5)
      .on("pointerenter pointermove", function (event, d) {
        const parentGroup = d3.select(event.currentTarget.parentNode); // ✅ без `this`
        const taskTitle = (parentGroup.datum() as { key: string }).key;
        const timeInSeconds = d[1] - d[0];
        const { hours, minutes } = paresSecondToTime(timeInSeconds);
        d3.select(this).attr("class", "fill-foreground/50");
        tooltip
          .style(
            "transform",
            `translate(calc(${event.pageX}px - 100%), ${event.pageY - 28}px)`
          )
          .style("display", "flex")
          .style("opacity", 1).html(`
           <h3 class="text-foreground/80 text-center text-sm"><strong>${taskTitle}</strong></h3>
           <div class="bg-accent/50 rounded-md text-center text-sm border border-foreground/50 inline-block px-2">${
             hours !== "00" ? hours + t(`chart.hour`) : ""
           }  ${minutes !== "00" ? minutes + t(`chart.minute`) : ""}</div>
         `);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("class", "fill-transparent");
        tooltip.style("display", "none");
      });
  }, [taskAnalytics, ref, hS, t, themeName]);
  return (
    <div className="relative z-50 w-full">
      <div
        id="tooltip"
        className="fixed z-50 max-w-sm p-2 top-0 left-0 text-sm bg-background foreground rounded shadow hidden transition-all duration-100 will-change-transform pointer-events-none opacity-0 items-center flex-col gap-2"
      />
      <h4 className="text-xl text-foreground/80 text-center">
        {t("chart.count_chart_title")}
      </h4>
      <svg ref={ref} className="w-full h-auto" />
    </div>
  );
};

export default ChartTimeCount;

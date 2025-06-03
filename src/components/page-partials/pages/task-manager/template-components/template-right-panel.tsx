import { countTimeOfWeed } from "@/services/analytics/task-menager/template-handle-data";
import { WeekTaskEntity } from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { paresSecondToTime } from "@/utils/time.util";

type FlattenedTask = {
  day: string;
  title: string;
  duration: number;
};

type StackedDay = {
  day: string;
  [title: string]: string | number; // ключ — назва задачі
};

const TemplateRightPanel = ({ templateTasks }: { templateTasks: Items }) => {
  const [analyticsData, setAnalyticsData] = useState<WeekTaskEntity>({});
  useEffect(() => {
    console.log("Templated tasks updated:", templateTasks);
    const analyticsData = countTimeOfWeed(templateTasks); // 🔄 Виклик функції для обробки шаблонних завдань
    console.log("Analytics data:", analyticsData);
    setAnalyticsData(analyticsData);
  }, [templateTasks]);

  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clean before render

    const group = svg
      .attr("viewBox", `0 0 800 400`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Flatten and prepare data
    const tasks: FlattenedTask[] = [];
    Object.entries(analyticsData).forEach(([day, entry]) => {
      entry?.tasks.forEach((task) => {
        tasks.push({
          day,
          title: task.title,
          duration: task.isDetermined ? task.timeDone : task.time,
        });
      });
    });

    // console.log("Flattened tasks:", tasks);

    // Group and pivot
    const grouped = d3.group(tasks, (d) => d.day);
    const keys = Array.from(new Set(tasks.map((d) => d.title)));

    const stackData: StackedDay[] = Array.from(grouped, ([day, group]) => {
      const entry: StackedDay = { day };
      group.forEach((task) => {
        entry[task.title] =
          typeof task.duration === "number" ? task.duration : 0;
      });
      return entry;
    });

    const stack = d3.stack<StackedDay>().keys(keys)(stackData);

    const x = d3
      .scaleBand()
      .domain(stackData.map((d) => d.day))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(stackData, (d) => d3.sum(keys, (k) => (d[k] as number) || 0))!,
      ])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeSet2).domain(keys);

    // X Axis
    group
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `Day ${d}`));

    // Y Axis
    group.append("g").call(
      d3.axisLeft(y).tickFormat((d) => {
        const { hours, minutes } = paresSecondToTime(d as number);
        return `${hours}h ${minutes}m`;
      })
    );

    // Bars
    group
      .selectAll("g.layer")
      .data(stack)
      .join("g")
      .attr("fill", (d) => color(d.key)!)
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.day.toString())!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => {
        const h = y(d[0]) - y(d[1]);
        return isNaN(h) ? 0 : h;
      })
      .attr("width", x.bandwidth());
  }, [analyticsData]);
  return <svg ref={ref} className="w-full h-auto" />;
};

export default TemplateRightPanel;

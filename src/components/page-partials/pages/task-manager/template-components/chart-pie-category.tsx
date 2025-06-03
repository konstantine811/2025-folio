import { ThemePalette } from "@/config/theme-colors.config";
import { CategoryCountTime } from "@/types/analytics/task-analytics.model";
import { paresSecondToTime } from "@/utils/time.util";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface PieChartProps {
  data: CategoryCountTime; // CategoryCountTime
  width?: number;
  height?: number;
}

const ChartPieCategory = ({
  data,
  width = 400,
  height = 400,
}: PieChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const [t] = useTranslation();
  useEffect(() => {
    if (!ref.current) return;

    const names = Object.keys(data);
    const values = Object.values(data);
    const dataset = names.map((name, i) => ({ name, value: values[i] }));

    const radius = Math.min(width, height) / 2;

    const pie = d3.pie<{ name: string; value: number }>().value((d) => d.value);
    const arc = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.1)
      .outerRadius(radius - 10)
      .padAngle(0.02)
      .cornerRadius(20); // 👈 додає заокруглення країв

    const arcLabel = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.9) // трохи за межу сектору
      .outerRadius(radius * 0.9);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const maxValue = d3.max(dataset, (d) => d.value) ?? 1;

    const group = svg
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("class", "text-xs")
      .append("g");
    d3.color(ThemePalette.dark.accent);
    group
      .selectAll("path")
      .data(pie(dataset))
      .join("path")
      .attr("d", arc)

      .attr("class", () => {
        return `fill-accent stroke-2 stroke-foreground/20`;
      })
      .attr("style", (d) => {
        const opacity = Math.max(0.1, d.data.value / maxValue); // мінімальна прозорість
        return `fill-opacity: ${opacity}`;
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    group
      .selectAll("text")
      .data(pie(dataset))
      .join("text")
      .attr("transform", (d) => {
        const [x, y] = arcLabel.centroid(d);
        const angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);
        return `translate(${x}, ${y}) rotate(${
          angle < 180 ? angle - 90 : angle + 90
        })`;
      })
      .attr("text-anchor", (d) =>
        (d.endAngle + d.startAngle) / 2 > Math.PI ? "start" : "end"
      )
      .attr("alignment-baseline", "middle")
      .attr("class", "text-xs text-background")
      .attr("fill", "currentColor")
      .call((text) =>
        text
          .append("tspan")
          .attr("x", 0)
          .text((d) => t(d.data.name) || d.data.name)
      )
      .attr("class", (d) => {
        const opacity = d.data.value / maxValue;
        return opacity < 0.4 ? "text-accent" : "text-background"; // темний текст на прозорому, світлий на насиченому
      })
      .call((text) =>
        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .attr("fill-opacity", 0.7)
          .text((d) => {
            const { hours, minutes } = paresSecondToTime(d.data.value);
            return `${hours}:${minutes}`;
          })
      );
  }, [data, width, height, t]);

  return <svg ref={ref} className="w-full h-auto overflow-visible" />;
};

export default ChartPieCategory;

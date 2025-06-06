import { CategoryAnalyticsNameEntity } from "@/types/analytics/task-analytics.model";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface ChartPieCategoryProps {
  data: CategoryAnalyticsNameEntity;
  width?: number;
  height?: number;
}

interface PieEntity {
  name: string;
  time: number;
}

const ChartPieCategory = ({
  data,
  width = 400,
  height = 400,
}: ChartPieCategoryProps) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const [t] = useTranslation();
  useEffect(() => {
    if (!ref.current) return;

    const radius = Math.min(width, height) / 2;
    const outerRadius = radius - 3;
    const innerRadius = radius * 0.2;

    const entries = Object.entries(data).map(([id, value]) => ({
      name: id,
      time: value.time,
      doneTime: value.countDoneTime,
    }));

    const pie = d3.pie<PieEntity>().value((d) => d.time);

    const timeArcs = pie(entries);

    const arc = d3
      .arc<d3.PieArcDatum<PieEntity>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6)
      .padAngle(0.02);

    const arcOverlay = d3
      .arc<d3.PieArcDatum<PieEntity>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6)
      .padAngle(0.02);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .append("g");

    // Main time arcs
    g.selectAll("path.base")
      .data(timeArcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("class", "fill-transparet stroke-foreground/30 stroke");

    // Рахуємо arcDone, як частку часу
    g.selectAll("path.done")
      .data(timeArcs)
      .enter()
      .append("path")
      .attr("class", "done")
      .attr("d", (d, i) => {
        const entry = entries[i];
        const progress = entry.doneTime / entry.time;
        const angleRange = d.endAngle - d.startAngle;
        const newEndAngle = d.startAngle + angleRange * Math.min(progress, 1);
        const arcProgress = {
          ...d,
          endAngle: newEndAngle,
        };
        return arcOverlay(arcProgress);
      })
      // .attr("fill-opacity", (_, i) => {
      //   const entry = entries[i];
      //   const progress = entry.doneTime / entry.time;
      //   return Math.min(progress, 1) * 2.2; // Scale opacity based on progress
      // })
      .attr("class", "fill-accent stroke-0 stroke-accent/10");

    // Optional: labels
    const labelArc = d3
      .arc<d3.PieArcDatum<PieEntity>>()
      .innerRadius((outerRadius + innerRadius) / 2 + 60)
      .outerRadius((outerRadius + innerRadius) / 2 + 60);

    g.selectAll("text")
      .data(timeArcs)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const [x, y] = labelArc.centroid(d);
        const angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);
        return `translate(${x}, ${y}) rotate(${
          angle < 180 ? angle - 90 : angle + 90
        })`;
      })
      .attr("text-anchor", (d) =>
        (d.endAngle + d.startAngle) / 2 > Math.PI ? "start" : "end"
      )
      .attr("alignment-baseline", "middle")
      .text((d) => t(d.data.name))
      .attr("class", "text-[10px] fill-foreground/80");
  }, [data, width, height, t]);

  return <svg ref={ref} className="w-full h-auto" />;
};

export default ChartPieCategory;

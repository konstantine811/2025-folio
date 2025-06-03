import { CategoryCountTime } from "@/types/analytics/task-analytics.model";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!ref.current) return;

    const names = Object.keys(data);
    const values = Object.values(data);
    const dataset = names.map((name, i) => ({ name, value: values[i] }));

    const radius = Math.min(width, height) / 2;
    const color = d3
      .scaleOrdinal<string>()
      .domain(names)
      .range(
        [...d3.schemeSpectral[names.length > 11 ? 11 : names.length]].reverse()
      );

    const pie = d3.pie<{ name: string; value: number }>().value((d) => d.value);
    const arc = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const arcLabel = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const group = svg
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("class", "text-xs")
      .append("g");

    group
      .selectAll("path")
      .data(pie(dataset))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name)!)
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    group
      .selectAll("text")
      .data(pie(dataset))
      .join("text")
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
      .attr("text-anchor", "middle")
      .call((text) =>
        text
          .append("tspan")
          .attr("font-weight", "bold")
          .text((d) => d.data.name)
      )
      .call((text) =>
        text
          .append("tspan")
          .attr("x", 0)
          .attr("y", "1em")
          .attr("fill-opacity", 0.7)
          .text((d) => `${d.data.value}`)
      );
  }, [data, width, height]);

  return <svg ref={ref} className="w-full h-auto" />;
};

export default ChartPieCategory;

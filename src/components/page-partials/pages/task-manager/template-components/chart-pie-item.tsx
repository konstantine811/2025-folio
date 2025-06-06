import {
  ItemTimeMap,
  ItemTimeMapKeys,
} from "@/types/analytics/task-analytics.model";
import { paresSecondToTime } from "@/utils/time.util";
import * as d3 from "d3";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useChartTooltip from "../chart/hooks/use-chart-tooltip";
import { isTouchDevice } from "@/utils/touch-inspect";

interface PieChartProps {
  data: ItemTimeMap; // CategoryCountTime
  width?: number;
  height?: number;
  type: ItemTimeMapKeys;
}

const ChartPieItem = ({
  data,
  width = 400,
  height = 400,
  type,
}: PieChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const [t] = useTranslation();
  const { TooltipElement, showTooltip, hideTooltip } = useChartTooltip();
  const activeNodeRef = useRef<SVGGElement | null>(null);
  const onHideTooltip = useCallback((self: SVGGElement) => {
    d3.select(self).transition().duration(200).attr("transform", "scale(1)");
  }, []);

  const handleInteraction = useCallback(
    (
      self: SVGGElement,
      d: d3.PieArcDatum<{ name: string; value: number }>,
      event: PointerEvent,
      arc: d3.Arc<null, d3.PieArcDatum<{ name: string; value: number }>>,
      t: (s: string) => string,
      showTooltip: (data: {
        event: PointerEvent;
        title: string;
        time: number;
      }) => void,
      hideTooltip: () => void,
      onHideTooltip: (el: SVGGElement) => void,
      activeNodeRef: RefObject<SVGGElement | null>
    ) => {
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
        .transition()
        .duration(100)
        .attr(
          "transform",
          `translate(${arc.centroid(d)}) scale(1.1) translate(${-arc.centroid(
            d
          )[0]}, ${-arc.centroid(d)[1]})`
        );

      showTooltip({
        event,
        title: t(d.data.name),
        time: d.data.value,
      });
    },
    []
  );

  // Всередині компонента
  useEffect(() => {
    if (!ref.current) return;
    const offset = 40;
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
      .cornerRadius(20);

    const arcLabel = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const maxValue = d3.max(dataset, (d) => d.value) ?? 1;

    const group = svg
      .attr(
        "viewBox",
        `${-width / 2} ${-height / 2} ${width + offset} ${height + offset}`
      )
      .attr("class", "text-xs")
      .append("g");

    const arcs = pie(dataset);

    const paths = group
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("d", arc)
      .attr("id", (d) => `arc-${d.data.name}`)
      .attr("class", "fill-accent stroke-2 stroke-foreground/20")
      .attr("style", (d) => {
        const opacity = Math.max(0.1, d.data.value / maxValue);
        return `fill-opacity: ${opacity}; transition: transform 0.2s ease;`;
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("transform", "scale(1)");

    if (type === ItemTimeMapKeys.task) {
      if (isTouchDevice) {
        paths.on("pointerdown", function (event, d) {
          handleInteraction(
            this as SVGGElement,
            d,
            event,
            arc,
            t,
            showTooltip,
            hideTooltip,
            onHideTooltip,
            activeNodeRef
          );
        });
      } else {
        paths.on("pointerenter", function (event, d) {
          handleInteraction(
            this as SVGGElement,
            d,
            event,
            arc,
            t,
            showTooltip,
            hideTooltip,
            onHideTooltip,
            activeNodeRef
          );
        });
        paths.on("mouseleave", function () {
          // Scale back
          if (activeNodeRef.current === this) {
            onHideTooltip(this as SVGGElement);
            hideTooltip();
            activeNodeRef.current = null;
          }
        });
      }
    }

    group
      .selectAll("text")
      .data(arcs)
      .join("text")
      .attr("transform", (d) => {
        const [x, y] = arcLabel.centroid(d);
        const angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);
        return `translate(${x}, ${y}) rotate(${
          angle < 180 ? angle - 90 : angle + 90
        })`;
      })
      .attr("text-anchor", (d) =>
        (d.endAngle + d.startAngle) / 2 > Math.PI
          ? "start"
          : names.length > 1
          ? "end"
          : "start"
      )
      .attr("alignment-baseline", "middle")
      .attr("fill", "currentColor")
      .attr("class", (d) => {
        const opacity = d.data.value / maxValue;
        return opacity < 0.4 ? "text-accent" : "text-background";
      })
      .each(function (d) {
        const text = d3.select(this);
        const { hours, minutes } = paresSecondToTime(d.data.value);
        const parsedHours = String(Number(hours));
        if (type === ItemTimeMapKeys.task) {
          text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "0.2em")
            .attr("fill-opacity", 0.7)
            .text(`${parsedHours}:${minutes}`);
        } else {
          text
            .append("tspan")
            .attr("font-weight", "bold")
            .attr("x", 0)
            .text(t(d.data.name));
          text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .attr("fill-opacity", 0.7)
            .text(`${parsedHours}:${minutes}`);
        }
      });
  }, [
    data,
    width,
    height,
    t,
    type,
    showTooltip,
    hideTooltip,
    onHideTooltip,
    handleInteraction,
  ]);

  // В render:
  return (
    <div className="relative">
      {type === ItemTimeMapKeys.task && TooltipElement}
      <svg ref={ref} className="w-full h-auto overflow-visible" />
    </div>
  );
};

export default ChartPieItem;

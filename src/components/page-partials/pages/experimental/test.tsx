import Card from "@/components/ui-abc/card/card";
import LogoAnimated from "@/components/ui-abc/logo";
import { Button } from "@/components/ui/button";
import { EXPERIMENTAL_ROUTERS } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { isDev } from "@/utils/check-env";
import { exportHtmlToPng, exportSvgToFile } from "@/utils/export-to-png";
import { useCallback, useEffect, useRef } from "react";

const Test = () => {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const hs = useHeaderSizeStore((s) => s.size);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigateTo = useTransitionRouteTo();
  const dataGridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  // стабільний setter, щоб не створювати нову функцію на кожен рендер
  const setCardRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      if (el) cardRefs.current[index] = el;
      else delete cardRefs.current[index]; // cleanup, якщо картку прибрали
    };
  }, []);
  useEffect(() => {
    const cards = cardRefs.current;
    const dataGrid = dataGridRef.current;
    const handlePointerMove = (e: PointerEvent) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };
    dataGrid?.addEventListener("pointermove", handlePointerMove);

    return () => {
      dataGrid?.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);
  return (
    <div
      className="container mx-auto"
      style={{ paddingTop: hs }}
      ref={dataGridRef}
    >
      {isDev ? (
        <div className="container mx-auto">
          <div
            ref={svgWrapRef}
            className="w-16 h-16 bg-card p-2 rounded-md flex items-center justify-center"
          >
            <LogoAnimated ref={svgRef} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={"outline"}
              onClick={() => exportHtmlToPng(svgWrapRef.current!, "logo.png")}
            >
              Завантажити PNG
            </Button>
            <Button
              variant="outline"
              onClick={() => exportSvgToFile(svgRef.current!, "logo.svg")}
            >
              Завантажити SVG
            </Button>
          </div>
        </div>
      ) : null}
      <ul className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-10">
        {EXPERIMENTAL_ROUTERS.map((item, idx) => {
          return (
            <Card
              ref={setCardRef(idx)}
              onClick={() => {
                navigateTo(
                  item.path.startsWith("/") ? item.path : `/${item.path}`
                );
              }}
              key={item.id}
              srcImage={item.imageUrl}
              title={item.id}
              description={item.description}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default Test;

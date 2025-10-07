import Card from "@/components/ui-abc/card/card";
import LogoAnimated from "@/components/ui-abc/logo";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { Button } from "@/components/ui/button";
import { EXPERIMENTAL_ROUTERS } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { isDev } from "@/utils/check-env";
import { exportHtmlToPng, exportSvgToFile } from "@/utils/export-to-png";
import { useRef } from "react";

const Test = () => {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigateTo = useTransitionRouteTo();
  return (
    <div className="container mx-auto">
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
      <WrapperHoverElement
        as="ul"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-10"
      >
        {EXPERIMENTAL_ROUTERS.map((item) => {
          return (
            <Card
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
      </WrapperHoverElement>
    </div>
  );
};

export default Test;

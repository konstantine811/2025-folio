import LogoAnimated from "@/components/ui-abc/logo";
import { Button } from "@/components/ui/button";
import { exportHtmlToPng, exportSvgToFile } from "@/utils/export-to-png";
import { useRef } from "react";
import TestDrawerOpen from "./experimental/test-drawer-open";

const Experimental = () => {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  return (
    <div className="container mx-auto h-[300vh]">
      <h1 className="text-foreground text-xl">Hello from Experimental page</h1>
      <TestDrawerOpen />
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
  );
};

export default Experimental;

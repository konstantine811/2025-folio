import LogoAnimated from "@/components/ui-abc/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EXPERIMENTAL_ROUTERS } from "@/config/router-config";
import { isDev } from "@/utils/check-env";
import { exportHtmlToPng, exportSvgToFile } from "@/utils/export-to-png";
import { useRef } from "react";
import { Link } from "react-router";

const Test = () => {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  return (
    <>
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
      <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {EXPERIMENTAL_ROUTERS.map((item) => {
          return (
            <Link
              to={item.path.startsWith("/") ? item.path : `/${item.path}`}
              key={item.id}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {item.icon} {item.id}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {item.imageUrl ? (
                    <img
                      className="object-cover h-52 w-full"
                      src={item.imageUrl}
                      alt={item.id}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Test;

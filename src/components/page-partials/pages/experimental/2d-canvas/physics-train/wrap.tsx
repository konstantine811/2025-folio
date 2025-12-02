import { useEffect, useRef, useState } from "react";
import Init2DSketch, { SketchHandle, SketchPlugin } from "../2d-sketch/init";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GridPlugin } from "./plugins/grid";
import { BouncingBall } from "./plugins/bouncing-ball";
import { GraphPlugin } from "./plugins/graph/graph";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
const items: { key: string; label: string; plugin: () => SketchPlugin }[] = [
  { key: "grid", label: "Grid", plugin: GridPlugin },
  { key: "ball", label: "Bouncing Ball", plugin: BouncingBall },
  { key: "graph", label: "Graph", plugin: GraphPlugin },
];

const STORAGE_KEY = "wrapPhysics.plugin";

const WrapPhysics = () => {
  const ref = useRef<SketchHandle>(null);
  const hs = useHeaderSizeStore((s) => s.size);
  const [selected, setSelected] = useState<string>(
    window.localStorage.getItem(STORAGE_KEY) as string | "grid"
  );

  // коли змінюється вибір — міняємо плагін
  useEffect(() => {
    const handle = ref.current;
    if (!handle) return;
    const plugin = items.find((i) => i.key === selected)?.plugin;
    if (plugin) {
      handle.setPlugin(plugin());
      window.localStorage.setItem(STORAGE_KEY, selected);
    }
  }, [selected]);

  return (
    <div style={{ paddingTop: hs }}>
      <div className="absolute ml-5 mt-5">
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 rounded border">
            {items.find((i) => i.key === selected)?.label ?? "Open"}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {items.map((it) => (
              <DropdownMenuItem
                key={it.key}
                onSelect={(e) => {
                  e.preventDefault(); // щоб не закривало фокус із side-effect’ом
                  setSelected(it.key);
                }}
              >
                {it.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Init2DSketch ref={ref} />
    </div>
  );
};

export default WrapPhysics;

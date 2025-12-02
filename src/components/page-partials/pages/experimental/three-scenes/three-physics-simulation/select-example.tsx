import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import BouncingBall from "./examples/bouncing-ball";
import { useEffect, useState } from "react";
import { ModelItem } from "./models/items-config";
import ExampleSimpleCube from "./examples/example-simle-cube";

const items: ModelItem[] = [
  { key: "bouncing-ball", label: "Bouncing Ball", element: <BouncingBall /> },
  { key: "simple-cube", label: "Simple Cube", element: <ExampleSimpleCube /> },
];

const SelectExample = ({
  onSelectItem,
}: {
  onSelectItem(item: ModelItem): void;
}) => {
  const [selected, setSelected] = useState<ModelItem>(items[0]);

  useEffect(() => {
    onSelectItem(selected);
  }, [onSelectItem, selected]);
  return (
    <div className="absolute ml-5 mt-20 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="px-3 py-2 rounded border">
          {items.find((i) => i.key === selected.key)?.label ?? "Open"}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map((it) => (
            <DropdownMenuItem
              key={it.key}
              onSelect={(e) => {
                e.preventDefault(); // щоб не закривало фокус із side-effect’ом
                setSelected(it);
              }}
            >
              {it.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SelectExample;

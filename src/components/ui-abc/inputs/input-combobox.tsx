import { SquareMenu } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SoundHoverElement from "../sound-hover-element";

const options = [
  { label: "Здоровʼя", value: "health" },
  { label: "Фінанси", value: "finance" },
  { label: "Емоції", value: "emotions" },
  { label: "Стосунки", value: "relationships" },
  { label: "Карʼєра", value: "career" },
  { label: "Духовність", value: "spirituality" },
  { label: "Особистий ріст", value: "personal_growth" },
  { label: "Відпочинок", value: "leisure" },
];

function InputCombobox({
  onValueChange,
  outerValue = "",
}: {
  onValueChange?: (value: string) => void;
  outerValue?: string;
}) {
  const [editingValue, setEditingValue] = useState(""); // те, що вводиться

  const handleSetValue = (newVal: string) => {
    setEditingValue(newVal);
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  useEffect(() => {
    setEditingValue(outerValue);
  }, [outerValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSetValue(editingValue);
    }
  };

  const handleSelect = (label: string) => {
    handleSetValue(label);
  };

  return (
    <div className="flex gap-1 items-center w-full">
      <Input
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введи або обери..."
        className="!text-xl"
      />
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <SoundHoverElement animValue={0.9}>
              <Button variant="ghost" size="icon">
                <SquareMenu />
              </Button>
            </SoundHoverElement>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandGroup>
              {options.map((option) => (
                <SoundHoverElement animValue={0.99} key={option.value}>
                  <CommandItem onSelect={() => handleSelect(option.label)}>
                    {option.label}
                  </CommandItem>
                </SoundHoverElement>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default InputCombobox;

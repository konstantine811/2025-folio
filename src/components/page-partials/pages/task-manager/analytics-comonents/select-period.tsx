import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/classname";
import { CommandItem } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const SelectPeriod = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center justify-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value ? value : "Select framework..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={"week"}
                  className="cursor-default hover:bg-muted-foreground flex px-2  py-1 rounded-sm items-center transition"
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {"week"}
                  <Check
                    size={14}
                    className={cn(
                      "ml-auto",
                      value === "week" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
                <CommandItem
                  className="cursor-default hover:bg-muted-foreground flex px-2 py-1 rounded-sm items-center transition"
                  value={"month"}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {"month"}
                  <Check
                    size={14}
                    className={cn(
                      "ml-auto",
                      value === "month" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectPeriod;

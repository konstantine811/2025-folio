import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils"; // якщо використовуєш clsx / cn
import SoundHoverElement from "../sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import WrapperHoverElement from "../wrapper-hover-element";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: NumberInputProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md shadow-md px-3 py-2 w-fit",
        className
      )}
    >
      <WrapperHoverElement>
        <SoundHoverElement
          hoverTypeElement={SoundTypeElement.SELECT}
          hoverStyleElement={HoverStyleElement.quad}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`text-lg hover:bg-card/80 hover:text-foreground ${
              value >= max && "text-foreground/30"
            }`}
            onClick={increment}
            disabled={value >= max}
          >
            +
          </Button>
        </SoundHoverElement>
      </WrapperHoverElement>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          const onlyNumbers = e.target.value.replace(/\D/g, ""); // прибирає всі нечислові символи
          const newValue = parseInt(onlyNumbers, 10);
          if (!isNaN(newValue)) {
            onChange(Math.min(Math.max(newValue, min), max));
          }
        }}
        inputMode="numeric" // показує цифрову клавіатуру на мобілках
        className="w-12 text-center font-bold text-lg border-none focus:outline-none"
      />
      <WrapperHoverElement>
        <SoundHoverElement
          hoverTypeElement={SoundTypeElement.SELECT}
          hoverStyleElement={HoverStyleElement.quad}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`text-lg hover:bg-card/80 hover:text-foreground ${
              value <= min && "text-foreground/30"
            }`}
            onClick={decrement}
            disabled={value <= min}
          >
            −
          </Button>
        </SoundHoverElement>
      </WrapperHoverElement>
    </div>
  );
}

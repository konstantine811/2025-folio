import { useMemo } from "react";
import { ExperimentalTypes } from "@/config/router-config";
import type { AppRoute } from "@/types/route";
import { cn } from "@/lib/utils";
import SoundHoverElement from "./sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import WrapperHoverElement from "./wrapper-hover-element";

interface ExperimentalFiltersProps {
  items: AppRoute[];
  selectedType: ExperimentalTypes | "ALL" | null;
  onTypeChange: (type: ExperimentalTypes | "ALL" | null) => void;
}

export function ExperimentalFilters({
  items,
  selectedType,
  onTypeChange,
}: ExperimentalFiltersProps) {
  // Get unique types from items
  const uniqueTypes = useMemo(() => {
    const types = new Set<ExperimentalTypes>();
    items.forEach((item) => {
      if (item.type) {
        types.add(item.type);
      }
    });
    return Array.from(types).sort();
  }, [items]);

  // Format type value to display label dynamically
  const formatTypeLabel = (type: ExperimentalTypes | "ALL"): string => {
    if (type === "ALL") return "ALL";

    // Convert enum value to readable label
    // e.g., "physics" -> "PHYSICS", "2d-canvas" -> "2D CANVAS", "webgpu" -> "WEBGPU"
    return type
      .split("-")
      .map((word) => {
        // Handle special cases with numbers
        if (word === "2d") return "2D";
        // For all other words, capitalize first letter and uppercase the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
      })
      .join(" ");
  };

  return (
    <WrapperHoverElement as="div" className="flex items-center gap-2 flex-wrap">
      {/* ALL Button */}
      <SoundHoverElement
        hoverTypeElement={SoundTypeElement.BUTTON}
        hoverStyleElement={HoverStyleElement.quad}
        onClick={() => onTypeChange("ALL")}
        className={cn(
          "px-4 py-1.5 rounded-md border font-mono text-[10px] uppercase font-bold tracking-wide transition-all duration-200 cursor-pointer",
          selectedType === "ALL" || selectedType === null
            ? "border-foreground/20 bg-foreground text-background"
            : "border-foreground/10  text-muted-foreground hover:border-foreground/20 hover:text-foreground bg-background"
        )}
      >
        ALL
      </SoundHoverElement>

      {/* Type Buttons */}
      {uniqueTypes.map((type) => {
        const isActive = selectedType === type;
        return (
          <SoundHoverElement
            key={type}
            hoverTypeElement={SoundTypeElement.BUTTON}
            hoverStyleElement={HoverStyleElement.quad}
            onClick={() => onTypeChange(type)}
            className={cn(
              "px-4 py-1.5 rounded-md border font-mono text-[10px] uppercase font-bold tracking-wide transition-all duration-200 cursor-pointer",
              isActive
                ? "border-foreground/20 bg-foreground/70 text-background"
                : "border-foreground/10 text-muted-foreground hover:border-foreground/20 hover:text-foreground bg-background"
            )}
          >
            {formatTypeLabel(type)}
          </SoundHoverElement>
        );
      })}
    </WrapperHoverElement>
  );
}

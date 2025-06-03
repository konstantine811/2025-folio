import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { Button } from "@/components/ui/button";
import { StyleWordBreak } from "@/config/styles.config";
import { HoverStyleElement } from "@/types/sound";
import { Plus } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface DailyAddTemplateButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
}
const DailyAddTemplateButton = ({
  title,
  ...rest
}: DailyAddTemplateButtonProps) => {
  const [t] = useTranslation();
  return (
    <WrapperHoverElement>
      <SoundHoverElement
        hoverStyleElement={HoverStyleElement.quad}
        animValue={1}
        className="w-full"
      >
        <Button
          {...rest}
          style={StyleWordBreak}
          variant="ghost"
          className="w-full truncate text-foreground border border-foreground/10 hover:bg-transparent hover:text-accent"
        >
          <Plus />
          {t(title)}
        </Button>
      </SoundHoverElement>
    </WrapperHoverElement>
  );
};

export default DailyAddTemplateButton;

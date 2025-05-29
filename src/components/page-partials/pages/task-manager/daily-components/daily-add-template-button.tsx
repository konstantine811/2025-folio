import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import { HoverStyleElement } from "@/types/sound";
import { Plus } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

const DailyAddTemplateButton = ({
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [t] = useTranslation();
  return (
    <SoundHoverElement
      hoverStyleElement={HoverStyleElement.quad}
      onClick={() => {
        console.log("Template task clicked");
      }}
      animValue={1}
      className="w-full"
    >
      <Button
        {...rest}
        variant="ghost"
        className="w-full text-foreground border border-foreground/10 hover:bg-transparent hover:text-accent"
      >
        <Plus />
        {t("task_manager.add_template_task")}
      </Button>
    </SoundHoverElement>
  );
};

export default DailyAddTemplateButton;

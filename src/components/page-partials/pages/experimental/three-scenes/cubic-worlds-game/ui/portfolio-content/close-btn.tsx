import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";

type Props = {
  onClick?: () => void;
};

export default function CloseButton({ onClick }: Props) {
  return (
    <div className="mt-3">
      <SoundHoverElement
        onClick={onClick}
        hoverStyleElement={HoverStyleElement.circle}
        animValue={0.9}
        hoverTypeElement={SoundTypeElement.BUTTON}
        className="
        group h-[50px] w-[50px]
        text-foreground
        rounded-full inline-block
       
      "
      >
        <span
          className="
          relative flex h-full items-center justify-center
          before:content-[''] before:absolute before:h-[2px] before:w-[30px]
          before:bg-foreground before:left-1/2 before:top-1/2
          before:-translate-x-1/2 before:-translate-y-1/2
          before:rotate-[-45deg]
          before:transition-all before:duration-200 before:ease-out

          after:content-[''] after:absolute after:h-[2px] after:w-[30px]
          after:bg-foreground after:left-1/2 after:top-1/2
          after:-translate-x-1/2 after:-translate-y-1/2
          after:rotate-[45deg]
          after:transition-all after:duration-200 after:ease-out

          group-hover:before:top-1/4
          group-hover:before:translate-y-0
          group-hover:before:rotate-0

          group-hover:after:top-[76%]
          group-hover:after:translate-y-0
          group-hover:after:rotate-0
        "
        >
          <span
            className="
            label pointer-events-none select-none
            opacity-0 transition-opacity duration-200 ease-out
            group-hover:opacity-100 text-xs font-pixel
          "
          >
            Close
          </span>
        </span>
      </SoundHoverElement>
    </div>
  );
}

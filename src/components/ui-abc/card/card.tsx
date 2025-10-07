import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import SoundHoverElement from "../sound-hover-element";
import LogoAnimated from "../logo";

type Props = {
  onClick: () => void;
  srcImage?: string | undefined | null;
  title: string;
  description?: string;
};

const Card = ({ onClick, srcImage, title, description }: Props) => {
  return (
    <SoundHoverElement
      hoverAnimType="scale"
      animValue={0.97}
      hoverTypeElement={SoundTypeElement.SELECT}
      hoverStyleElement={HoverStyleElement.quad}
      as="li"
      className="bg-card text-foreground rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
      onClick={onClick}
    >
      <div className="w-full h-48 flex items-center justify-center">
        {srcImage ? (
          <img
            className="object-cover w-full h-48"
            src={srcImage}
            alt={title}
          />
        ) : (
          <div className="w-15 flex items-center justify-center h-full">
            <LogoAnimated />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow bg-card/15 backdrop-blur-2xl">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground flex-grow">{description}</p>
      </div>
    </SoundHoverElement>
  );
};

export default Card;

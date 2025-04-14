import { TestTubeDiagonal } from "lucide-react";
import SoundHoverElement from "../sound-hover-element";
import { SoundTypeElement } from "@custom-types/sound";

const ColorPicker = () => {
  return (
    <SoundHoverElement
      as="button"
      hoverTypeElement={SoundTypeElement.LOGO}
      className="p-2 rounded-full hover:shadow-md shadow-white/30"
      hoverAnimType="translate"
    >
      <TestTubeDiagonal />
    </SoundHoverElement>
  );
};

export default ColorPicker;

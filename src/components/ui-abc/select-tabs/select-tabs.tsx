import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { motion } from "framer-motion";
import { useState } from "react";
import SoundHoverElement from "../sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@custom-types/sound";
import WrapperHoverElement from "../wrapper-hover-element";
import { useTranslation } from "react-i18next";

const SelectTabs = ({
  items,
  onSelectItem,
}: {
  items: string[];
  onSelectItem?: (item: string) => void;
}) => {
  const [selected, setSelected] = useState(items[0]);
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center">
      <WrapperHoverElement
        as="ul"
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative flex flex-wrap md:border border-fg rounded-sm  items-center justify-center"
      >
        {items.map((item, index) => (
          <SoundHoverElement
            as="li"
            hoverTypeElement={SoundTypeElement.SELECT_2}
            hoverStyleElement={HoverStyleElement.quad}
            hoverAnimType="scale"
            key={index}
            className={`relative z-10 cursor-pointer px-6 py-2 ${
              selected === item ? "text-background" : "text-fg"
            }`}
            onClick={() => {
              setSelected(item);
              if (onSelectItem) {
                onSelectItem(item);
              }
            }}
          >
            {selected === item && (
              <motion.div
                layoutId="highlight"
                className="absolute inset-0 bg-fg"
                transition={MOTION_FRAME_TRANSITION.spring}
              />
            )}
            <span className="relative z-10">{t(item)}</span>
          </SoundHoverElement>
        ))}
      </WrapperHoverElement>
    </div>
  );
};

export default SelectTabs;

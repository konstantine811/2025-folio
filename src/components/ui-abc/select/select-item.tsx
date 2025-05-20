import SoundHoverElement from "../sound-hover-element";
import { SoundTypeElement } from "@custom-types/sound";
import { AnimatePresence, Variants } from "motion/react";
import { useState } from "react";
import WrapperHoverElement from "../wrapper-hover-element";
import { MOTION_FRAME_TRANSITION } from "@config/animations";

type SelectItemProps = {
  renderItems: (itemVariants: Variants) => React.ReactNode;
  dropPosition?: {
    x: number;
    y: number;
  };
  selectNode: React.ReactNode;
};

const SelectItem = ({
  renderItems,
  dropPosition = { x: 0, y: 0 },
  selectNode,
}: SelectItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.06, // ⏱ затримка між появою пунктів
        delayChildren: 0, // ⏳ затримка перед першим
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 15 },
    visible: {
      opacity: 1,
      x: 0,

      transition: MOTION_FRAME_TRANSITION.spring2,
    },
    exit: { opacity: 0, x: 1 }, // 👈 додай це
  };

  return (
    <>
      <div className="relative">
        <SoundHoverElement
          as="button"
          hoverTypeElement={SoundTypeElement.LOGO}
          className="p-3 rounded-full relative z-[1000]"
          hoverAnimType="translate"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {selectNode}
        </SoundHoverElement>
        <div
          className={`${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <AnimatePresence>
            {isOpen && (
              <div
                className="absolute z-10 left-0"
                style={{
                  transform: `translate(${dropPosition.x}px, ${dropPosition.y}px)`,
                }}
              >
                <WrapperHoverElement
                  className="flex flex-col gap-1"
                  initial="hidden"
                  animate="visible"
                  as="ul"
                  exit="hidden"
                  key={isOpen ? "visible" : "hidden"} // 👈 це важливо
                  variants={containerVariants}
                  onClick={() => setIsOpen(false)}
                >
                  {renderItems(itemVariants)}
                </WrapperHoverElement>
              </div>
            )}
          </AnimatePresence>
          {isOpen && (
            <div
              className="fixed h-screen w-screen top-0 right-0 z-0"
              onClick={() => {
                setIsOpen(false);
              }}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default SelectItem;

import SoundHoverElement from "@components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@components/ui-abc/wrapper-hover-element";
import { SoundTypeElement } from "@custom-types/sound";
import { useNavMenuStore } from "@storage/navMenuStore";
import { AnimatePresence, motion } from "motion/react";

const RevealNavMenu = () => {
  const { isOpen } = useNavMenuStore((state) => state);
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05, // ⏱ затримка між появою пунктів
        delayChildren: 0.2, // ⏳ затримка перед першим
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,

      transition: {
        type: "spring",
        stiffness: 50,
        damping: 3,
        bounce: 1,
        mass: 0.3,
      },
    },
    exit: { opacity: 0, y: 1 }, // 👈 додай це
  };
  const items = ["Item 1", "Item 2", "Item 3", "Item 4"];
  return (
    <div
      className={`${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20,
              bounce: 10,
            }}
            layout="size"
            className="absolute z-10 bottom-0 left-0 w-full bg-[#151515]/99  flex items-center justify-center  translate-y-full rounded-br-md"
          >
            <WrapperHoverElement
              className="text-white py-2 flex flex-col w-full px-4"
              initial="hidden"
              animate="visible"
              as="ul"
              exit="hidden"
              key={isOpen ? "visible" : "hidden"} // 👈 це важливо
              variants={containerVariants}
            >
              {items.map((item, i) => (
                <SoundHoverElement
                  key={i}
                  variants={itemVariants}
                  className="relative  w-full py-4 px-2 text-[#e0e0ff] text-lg font-medium hover:bg-main/5 transition-background duration-300 rounded-md"
                  hoverTypeElement={SoundTypeElement.LINK}
                  as="li"
                >
                  {item}
                </SoundHoverElement>
              ))}
            </WrapperHoverElement>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevealNavMenu;

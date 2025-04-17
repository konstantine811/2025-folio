import SoundHoverElement from "@components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@components/ui-abc/wrapper-hover-element";
import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { router } from "@config/router-config";
import { SoundTypeElement } from "@custom-types/sound";
import { useClickStore } from "@storage/clickStore";
import { useNavMenuStore } from "@storage/navMenuStore";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import { useLocation, useNavigate } from "react-router";

const RevealNavMenu = memo(() => {
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const location = useLocation();
  const navigate = useNavigate();
  const setClick = useClickStore((state) => state.setClick);
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05, // ⏱ затримка між появою пунктів
        delayChildren: 0.1, // ⏳ затримка перед першим
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,

      transition: MOTION_FRAME_TRANSITION.spring2,
    },
    exit: { opacity: 0, y: 1 }, // 👈 додай це
  };
  return (
    <div
      className={`${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full"
          style={{ height: `${document.body.scrollHeight}px` }}
          onClick={() => {
            setClick(SoundTypeElement.BUTTON);
            setOpen(false);
          }}
        ></div>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={MOTION_FRAME_TRANSITION.spring}
            layout="size"
            className="absolute z-10 bottom-0 left-0 w-full bg-background-alt/99  flex items-center justify-center  translate-y-full rounded-br-md"
          >
            <WrapperHoverElement
              className="py-1 flex flex-col w-full px-2"
              initial="hidden"
              animate="visible"
              exit="hidden"
              as="ul"
              variants={containerVariants}
            >
              {router.map((route, i) => (
                <a
                  key={i}
                  onClick={(e) => {
                    e.preventDefault(); // 👈 запобігаємо переходу
                    const path = route.path || "/";
                    if (location.pathname === path) {
                      return; // 👈 нічого не виконуємо
                    } else {
                      setOpen(false); // 🔥 закриваємо меню
                      onTransition(true); // 🔥 запускаємо лише якщо маршрут інший
                      setTimeout(() => {
                        navigate(path);
                      }, 1000);
                    }
                  }}
                  className={`${
                    route.path === location.pathname &&
                    "bg-background rounded-sm"
                  }`}
                >
                  <SoundHoverElement
                    variants={itemVariants}
                    className="relative  w-full py-2 px-4 text-fg text-lg font-medium hover:bg-main/5 rounded-md"
                    hoverTypeElement={SoundTypeElement.LINK}
                    hoverAnimType="scale"
                    animValue={0.98}
                    as="li"
                  >
                    {route.id}
                  </SoundHoverElement>
                </a>
              ))}
            </WrapperHoverElement>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
});

export default RevealNavMenu;

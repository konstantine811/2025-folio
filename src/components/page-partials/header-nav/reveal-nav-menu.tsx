import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { router } from "@config/router-config";
import { SoundTypeElement } from "@custom-types/sound";
import { useClickStore } from "@storage/clickStore";
import { useNavMenuStore } from "@storage/navMenuStore";
import { AnimatePresence, motion, Variants } from "motion/react";
import { memo } from "react";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import ToggleSound from "../page-setting/toggle-sound";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useTranslation } from "react-i18next";
import useRoutingPath from "@/hooks/useRoutingPath";
import { isLocalhost } from "@/utils/env-inspect";
import ThemeToggle from "../page-setting/theme-toggle/theme-toggle";

const RevealNavMenu = memo(() => {
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const [t] = useTranslation();
  const navigateTo = useTransitionRouteTo();
  const setClick = useClickStore((state) => state.setClick);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const firstPathName = useRoutingPath("parent");
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1, // ⏱ затримка між появою пунктів
        delayChildren: 0.1, // ⏳ затримка перед першим
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,

      transition: { ...MOTION_FRAME_TRANSITION.spring3 },
    },
    exit: { opacity: 0, y: 1 }, // 👈 додай це
  };
  return (
    <>
      <div
        className={`${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {isOpen && (
          <div
            className="fixed top-0 left-0 w-full h-full z-10"
            style={{ height: `${document.body.scrollHeight}px` }}
            onClick={() => {
              if (isSoundEnabled) {
                setClick(SoundTypeElement.BUTTON);
              }
              setOpen(false);
            }}
          ></div>
        )}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={MOTION_FRAME_TRANSITION.spring3}
              layout="size"
              className="absolute z-10 bottom-0 left-0 w-full translate-y-full bg-card rounded-2xl backdrop-blur-xs"
            >
              <motion.nav className="flex items-center justify-center ">
                <motion.ul
                  className="flex flex-col w-full"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  {router
                    .filter(
                      (route) =>
                        route.isNav &&
                        (!route.isDev || (route.isDev && isLocalhost))
                    )
                    .map((route, i) => (
                      <a
                        key={i}
                        onClick={(e) => {
                          e.preventDefault(); // 👈 запобігаємо переходу
                          const path = route.path || "/";
                          if (location.pathname === path) {
                            return; // 👈 нічого не виконуємо
                          } else {
                            setOpen(false); // 🔥 закриваємо меню
                            navigateTo(path);
                          }
                        }}
                        className={`${
                          route.path === firstPathName
                            ? "bg-background rounded-sm"
                            : "opacity-50 hover:scale-103 duration-300"
                        } overflow-hidden flex gap-2 items-center select-none cursor-pointer`}
                      >
                        <span className="ml-4 h-1 w-1 bg-foreground"></span>
                        <motion.li
                          variants={itemVariants}
                          className="relative  w-full py-5 px-4 text-foreground text-lg font-thin hover:bg-main/5 rounded-md"
                        >
                          {t(`pages.${route.id}`)}
                        </motion.li>
                      </a>
                    ))}
                </motion.ul>
              </motion.nav>
              {isMdSize && (
                <div className="flex px-5 py-5 justify-between items-center text-foreground/55 border-t border-background">
                  <div className="flex gap-5 items-center justify-center">
                    <ToggleSound />
                    <ThemeToggle />
                    <LanguagePicker />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

export default RevealNavMenu;

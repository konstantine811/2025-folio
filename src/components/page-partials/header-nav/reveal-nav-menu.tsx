import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { router } from "@config/router-config";
import { useNavMenuStore } from "@storage/navMenuStore";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import ToggleSound from "../page-setting/toggle-sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useTranslation } from "react-i18next";
import useRoutingPath from "@/hooks/useRoutingPath";
import { isLocalhost } from "@/utils/env-inspect";
import ThemeToggle from "../page-setting/theme-toggle/theme-toggle";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import clsx from "clsx";
import Login from "./login";
import { useAuthStore } from "@/storage/useAuthStore";

const RevealNavMenu = memo(() => {
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const user = useAuthStore((s) => s.user);
  const [t] = useTranslation();
  const navigateTo = useTransitionRouteTo();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const firstPathName = useRoutingPath("parent");
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05, // ⏱ затримка між появою пунктів
        delayChildren: 0.05, // ⏳ затримка перед першим
      },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, visibility: "hidden" }}
            transition={MOTION_FRAME_TRANSITION.spring}
            layout="size"
            className="z-30 fixed right-0 sm:right-14 w-full translate-y-15 sm:translate-y-0 sm:w-auto sm:min-w-80 bg-background backdrop-blur-xs border border-muted-foreground/20 rounded-sm shadow-[0_0_50px_-12px_rgba(0,0,0,1)] menu-enter flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5 bg-card">
              <Login />
            </div>
            <motion.nav className="p-2">
              <WrapperHoverElement>
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
                      <SoundHoverElement
                        as="a"
                        key={i}
                        animValue={0.99}
                        hoverTypeElement={SoundTypeElement.SELECT}
                        hoverStyleElement={HoverStyleElement.quad}
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
                            ? "bg-background rounded-sm text-foreground cursor-default"
                            : "hover:bg-muted-foreground/10 hover:text-foreground hover:opacity-100 text-muted-foreground cursor-pointer"
                        } flex items-center gap-3 px-3 py-3 rounded-lg group`}
                      >
                        <div
                          className={clsx(
                            `group-hover:${route.classes?.linkCircle} w-1 h-1 bg-muted-foreground rounded-full transition-colors`
                          )}
                        ></div>
                        <span className="font-mono font-thin text-sm">
                          {t(`pages.${route.id}`)}
                        </span>
                      </SoundHoverElement>
                    ))}
                </motion.ul>
              </WrapperHoverElement>
            </motion.nav>
            <div className="p-4 border-t border-muted-foreground/20">
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase">
                <span>
                  {t("login.status.title")}:{" "}
                  {user ? t("login.status.online") : t("login.status.offline")}
                </span>
                <span
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    user ? "bg-emerald-500" : "bg-red-500"
                  )}
                ></span>
              </div>
            </div>
            {isMdSize && (
              <div className="flex px-4 justify-between bg-card/70 items-center text-foreground/55">
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
    </>
  );
});

export default RevealNavMenu;

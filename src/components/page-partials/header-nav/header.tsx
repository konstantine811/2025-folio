import { memo, useEffect, useRef } from "react";
import { useHeaderSizeStore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import ToggleSound from "../page-setting/toggle-sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import LogoHomeNav from "./logo-home-nav";
import ThemeToggle from "../page-setting/theme-toggle/theme-toggle";
import { useTranslation } from "react-i18next";
import NavMenu from "./nav-menu";
import RevealNavMenu from "./reveal-nav-menu";
import { BreakPoints } from "@/config/adaptive.config";
import { useNavMenuStore } from "@/storage/navMenuStore";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizeStore((state) => state.setHeaderSize);
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const { t } = useTranslation();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isSmSize } = useIsAdoptive(BreakPoints.sm);
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      setHeaderSize(headerHeight);
    }
  }, [headerRef, setHeaderSize]);
  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 z-50 w-full md:px-12 px-6 left-0 right-0 bg-background/80 shadow-2xl shadow-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="flex items-center gap-3">
            <LogoHomeNav />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
                {t("cubic_worlds_game.portfolio.main_section.name")}
              </span>
              <span className="hidden md:block font-mono text-[10px] tracking-widest text-muted-foreground">
                WEB ARCHITECT
              </span>
            </div>
          </div>
          <div className="flex justify-end items-center font-mono text-xs text-muted-foreground">
            {!isMdSize && (
              <>
                <ThemeToggle />
                <LanguagePicker />
                <ToggleSound />
              </>
            )}

            <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-card/50 backdrop-blur-md border border-muted-foreground/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-300 shadow-2xl p-0 m-0 outline-0">
              <NavMenu />
            </div>
          </div>
        </div>
      </header>
      {isOpen && (
        <div
          id="nav-menu-overlay"
          onClick={() => setOpen(false)}
          className="fixed z-30 h-full bg-background/5 w-full translate-y-15 sm:translate-y-0 sm:min-w-80  backdrop-blur-xs border border-muted-foreground/20 rounded-sm shadow-[0_0_50px_-12px_rgba(0,0,0,1)] menu-enter"
        ></div>
      )}
      {isSmSize && <RevealNavMenu />}
    </>
  );
});

export default Header;

import NavMenu from "./nav-menu";
import { memo, useEffect, useRef } from "react";
import { useHeaderSizeStore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import ToggleSound from "../page-setting/toggle-sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import LogoHomeNav from "./logo-home-nav";
import ThemeToggle from "../page-setting/theme-toggle/theme-toggle";
import { useTranslation } from "react-i18next";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizeStore((state) => state.setHeaderSize);
  const { t } = useTranslation();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      setHeaderSize(headerHeight);
    }
  }, [headerRef, setHeaderSize]);
  return (
    <header
      ref={headerRef}
      className="fixed top-0 z-40 w-full container mx-auto left-0 right-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {!isMdSize && (
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
        )}
        <div className="flex justify-end items-center font-mono text-xs text-muted-foreground">
          <ThemeToggle />
          <LanguagePicker />
          <ToggleSound />
          {/* <NavMenu /> */}
        </div>
      </div>
    </header>
  );
});

export default Header;

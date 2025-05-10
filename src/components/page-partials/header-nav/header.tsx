import ColorPicker from "@components/page-partials/page-setting/color-picker/color-picker";
import NavMenu from "./nav-menu";
import { memo, useEffect, useRef } from "react";
import { useHeaderSizeStore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import HeaderBanner from "./header-banner";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizeStore((state) => state.setHeaderSize);
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      setHeaderSize(headerHeight);
    }
  }, [headerRef, setHeaderSize]);
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b backdrop-blur-md  bg-background"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 items-center">
        <NavMenu />
        <div className="text-fg/70 font-mono tracking-wide text-center hidden md:block">
          <HeaderBanner />
        </div>
        <div className="text-fg pr-4 items-center justify-end hidden md:flex">
          <LanguagePicker />
          <ColorPicker />
        </div>
      </div>
    </header>
  );
});

export default Header;

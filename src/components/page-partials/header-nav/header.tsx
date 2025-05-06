import ColorPicker from "@components/page-partials/page-setting/color-picker/color-picker";
import NavMenu from "./nav-menu";
import { memo, useEffect, useRef } from "react";
import { useHeaderSizetore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizetore((state) => state.setHeaderSize);
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
        <div className="text-fg text-center hidden md:block">
          <div>@ 2025 folio</div>
          <div>Abramkin Constantine</div>
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

import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import LogoHomeNav from "../header-nav/logo-home-nav";
import { useEffect, useRef } from "react";

const Footer = () => {
  const setFooterSize = useHeaderSizeStore((state) => state.setFooterSize);
  const footerRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = footerRef.current.getBoundingClientRect().height;
      setFooterSize(footerHeight);
    }
  }, [footerRef, setFooterSize]);
  return (
    <footer
      ref={footerRef}
      className="border-t border-foreground/10 bg-background"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-2 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <LogoHomeNav />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="hidden md:block font-mono text-[10px] tracking-widest text-muted-foreground">
                WEB ARCHITECT © 2025
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 font-mono text-xs text-muted-foreground">
          <a
            href="https://github.com/konstantine811?tab=repositories"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            GITHUB
          </a>
          <a
            href="https://www.facebook.com/constaine.abrams"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            FACEBOOK
          </a>
          <a
            href="https://www.linkedin.com/in/kostiantyn-abramkin-959584142/"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            LINKEDIN
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

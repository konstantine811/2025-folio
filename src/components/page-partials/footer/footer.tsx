import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useEffect, useRef, useState } from "react";
import {
  StatusWorkData,
  subscribeToStatusWork,
} from "@/services/firebase/statusWork";
import DialogContact from "../pages/portfolio/DialogContact/DialogContact";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const setFooterSize = useHeaderSizeStore((state) => state.setFooterSize);
  const footerRef = useRef<HTMLDivElement>(null!);
  const [t] = useTranslation();
  const [statusWork, setStatusWork] = useState<StatusWorkData | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = footerRef.current.getBoundingClientRect().height;
      setFooterSize(footerHeight);
    }
  }, [footerRef, setFooterSize]);

  useEffect(() => {
    const unsubscribe = subscribeToStatusWork((data) => {
      setStatusWork(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="border-t border-foreground/10 bg-background relative z-50 px-6 md:px-12 py-2"
    >
      <div className="container mx-auto  flex justify-between items-center gap-8">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase mb-4 block text-zinc-500">
            Status:{" "}
            {statusWork?.status_work
              ? t("portfolio.status_work.busy")
              : t("portfolio.status_work.available")}
          </span>
          <button
            onClick={() => setIsContactOpen(true)}
            className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground hover:text-muted-foreground transition-colors text-left uppercase cursor-pointer"
          >
            LET'S TALK
          </button>
          <DialogContact open={isContactOpen} onOpenChange={setIsContactOpen} />
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

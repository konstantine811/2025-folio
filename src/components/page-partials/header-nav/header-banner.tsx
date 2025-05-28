import { TextEffect } from "@/components/ui/text-effect";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

const HeaderBanner = () => {
  const location = useLocation();
  const [pathName, setPathName] = useState(location.pathname.split("/")[1]);
  const [t] = useTranslation();
  useEffect(() => {
    setPathName(location.pathname.split("/")[1]);
  }, [location.pathname]);
  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-mono">@ 2025 abc-folio</h3>
      {pathName && (
        <TextEffect as="h4" key={pathName} per="char" preset="slide">
          {t(`pages.${pathName}`) || pathName}
        </TextEffect>
      )}
    </div>
  );
};

export default HeaderBanner;

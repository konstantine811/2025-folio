import { useTranslation } from "react-i18next";

const LabsHeader = () => {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            {t("labs.system_status")}
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight text-foreground uppercase">
          {t("labs.title")}
        </h1>
      </div>
      <div className="max-w-md text-right">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed uppercase">
          {t("labs.system_status_description")} <br />
          <span className="text-white">
            {t("labs.system_status_description_bold")}
          </span>
        </p>
      </div>
    </header>
  );
};

export default LabsHeader;

import { useTranslation } from "react-i18next";

const ChartTitle = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return <h4 className="text-xl text-foreground/80 text-center">{t(title)}</h4>;
};

export default ChartTitle;

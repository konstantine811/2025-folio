import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const hs = useHeaderSizeStore((s) => s.size);
  return (
    <div style={{ minHeight: `calc(100vh - ${hs}px)` }}>
      <h1 className="text-foreground text-2xl">{t("welcome")}</h1>
      <p className="text-foreground">{t("hello_user", { name: "Ivan" })}</p>
    </div>
  );
};

export default Home;

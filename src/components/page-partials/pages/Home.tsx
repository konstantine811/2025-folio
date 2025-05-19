import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-foreground text-2xl">{t("welcome")}</h1>
      <p className="text-foreground">{t("hello_user", { name: "Ivan" })}</p>
    </>
  );
};

export default Home;

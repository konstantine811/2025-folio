import { useTransform } from "framer-motion";
import { useProgressMV } from "../../hooks/useProgressMV";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ScrollProgressContent = () => {
  const { t, i18n, ready } = useTranslation();

  const p = useProgressMV();

  // інфопанель з’являється від 0.30 до 0.45
  const infoOpacity = useTransform(p, [0.0, 0.15], [1, 0]);
  const infoY = useTransform(p, [0.0, 0.25], [-24, 0]);

  // уникни миготіння під час підвантаження перекладів
  if (!ready) return null;
  return (
    <div className="pointer-events-none fixed inset-0 grid place-items-center container mx-auto">
      <motion.div
        style={{ opacity: infoOpacity, y: infoY }}
        className="absolute bottom-12 w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.5, duration: 1.5 }}
        key={`info-${i18n.language}`}
      >
        <p className="text-sm text-foreground/70">
          {t("cubic_worlds_game.portfolio.main_section.scroll_down_text")}
        </p>
      </motion.div>
    </div>
  );
};

export default ScrollProgressContent;

import { Trans, useTranslation } from "react-i18next";
import { motion, useTransform } from "framer-motion";
import TypingText from "@/components/ui/shadcn-io/typing-text";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useEffect } from "react";
import { keyboardTypingSound } from "@/config/sounds";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";

const FirstSection = () => {
  const { t, i18n } = useTranslation();
  const p = useProgressMV();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0.0, 0, 0.05];
  const dskSkcale = [0, 140];
  let infoOpacity = dskOpacity;
  let infoSale = dskSkcale;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0.0, 0, 0.05];
    infoSale = [0, 140];
  } else if (isMdSize) {
    infoOpacity = [0.0, 0, 0.05];
    infoSale = [0, 40];
  } else {
    infoOpacity = dskOpacity;
    infoSale = dskSkcale;
  }
  // fade-out заголовка від 0.1 до 0.25 прогресу
  const titleOpacity = useTransform(p, infoOpacity, [1, 1, 0]);
  const titleY = useTransform(p, [0.0, 0.05], infoSale);

  useEffect(() => {
    keyboardTypingSound.play();
    setTimeout(() => {
      keyboardTypingSound.stop();
    }, 3000);
  }, [t]);
  return (
    <div className="flex flex-col grow gap-4 md:gap-10">
      <div className="flex grow flex-col justify-between  gap-4 md:gap-10 px-5 lg:px-20 border-t-1 border-muted-foreground/30 lg:mt-30 lg:pt-20">
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-center text-foreground/90 w-full lg:max-w-1/2 mx-auto"
        >
          <h1 className="text-2xl lg:text-5xl uppercase">
            <TypingText
              key={`name-${i18n.language}`}
              text={[t("cubic_worlds_game.portfolio.main_section.name")]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorClassName="h-12"
              variableSpeed={{ min: 50, max: 120 }}
            />
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            className="flex items-center lg:items-end justify-center text-xl text-foreground/60"
          >
            <h3>
              {t("cubic_worlds_game.portfolio.main_section.role.1")}/
              {t("cubic_worlds_game.portfolio.main_section.role.2")}
            </h3>
          </motion.div>
        </motion.div>
        <div className="font-pixel text-center mb-40">
          <motion.div
            className="text-md lg:text-lg text-foreground/70 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              bounce: 0.2,
              duration: 3,
              delay: 2.05,
            }}
          >
            <Trans
              i18nKey="cubic_worlds_game.portfolio.main_section.subtitle"
              key={`subtitle-${i18n.language}`}
              components={{
                b: <strong className="text-accent font-semibold" />,
                mono: <span className="text-yellow-300" />,
                em: <em className="italic uppercase" />,
                tech: (
                  <span className="px-1 rounded bg-muted-foreground text-background font-mono" />
                ),
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FirstSection;

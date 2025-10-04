import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, useTransform, motion } from "framer-motion";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";

const KernelSection = () => {
  const { t, i18n } = useTranslation();
  const pRaw = useProgressMV();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });

  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0.55, 0.66, 0.67, 0.7];
  const dskScale = [-500, -1000];
  let infoScale = dskScale;
  let infoOpacity = dskOpacity;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0.55, 0.66, 0.67, 0.7];
    infoScale = [-200, -500];
  } else if (isMdSize) {
    infoOpacity = [0.5, 0.6, 0.7, 0.9];
    infoScale = [-0, -500];
  } else {
    infoOpacity = dskOpacity;
    infoScale = dskScale;
  }
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(p, infoOpacity, [0, 1, 1, 0]);
  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0.55, 0.65], infoScale);
  return (
    <motion.div
      className="flex flex-col justify-between gap-4 md:gap-10"
      style={{ y: infoSkillY }}
    >
      <div className="flex flex-col  gap-4 md:gap-10 px-5 md:px-10 lg:px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
        <div className="text-3xl uppercase">
          <h2>{t("cubic_worlds_game.portfolio.experience.title")}:</h2>
        </div>
        <motion.div style={{ opacity: infoSkillOpacity }}>
          <div className="flex gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
            <div className="lg:w-3/4 flex flex-col gap-10">
              <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                Kernel
              </span>
              <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.experience.kernel"
                    key={`3d-${i18n.language}`}
                    components={{
                      h5: <h5 className="font-pixel text-lg lg:text-2xl" />,
                      ul: <ul className="list-disc pl-5" />,
                      li: <li className="font-pixel" />,
                      em: <em className="text-accent font-bold" />,
                      side_line: <span className="border-l-2 pl-5 text-xs" />,
                      strong: (
                        <strong className="px-1 rounded bg-muted-foreground text-background" />
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KernelSection;

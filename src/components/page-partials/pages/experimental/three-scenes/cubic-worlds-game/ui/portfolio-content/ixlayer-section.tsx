import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, useTransform, motion } from "framer-motion";
import StackLayers from "./ixlayer-logo";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";

const IxlayerSection = () => {
  const { i18n } = useTranslation();
  const pRaw = useProgressMV();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0.78, 0.79, 0.81, 0.83];
  const dskScale = [-100, -300];
  let infoScale = dskScale;
  let infoOpacity = dskOpacity;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0.76, 0.79, 0.9, 1];
    infoScale = [-10, -100];
  } else if (isMdSize) {
    infoOpacity = [0.74, 0.78, 0.82, 0.9];
    infoScale = [0, 0];
  } else {
    infoOpacity = dskOpacity;
    infoScale = dskScale;
  }
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(p, infoOpacity, [0, 1, 1, 0]);
  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0.55, 0.75], infoScale);

  const dskComputoolsOpacity = [0.8, 0.81, 0.87, 0.88];
  const dskComputoolsScale = [-200, -400];
  let infoComputoolsScale = dskComputoolsScale;
  let infoComputoolsOpacity = dskComputoolsOpacity;
  if (isLargeSize && !isMdSize) {
    infoComputoolsOpacity = [0.78, 0.8, 0.87, 0.88];
    infoComputoolsScale = [-20, -100];
  } else if (isMdSize) {
    infoComputoolsOpacity = [0.78, 0.79, 0.87, 0.88];
    infoComputoolsScale = [0, 0];
  } else {
    infoComputoolsOpacity = dskComputoolsOpacity;
    infoComputoolsScale = dskComputoolsScale;
  }
  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoComputoolsSkillY = useTransform(p, [0.8, 0.8], infoComputoolsScale);

  const infoComputoolsSkillOpacity = useTransform(
    p,
    infoComputoolsOpacity,
    [0, 1, 1, 0]
  );

  return (
    <>
      <motion.div
        className="flex flex-col justify-between gap-4 md:gap-10"
        style={{ y: infoSkillY }}
      >
        <div className="flex flex-col  gap-4 md:gap-10 px-5 md:px-10 lg:px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
          <motion.div style={{ opacity: infoSkillOpacity }}>
            <div className="flex gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
              <div className="lg:w-3/4 flex flex-col gap-10">
                <div className="flex items-center">
                  <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                    ixLayer
                  </span>
                  <StackLayers
                    amplitude={1.08}
                    speedSec={1.8}
                    layerDelay={0.08}
                  />
                </div>
                <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <Trans
                      i18nKey="cubic_worlds_game.portfolio.experience.ixlayer"
                      key={`3d-${i18n.language}`}
                      components={{
                        h5: <h5 className="font-pixel text-xl lg:text-2xl" />,
                        em: <em className="text-accent font-bold" />,
                        ul: <ul className="list-disc pl-5" />,
                        li: <li className="font-pixel" />,
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

      {/* compotools */}
      <motion.div
        className="flex flex-col justify-between gap-4 md:gap-10"
        style={{ y: infoComputoolsSkillY }}
      >
        <div className="flex flex-col  gap-4 md:gap-10 px-5 md:px-10 lg:px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
          <motion.div style={{ opacity: infoComputoolsSkillOpacity }}>
            <div className="flex gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
              <div className="lg:w-3/4 flex flex-col gap-10">
                <div className="flex items-center">
                  <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                    Computools
                  </span>
                </div>
                <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <Trans
                      i18nKey="cubic_worlds_game.portfolio.experience.computools"
                      key={`3d-${i18n.language}`}
                      components={{
                        h5: <h5 className="font-pixel text-2xl" />,
                        em: <em className="text-accent font-bold" />,
                        ul: <ul className="list-disc pl-5" />,
                        li: <li className="font-pixel" />,
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
    </>
  );
};

export default IxlayerSection;

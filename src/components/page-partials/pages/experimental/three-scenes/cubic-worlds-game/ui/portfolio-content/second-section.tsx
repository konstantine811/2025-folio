import { Trans, useTranslation } from "react-i18next";
import { motion, useSpring, useTransform } from "framer-motion";
import { useProgressMV } from "../../hooks/useProgressMV";
import { RoutPath } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";

const SecondSection = () => {
  const { t, i18n } = useTranslation();
  const pRaw = useProgressMV();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0, 0.13, 0.18, 0.21, 0.23];
  let infoOpacity = dskOpacity;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0, 0.08, 0.12, 0.2, 0.22];
  } else if (isMdSize) {
    infoOpacity = [0, 0.015, 0.04, 0.22, 0.24];
  } else {
    infoOpacity = dskOpacity;
  }
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });

  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1

  const infoSkillOpacity = useTransform(p, infoOpacity, [0, 0, 1, 1, 0]);

  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0, 0.18, 0.2, 0.22], [24, 1, -80, -220]);

  const navigateTo = useTransitionRouteTo();
  return (
    <motion.div
      className="flex flex-col justify-between gap-4 md:gap-10"
      style={{ y: infoSkillY }}
    >
      <div className="flex flex-col  gap-4 md:gap-10 px-5 lg:px-20 border-t-1 border-muted-foreground/30 lg:mt-30 lg:pt-20">
        <div className="text-3xl uppercase">
          <h2>{t("cubic_worlds_game.portfolio.skills_section.title")}</h2>
        </div>
        <motion.div style={{ opacity: infoSkillOpacity }}>
          <div className="flex flex-wrap lg:flex-nowrap gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
            <div className="lg:w-3/4 flex flex-col gap-10">
              <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                3D Modeling: Blender
              </span>
              <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.skills_section.3d"
                    key={`3d-${i18n.language}`}
                    components={{
                      p: <p className="font-pixel" />,
                      em: <em className="text-accent font-bold" />,
                      strong: (
                        <strong className="px-1 rounded bg-muted-foreground text-background" />
                      ),
                      a: (
                        <span
                          className="text-accent underline cursor-pointer"
                          onClick={() => {
                            navigateTo(RoutPath.BLOG);
                          }}
                        />
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <img
                className="border-4 h-full border-background object-cover"
                src="/images/portfolio/blender_skill_drivers_rig.gif"
                alt="Blender skill: drivers rig"
                loading="lazy"
                decoding="async"
              />
              <img
                className="border-4 h-full border-background object-cover"
                src="/images/portfolio/blender_skill_scatter_grass.gif"
                alt="Blender skill: scatter grass"
                loading="lazy"
                decoding="async"
              />
              <img
                className="border-4 h-full border-background object-cover"
                src="/images/portfolio/blender_skill_rig_animation.gif"
                alt="Blender skill: rig animation"
                loading="lazy"
                decoding="async"
              />
              <img
                className="border-4 h-full border-background object-cover"
                src="/images/portfolio/blender_skill_modelling_robot.gif"
                alt="Blender skill: modelling robot"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecondSection;

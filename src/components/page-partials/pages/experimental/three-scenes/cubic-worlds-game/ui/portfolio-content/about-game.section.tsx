import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, useTransform, motion } from "framer-motion";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";
import { RoutPath } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";

const AboutGameSection = () => {
  const { t, i18n } = useTranslation();
  const pRaw = useProgressMV();
  const navigateTo = useTransitionRouteTo();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0.8, 0.85, 0.97, 1];
  const dskScale = [-100, -500];
  let infoScale = dskScale;
  let infoOpacity = dskOpacity;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0.4, 0.65, 0.97, 1];
    infoScale = [0, 0];
  } else if (isMdSize) {
    infoOpacity = [0.8, 0.85, 0.97, 0.99];
    infoScale = [0, 0];
  } else {
    infoOpacity = dskOpacity;
  }
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(p, infoOpacity, [0, 1, 1, 0]);
  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0.55, 0.75], infoScale);

  return (
    <motion.div
      className="flex flex-col justify-between gap-4 md:gap-10"
      style={{ y: infoSkillY }}
    >
      <div className="flex flex-col  gap-4 md:gap-10 px-5 md:px-10 lg:px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
        <motion.div style={{ opacity: infoSkillOpacity }}>
          <div className="flex flex-wrap lg:flex-nowrap gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
            <div className="lg:w-3/4 flex flex-col gap-10">
              <div className="flex items-center">
                <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                  Cubic Worlds Game
                </span>
              </div>
              <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.experience.about_game"
                    key={`3d-${i18n.language}`}
                    components={{
                      h5: <h5 className="font-pixel text-2xl" />,
                      em: <em className="text-accent font-bold" />,
                      ul: <ul className="list-disc pl-5" />,
                      li: <li className="font-pixel" />,
                      a: (
                        <span
                          className="text-accent underline cursor-pointer"
                          onClick={() => {
                            navigateTo(RoutPath.EXPERIMENTAL_CUBIC_WORLDS_GAME);
                          }}
                        />
                      ),
                      strong: (
                        <strong className="px-1 rounded bg-muted-foreground text-background" />
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-2xl font-pixel text-foreground/80 mb-2 lg:mb-3">
                {t(
                  "cubic_worlds_game.portfolio.experience.cubic_worlds_game.title"
                )}
              </h4>
              <div className="grid xl:grid-cols-2 gap-4 grow">
                <div>
                  <h5 className="text-lg font-pixel text-foreground/80 mb-2 lg:mb-3">
                    {t(
                      "cubic_worlds_game.portfolio.experience.cubic_worlds_game.scatter_draw"
                    )}
                    :
                  </h5>
                  <img
                    className="border-4 w-full border-background object-cover"
                    src="/images/portfolio/cubic_worlds_scatter_draw.gif"
                    alt="Cubic Worlds Game: Scatter Draw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h5 className="text-lg font-pixel text-foreground/80 mb-2 lg:mb-3">
                    {t(
                      "cubic_worlds_game.portfolio.experience.cubic_worlds_game.single_draw"
                    )}
                    :
                  </h5>
                  <img
                    className="border-4 w-full border-background object-cover"
                    src="/images/portfolio/cubic_worlds_single_draw.gif"
                    alt="Cubic Worlds Game: Single Draw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h5 className="text-lg font-pixel text-foreground/80 mb-2 lg:mb-3">
                    {t(
                      "cubic_worlds_game.portfolio.experience.cubic_worlds_game.edit"
                    )}
                    :
                  </h5>
                  <img
                    className="border-4 w-full border-background object-cover"
                    src="/images/portfolio/cubic_worlds_edit.gif"
                    alt="Cubic Worlds Game: Single Draw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h5 className="text-lg font-pixel text-foreground/80 mb-2 lg:mb-3">
                    {t(
                      "cubic_worlds_game.portfolio.experience.cubic_worlds_game.physcis"
                    )}
                    :
                  </h5>
                  <img
                    className="border-4 w-full border-background object-cover"
                    src="/images/portfolio/cubic_worlds_add_physics.gif"
                    alt="Cubic Worlds Game: Add Physics"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h5 className="text-lg font-pixel text-foreground/80 mb-2 lg:mb-3">
                    {t(
                      "cubic_worlds_game.portfolio.experience.cubic_worlds_game.explore"
                    )}
                    :
                  </h5>
                  <img
                    className="border-4 w-full border-background object-cover"
                    src="/images/portfolio/cubic_worlds_explore.gif"
                    alt="Cubic Worlds Game: Explore"
                    loading="lazy"
                    decoding="async"
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

export default AboutGameSection;

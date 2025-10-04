import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement } from "@/types/sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { BreakPoints } from "@/config/adaptive.config";

const EighthSection = () => {
  const { t, i18n } = useTranslation();
  const pRaw = useProgressMV();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const { isAdoptiveSize: isLargeSize } = useIsAdoptive(BreakPoints.lg);
  const dskOpacity = [0.45, 0.6, 0.61, 0.65];
  const dskScale = [-500, -1000];
  let infoScale = dskScale;
  let infoOpacity = dskOpacity;
  if (isLargeSize && !isMdSize) {
    infoOpacity = [0.45, 0.6, 0.61, 0.65];
    infoScale = [-200, -500];
  } else if (isMdSize) {
    infoOpacity = [0.45, 0.55, 0.65, 0.73];
    infoScale = [-0, -500];
  } else {
    infoOpacity = dskOpacity;
  }
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(p, infoOpacity, [0, 1, 1, 0]);

  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0.5, 0.65], infoScale);
  return (
    <motion.div
      className="flex flex-col justify-between gap-4 md:gap-10"
      style={{ y: infoSkillY }}
    >
      <div className="flex flex-col  gap-4 md:gap-10 px-5 md:px-10 lg:px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
        <motion.div style={{ opacity: infoSkillOpacity }}>
          <div className="flex flex-wrap lg:flex-nowrap gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
            <div className="lg:w-3/4 flex flex-col lg:gap-10 ">
              <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                Maps
              </span>
              <div className="text-foreground/70 text-md lg:text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.skills_section.map"
                    key={`3d-${i18n.language}`}
                    components={{
                      p: <p className="font-pixel" />,
                      em: <em className="text-accent font-bold" />,
                      strong: (
                        <strong className="px-1 rounded bg-muted-foreground text-background" />
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-pixel text-foreground/80 mb-2 lg:mb-10">
                {t(
                  "cubic_worlds_game.portfolio.skills_section.map_content.title"
                )}
                :
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
                <div>
                  <h5>
                    {t(
                      "cubic_worlds_game.portfolio.skills_section.map_content.population_project"
                    )}
                  </h5>
                  <a
                    target="_blank"
                    href="https://abram-exp.vercel.app/three-map"
                  >
                    <SoundHoverElement
                      hoverAnimType="scale"
                      animValue={0.95}
                      hoverStyleElement={HoverStyleElement.none}
                      className="lg:h-full lg:w-full"
                    >
                      <img
                        className="border-4 h-full w-full border-background object-cover"
                        src="/images/portfolio/map_population.gif"
                        alt="Map Population"
                        loading="lazy"
                        decoding="async"
                      />
                    </SoundHoverElement>
                  </a>
                </div>
                <div>
                  <h5>
                    {t(
                      "cubic_worlds_game.portfolio.skills_section.map_content.3d_buildings_project"
                    )}
                  </h5>
                  <a
                    target="_blank"
                    href="https://hillel-shop-map.vercel.app/map"
                  >
                    <SoundHoverElement
                      hoverAnimType="scale"
                      animValue={0.95}
                      hoverStyleElement={HoverStyleElement.none}
                      className="lg:h-full lg:w-full"
                    >
                      <img
                        className="border-4 h-full w-full border-background object-cover"
                        src="/images/portfolio/map_3d_buildings.gif"
                        alt="Map 3D Buildings"
                        loading="lazy"
                        decoding="async"
                      />
                    </SoundHoverElement>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EighthSection;

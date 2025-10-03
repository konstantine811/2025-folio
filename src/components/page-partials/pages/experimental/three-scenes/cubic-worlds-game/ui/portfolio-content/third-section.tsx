import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { RoutPath } from "@/config/router-config";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement } from "@/types/sound";

const ThirdSection = () => {
  const { t, i18n } = useTranslation();
  const pRaw = useProgressMV();
  const navigateTo = useTransitionRouteTo();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(
    p,
    [0, 0.18, 0.2, 0.28],
    [0, 0, 1, 0.7]
  );

  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0, 0.18, 0.2, 0.24], [24, 0, -80, -320]);
  return (
    <motion.div
      className="flex flex-col justify-between gap-4 md:gap-10"
      style={{ y: infoSkillY }}
    >
      <div className="flex flex-col  gap-4 md:gap-10 px-20 border-t-1 border-muted-foreground/30 mt-30 pt-20">
        <motion.div style={{ opacity: infoSkillOpacity }}>
          <div className="flex gap-10 bg-background/80 backdrop-blur-3xl rounded-sm p-5">
            <div className="w-3/4 flex flex-col gap-10 ">
              <span className="font-pixel w-fit inline-block bg-background border-1 border-muted-foreground/80 rounded-xl px-4 py-2 text-foreground/70">
                Three.js & React Three Fiber
              </span>
              <div className="text-foreground/70 text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.skills_section.three_js"
                    key={`3d-${i18n.language}`}
                    components={{
                      p: <p className="font-pixel" />,
                      em: <em className="text-accent font-bold" />,
                      a_simon: (
                        <a
                          className="text-accent underline"
                          href="https://threejs-journey.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Simon Bruno
                        </a>
                      ),
                      a_sensei: (
                        <a
                          className="text-accent underline"
                          href="https://wawasensei.dev/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WawaSensei
                        </a>
                      ),
                      a: (
                        <span
                          className="text-accent underline cursor-pointer"
                          onClick={() => {
                            navigateTo(RoutPath.EXPERIMENTAL);
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
            <div>
              <h4 className="text-xl font-pixel text-foreground/80 mb-10">
                {t(
                  "cubic_worlds_game.portfolio.skills_section.three_js_examples"
                )}
                :
              </h4>
              <div className="grid grid-cols-2">
                <a
                  target="_blank"
                  href="https://devabramc.vercel.app/uk/three-train/traine-scene/earth-particle"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                    className="h-full w-full"
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_particles.gif"
                      alt="Three.js skill: particles"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>

                <a
                  target="_blank"
                  href="https://devabramc.vercel.app/uk/three-train/traine-scene/character-controller"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_game_grass.gif"
                      alt="Three.js skill: game grass"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>
                <a
                  target="_blank"
                  href="https://devabramc.vercel.app/uk/three-train/traine-scene/earth"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_earth.gif"
                      alt="Three.js skill: earth"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>
                <a
                  target="_blank"
                  href="https://devabramc.vercel.app/uk/three-train/traine-scene/hacker-game"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_fly_game.gif"
                      alt="Three.js skill: simple character controller"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>
                <a
                  target="_blank"
                  href="https://next-it-brama.vercel.app/three-scenes/personal-game"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_simple_game.gif"
                      alt="Three.js skill: simple game character controller"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>
                <a
                  target="_blank"
                  href="https://react3d-ab-portfolio.vercel.app/three/second-scene"
                >
                  <SoundHoverElement
                    hoverAnimType="scale"
                    animValue={0.95}
                    hoverStyleElement={HoverStyleElement.none}
                  >
                    <img
                      className="border-4 h-full w-full border-background object-cover"
                      src="/images/portfolio/three_js_wave.gif"
                      alt="Three.js skill: wave shader"
                      loading="lazy"
                      decoding="async"
                    />
                  </SoundHoverElement>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThirdSection;

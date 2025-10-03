import { Trans, useTranslation } from "react-i18next";
import { useProgressMV } from "../../hooks/useProgressMV";
import { useSpring, motion, useTransform } from "framer-motion";

const FourthSection = () => {
  const { i18n } = useTranslation();
  const pRaw = useProgressMV();
  // 1) Згладжуємо прогрес, щоб не смикалося на межах
  const p = useSpring(pRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  // 2) Розширюємо та «плато» після появи — opacity не падає назад у 0
  //    0..0.08 -> 0; 0.08..0.18 -> 0->1; 0.18..1 -> тримаємо 1
  const infoSkillOpacity = useTransform(p, [0, 0.28, 0.3, 0.34], [0, 0, 1, 0]);

  // 3) Трансформа по Y — плавна, без різких стрибків
  const infoSkillY = useTransform(p, [0.26, 0.34], [-300, -500]);
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
                Data: Node.js, DataBase, Storage
              </span>
              <div className="text-foreground/70 text-xl font-pixel flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <Trans
                    i18nKey="cubic_worlds_game.portfolio.skills_section.backend_data"
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
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FourthSection;

import { PositionalAudio } from "@react-three/drei";

const sfxs = [
  "/sound/wizard-game/buildup.mp3",
  "/sound/wizard-game/blast.mp3",
  "/sound/wizard-game/gravity.mp3",
  "/sound/wizard-game/fire.mp3",
  "/sound/wizard-game/freeze.mp3",
];

const PreloaderAudio = () => {
  return (
    <>
      {sfxs.map((src) => (
        <PositionalAudio key={src} url={src} autoplay={false} />
      ))}
    </>
  );
};

export default PreloaderAudio;

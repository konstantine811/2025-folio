import "../shaders/winder-shader";
import "../shaders/grass-gradient-shader-2";
// import GlibliInfiniteGrass from "./glibli-infinite-grass";
import { useGameDataStore } from "../physic-world/character-controller/stores/game-data-store";
// import { useTexture } from "@react-three/drei";
import { InfiniteGrass } from "./3d-grass";
import { Vector2 } from "three";

const GrassWrapper = () => {
  const groundRef = useGameDataStore((s) => s.groundMesh);
  // const texture = useTexture("/images/textures/grassHeightMap.png");
  // const noiseTexture = useTexture("/images/textures/noiseTexture.png");
  // const grassTexture = useTexture("/images/textures/grassTexture.jpg");

  return (
    <>
      {/* {groundRef && (
        <GlibliInfiniteGrass
          landscapeMesh={groundRef}
          textures={{
            heightMap: grassTexture,
            noise: noiseTexture,
            diffuse: grassTexture,
          }}
        />
      )} */}
      <InfiniteGrass
        radius={1}
        tileSize={30}
        density={30} // 15 лез/м^2 ≈ 540 лез/тайл
        seed={10}
        materialProps={{
          _fallbackEdgeWidth: 10.5, // 0..0.5
          _fallbackEdgeDark: 2.01, // мін. яскравість краю
          uWindAmp: 0.2,
          uWindFreq: 1.2,
          uWindDir: new Vector2(10.85, 10.2).normalize(),
          windDirNoiseScale: 1.05, // масштаб шуму напряму
          windStrNoiseScale: 1.25, // масштаб шуму сили
          gustStrength: 1.25, // поривчастість (shape)
          noiseScrollDir: 1.05, // “дрейф” карти вітру
        }}
        // yAt={(x, z) => 0} // Сюди можна підставити висоту терену, якщо є.
      />
      {/* <GrassPainter
        modelUrl="/3d-models/cubic-worlds-model/grass.glb"
        meshName="GrassBlade" // якщо треба
        tileSize={0.3}
        baseDensity={3}
        initialRadiusTiles={1}
        fixedSeed={null} // null → seed випадковий
        yAt={(x, z) => 0} // або твоя функція висоти
      /> */}
      {/* <GrassPatch
        numX={48}
        numZ={48}
        patchSize={10}
        jitter={0.25}
        bladeHeight={0.9}
        bladeWidth={0.07}
        segments={6}
        windAmp={0.07}
        windFreq={1.3}
        windDir={new Vector2(0.9, 0.25).normalize()}
      /> */}
    </>
  );
};

export default GrassWrapper;

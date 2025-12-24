import { Environment, Scroll } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";

const Experience = ({
  showIndexModel = 0,
  pathModel = "/3d-models/models.glb",
}: {
  showIndexModel: number;
  pathModel?: string;
}) => {
  return (
    <>
      <Environment preset="sunset" />
      <color attach="background" args={["#151515"]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <Scroll>
        <ParticleMorphing
          showIndexModel={showIndexModel}
          pathModel={pathModel}
        />
      </Scroll>
    </>
  );
};

export default Experience;

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Group, MathUtils } from "three";
import PortfolioProject from "./portfolio-project";
import { degToRad } from "three/src/math/MathUtils.js";
import { Environment, MeshReflectorMaterial } from "@react-three/drei";

const projects = [
  "/images/three-views-scene/projects/0.jpg",
  "/images/three-views-scene/projects/1.jpg",
  "/images/three-views-scene/projects/2.jpg",
  "/images/three-views-scene/projects/3.jpg",
  "/images/three-views-scene/projects/4.jpg",
  "/images/three-views-scene/projects/5.jpg",
  "/images/three-views-scene/projects/6.jpg",
];

const SLIDING_SPEED = 2;

const Portfolio3D = () => {
  const groupRef = useRef<Group>(null!);
  const [currentProject, setCurrentProject] = useState(0);

  useFrame((_, delta) => {
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x,
      -currentProject * 1.2,
      delta * SLIDING_SPEED
    );
    groupRef.current.position.z = MathUtils.lerp(
      groupRef.current.position.z,
      currentProject * 1.2,
      delta * SLIDING_SPEED
    );
  });
  return (
    <>
      <color attach={"background"} args={["#191920"]} />
      <fog attach={"fog"} args={["#191920", 0, 15]} />
      <group position-z={-3}>
        <group ref={groupRef}>
          {projects.map((image, index) => {
            return (
              <PortfolioProject
                image={image}
                key={index}
                props={{
                  onClick: () => setCurrentProject(index),
                  position: [index * 1.2, 0, -index * 1.2],
                }}
              />
            );
          })}
        </group>
      </group>
      <mesh rotation-x={degToRad(-90)} position-y={-0.4}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={0.6}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#050505"
          metalness={0.5}
        />
      </mesh>
      <Environment preset="sunset" />
    </>
  );
};

export default Portfolio3D;

import { Environment, Scroll, useScroll } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";

const Experience = ({
  pathModel = "/3d-models/models.glb",
}: {
  pathModel?: string;
}) => {
  const data = useScroll();
  const [showIndexModel, setShowIndexModel] = useState(0);
  const lastIndexRef = useRef(0);

  useFrame(() => {
    // Calculate current section index based on scroll offset (0-1) for 4 pages
    // 0-0.25 = section 0, 0.25-0.5 = section 1, 0.5-0.75 = section 2, 0.75-1.0 = section 3
    const newIndex = Math.min(3, Math.floor(data.offset * 4));

    // Only update state if index actually changed to avoid unnecessary re-renders
    if (newIndex !== lastIndexRef.current) {
      lastIndexRef.current = newIndex;
      setShowIndexModel(newIndex);
    }
  });

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

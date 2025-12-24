import { Environment, useScroll } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";
import { Group } from "three";

const Experience = ({
  pathModel = "/3d-models/models.glb",
}: {
  pathModel?: string;
}) => {
  const data = useScroll();
  const [showIndexModel, setShowIndexModel] = useState(0);
  const lastIndexRef = useRef(0);
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    // Calculate current section index based on scroll offset (0-1) for 4 pages
    // 0-0.25 = section 0, 0.25-0.5 = section 1, 0.5-0.75 = section 2, 0.75-1.0 = section 3
    const newIndex = Math.min(3, Math.floor(data.offset * 4));

    // Only update state if index actually changed to avoid unnecessary re-renders
    if (newIndex !== lastIndexRef.current) {
      lastIndexRef.current = newIndex;
      setShowIndexModel(newIndex);
    }

    // Animate Y position based on scroll progress (from top to bottom)
    // Scroll offset 0 = top position, 1 = bottom position
    // Adjust the range (e.g., -5 to 5) based on your scene scale
    if (groupRef.current) {
      const scrollProgress = data.offset; // 0 to 1
      const verticalRange = 10; // Total vertical movement range
      const startY = -verticalRange / 2; // Start position (top)
      const endY = verticalRange / 2; // End position (bottom)
      groupRef.current.position.y = startY + (endY - startY) * scrollProgress;
    }
  });

  return (
    <>
      <Environment preset="sunset" />
      <color attach="background" args={["#151515"]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <group ref={groupRef}>
        <ParticleMorphing
          showIndexModel={showIndexModel}
          pathModel={pathModel}
        />
      </group>
    </>
  );
};

export default Experience;

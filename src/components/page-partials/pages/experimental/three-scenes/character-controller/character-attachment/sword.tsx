import { useGLTF } from "@react-three/drei";
import { SlashTrail } from "./sword-slash";
import { Object3D } from "three";
import { useRef, useState } from "react";
export const Sword = ({ modelPath }: { modelPath: string }) => {
  const { scene } = useGLTF(modelPath, true);
  return (
    <>
      <primitive object={scene} />
      {/* <SlashTrail /> */}
    </>
  );
};

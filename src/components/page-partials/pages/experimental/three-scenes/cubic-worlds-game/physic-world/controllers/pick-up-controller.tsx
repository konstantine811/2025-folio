// PickUpController.tsx
import { useEffect, useState } from "react";
import { Bone, Euler, Quaternion } from "three";
import { useFrame } from "@react-three/fiber";
import { useGameDataStore } from "./stores/game-data-store";
import { useControls } from "leva";

export default function PickUpController() {
  const [rightArm, setRightArm] = useState<Bone | null>(null);
  const [leftArm, setLeftArm] = useState<Bone | null>(null);

  const { characterAnim } = useGameDataStore();
  const { rightArmC, leftArmC, isControl } = useControls("pick", {
    isControl: { value: false },
    rightArmC: [0, 0, -1.33],
    leftArmC: [0, 0, 1.33],
  });
  useEffect(() => {
    if (characterAnim) {
      const { group } = characterAnim;

      const rightArm = group.getObjectByName("mixamorigRightArm") as Bone;
      const leftArm = group.getObjectByName("mixamorigLeftArm") as Bone;
      setRightArm(rightArm);

      setLeftArm(leftArm);
    }
  }, [characterAnim]);

  useFrame(() => {
    if (characterAnim && isControl) {
      if (rightArm) {
        const targetQ = new Quaternion().setFromEuler(
          new Euler(rightArmC[0], rightArmC[1], rightArmC[2])
        );
        rightArm.quaternion.set(targetQ.x, targetQ.y, targetQ.z, targetQ.w);
      }

      if (leftArm) {
        const targetQ = new Quaternion().setFromEuler(
          new Euler(leftArmC[0], leftArmC[1], leftArmC[2])
        );
        leftArm.quaternion.set(targetQ.x, targetQ.y, targetQ.z, targetQ.w);
      }
    }
  });

  return null;
}

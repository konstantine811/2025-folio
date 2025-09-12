import useTouchTexture from "@/hooks/three-world/useTouchTexture";
import { useFootprintFromPlayer } from "./useFootprintFromPlayer";
import { useEffect, useMemo } from "react";
import { Vector2 } from "three";
import { useGameDataStore } from "../stores/game-data-store";
import { RapierRigidBody } from "@react-three/rapier";

const useCharacterCreateTexture = ({
  characterRigidBody,
  onGround,
}: {
  characterRigidBody: RapierRigidBody | null;
  onGround: boolean;
}) => {
  const sizeTexture = 1024;
  const setCharacterTextureData = useGameDataStore(
    (s) => s.setCharacterTextureData
  );
  const { texture: presenceTex, addTouch } = useTouchTexture({
    size: sizeTexture,
    persist: false,
    radius: 0.001,
    // isTest: true,
    darkenPerFrame: 0.02,
  });

  // межі кwарти (XZ)
  const boundsXZ = useMemo(
    () => ({
      min: new Vector2(-50, -50),
      max: new Vector2(50, 50),
    }),
    []
  );

  useFootprintFromPlayer({
    boundsXZ,
    addTouch,
    characterRigidBody,
    onGround,
  });

  useEffect(() => {
    setCharacterTextureData({
      presenceTex,
      sizeTexture,
      boundsXZ,
    });
  }, [setCharacterTextureData, presenceTex, sizeTexture, boundsXZ]);
};

export default useCharacterCreateTexture;

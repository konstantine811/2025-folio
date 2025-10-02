// InfoZone.tsx
import { Html } from "@react-three/drei";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useState, useRef, useEffect, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { usePauseStore } from "../../../store/usePauseMode";
import { Key } from "@/config/key";

type Props = {
  position?: [number, number, number];
  size?: [number, number, number]; // розмір зони (w,h,d)
};

export default function InfoZone({
  position = [0, 0, 0],
  size = [2, 2, 2],
}: Props) {
  const setIsGameStarted = usePauseStore((s) => s.setIsGameStarted);
  const [active, setActive] = useState(false);
  const rb = useRef<RapierRigidBody>(null);
  const { i18n } = useTranslation();

  const onKeyHandler = useCallback(
    (e: KeyboardEvent) => {
      if (active && e.code === Key.F) {
        setIsGameStarted(false);
      }
    },
    [active, setIsGameStarted]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyHandler);
    return () => window.removeEventListener("keydown", onKeyHandler);
  }, [onKeyHandler]);
  return (
    <group position={position}>
      {/* фіксоване тіло лише для сенсора */}
      <RigidBody type="fixed" colliders={false} ref={rb}>
        {/* В Rapier у CuboidCollider args = halfExtents */}
        <CuboidCollider
          sensor
          args={[size[0] / 2, size[1] / 2, size[2] / 2]}
          onIntersectionEnter={() => {
            setActive(true);
          }}
          onIntersectionExit={() => {
            setActive(false);
          }}
        />
        {/* HTML якір у 3D: масштабується/оклюдується */}
        {active && (
          <Html
            transform
            sprite // завжди повернутий до камери
            distanceFactor={2} // розмір відносно дистанції
            position={[0, size[1] / 2 + 0.3, 0]} // трохи над кубом
            zIndexRange={[10, 0]}
          >
            <Trans
              i18nKey="cubic_worlds_game.portfolio.title"
              key={`3d-${i18n.language}`}
              components={{
                span: (
                  <span className="text-accent font-bold bg-background rounded px-2 py-1" />
                ),
              }}
            />
          </Html>
        )}
      </RigidBody>
    </group>
  );
}

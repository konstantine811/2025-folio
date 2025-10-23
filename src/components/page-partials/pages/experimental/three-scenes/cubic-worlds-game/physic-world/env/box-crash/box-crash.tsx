// BoxCrash.tsx
import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { Mesh } from "three";
import { JSX, useEffect, useRef, useState } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useWorldStore } from "../../../store/useWorldStore";
import BoxDestroyed from "./box-distroyed";
import ObstacleWrapper from "../../../nav-mesh/obstacle-wrapper";

const path = publicModelPath("simple_box.glb");
type Props = JSX.IntrinsicElements["group"] & {
  idBox: string;
};

export default function BoxCrash({ idBox, ...props }: Props) {
  const { nodes, materials } = useGLTF(path);
  const addLootBox = useWorldStore((s) => s.addLootBox);
  const boxData = useWorldStore((s) => s.lootBreakBoxEntity[idBox]);
  const [broken, setBroken] = useState(false);
  const rbRef = useRef<RapierRigidBody>(null);
  const [spawn, setSpawn] = useState<{
    pos: [number, number, number];
    quat: [number, number, number, number];
    scale: number;
  } | null>(null);

  // ініт
  useEffect(() => {
    addLootBox(idBox);
  }, [addLootBox, idBox]);

  // коли health <= 0 — зчитуємо позу і передаємо у BoxDestroyed
  useEffect(() => {
    if (!boxData) return;
    if (boxData.helth <= 0 && rbRef.current) {
      const p = rbRef.current.translation();
      const q = rbRef.current.rotation();
      const scale = (props.scale as number) ?? 1;
      setSpawn({ pos: [p.x, p.y, p.z], quat: [q.x, q.y, q.z, q.w], scale });
      setBroken(true);
    }
  }, [boxData]);

  // дістаємо пози/рот/скейл із props (не покладаємось на <group>)
  const pos = (props.position as [number, number, number]) ?? [0, 0, 0];
  const rotE = (props.rotation as [number, number, number]) ?? [0, 0, 0];

  return (
    <>
      {!broken ? (
        <RigidBody
          ref={rbRef}
          type="dynamic"
          position={pos}
          rotation={rotE}
          mass={2}
          colliders={"cuboid"}
          friction={1}
          restitution={0.2}
          userData={{ breakable: true, name: idBox }}
        >
          {/* візуал цілого */}
          <ObstacleWrapper>
            <mesh
              castShadow
              receiveShadow
              geometry={(nodes.Cube514 as Mesh).geometry}
              material={materials.box_darken}
              scale={props.scale}
            />
          </ObstacleWrapper>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube514_1 as Mesh).geometry}
            material={materials.box_lighter}
            scale={props.scale}
          />
          {/* фізика цілого */}
        </RigidBody>
      ) : spawn ? (
        <BoxDestroyed
          position={spawn.pos}
          rotation={[spawn.quat[0], spawn.quat[1], spawn.quat[2]]}
          scale={spawn.scale}
        />
      ) : null}
    </>
  );
}

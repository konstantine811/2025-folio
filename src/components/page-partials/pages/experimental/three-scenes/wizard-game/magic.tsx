import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useRef } from "react";
import { Group, Mesh, Vector3 } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import Wizard from "./wizard";
import VFXS from "./vfxs";
import Spells from "./spells";
import { useMagicStore } from "./hooks/useMagic";
import Orcs from "./orcs";

type Props = JSX.IntrinsicElements["group"] & {};

const Magic = (props: Props) => {
  const pointerPosition = useRef(new Vector3(0, 0.001, 0));
  const pointer = useRef<Mesh>(null);
  const wizard = useRef<Group>(null);
  const spell = useMagicStore((state) => state.spell);
  const addSpell = useMagicStore((state) => state.addSpell);
  const update = useMagicStore((s) => s.update);

  useFrame(({ clock }, delta) => {
    update(delta);
    const elapsedTime = clock.getElapsedTime();
    if (pointer.current && pointerPosition.current) {
      pointer.current.position.lerp(pointerPosition.current, 0.1);

      pointer.current.scale.x =
        pointer.current.scale.y =
        pointer.current.scale.z =
          lerp(
            pointer.current.scale.x,
            2 + (Math.sin(elapsedTime * 4) + 0.5) * 1,
            0.1
          );
    }
    wizard.current?.lookAt(pointerPosition.current);
  });
  return (
    <group {...props}>
      <VFXS />
      <Spells />
      <mesh
        receiveShadow
        rotation-x={-Math.PI / 2}
        position-y={0.001}
        onPointerMove={(e) =>
          pointerPosition.current.set(e.point.x, e.point.y + 0.001, e.point.z)
        }
        onClick={() => {
          addSpell({
            ...spell,
            position: pointerPosition.current.clone(),
          });
        }}
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} transparent />
      </mesh>
      <mesh ref={pointer} rotation-x={degToRad(-90)}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial
          emissive={spell.colors[0]}
          emissiveIntensity={2.5}
        />
      </mesh>
      <Orcs />
      <group position-z={5} ref={wizard}>
        <Wizard scale={0.4} />
      </group>
      <Gltf
        scale={0.5}
        src="/3d-models/wizard-model/WizardTraining.glb"
        receiveShadow
      />
    </group>
  );
};

export default Magic;

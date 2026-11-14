import { useFBX, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh } from "three";
import { adaptMixamoClip } from "../../character-controller/character-animation/adapt-mixamo-clip";
import { AnimatedLocomotionCharacter, LocomotionState } from "../../character-controller/character-animation/animated-locomotion-character";

const ROOT = "/3d-models/rts-farmer/farmer/";
// The GLB also contains an older walking action; idle is the second Armature action.
const IDLE_CLIP = "Armature|mixamo.com|Layer0.001";

export function FarmerCharacter(props: LocomotionState) {
  const model = useGLTF(`${ROOT}farmer_idle.glb`);
  const walk = useFBX(`${ROOT}Walking.fbx`);
  const run = useFBX(`${ROOT}Running.fbx`);
  const jump = useFBX(`${ROOT}Jumping.fbx`);
  const falling = useFBX(`${ROOT}Falling Idle.fbx`);
  const hasModel = useMemo(() => {
    let found = false;
    model.scene.traverse(node => { if (node instanceof Mesh) found = true; });
    return found;
  }, [model.scene]);
  const clips = useMemo(() => {
    if (!hasModel) return [];
    const idle = model.animations.find(clip => clip.name === IDLE_CLIP)?.clone();
    if (!idle) throw new Error(`Farmer: missing idle animation ${IDLE_CLIP}`);
    idle.name = "idle";
    return [
      idle,
      adaptMixamoClip({ source: walk, target: model.scene, name: "walk" }),
      adaptMixamoClip({ source: run, target: model.scene, name: "run" }),
      adaptMixamoClip({ source: jump, target: model.scene, name: "jump" }),
      adaptMixamoClip({ source: falling, target: model.scene, name: "falling" }),
    ];
  }, [hasModel, model.scene, model.animations, walk, run, jump, falling]);
  if (!hasModel) return <group>
    <mesh position={[0, 1.1, 0]} castShadow><capsuleGeometry args={[0.32, 1.25, 8, 12]} /><meshStandardMaterial color="#597c68" /></mesh>
    <mesh position={[0, 2.05, 0]} castShadow><sphereGeometry args={[0.26, 16, 12]} /><meshStandardMaterial color="#e6b98e" /></mesh>
    <mesh position={[0, 2.27, 0]} castShadow><cylinderGeometry args={[0.48, 0.48, 0.08, 16]} /><meshStandardMaterial color="#c5a05b" /></mesh>
  </group>;
  return <AnimatedLocomotionCharacter sourceScene={model.scene} clips={clips} {...props} />;
}

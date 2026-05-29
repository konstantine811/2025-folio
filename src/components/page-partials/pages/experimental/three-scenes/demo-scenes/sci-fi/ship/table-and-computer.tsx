import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import {
  CuboidCollider,
  interactionGroups,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial } from "three";
import {
  SCIFI_CABLE_GROUP,
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_PROP_COLLIDER_GROUP,
} from "../sci-fi-collision-groups";
import type { ResolvedCableProxyBox } from "../character/sci-fi-cable-proxy-limbs";
import { registerSciFiVerletPropBoxProvider } from "../sci-fi-verlet-prop-boxes";
import {
  resolveTableCableProxyBoxes,
  TABLE_CABLE_PROXY_CONTROLS_PATH,
  useSciFiTableCableProxyTransform,
  type TableCableProxyTransform,
} from "./table-cable-proxies";
import {
  applyTableGlowMaterial,
  createTunedTableGlowMaterial,
  tableGlowMaterialDefaults,
} from "./table-glow-material";

const modelPath = "/3d-models/sci-fi/table_and_computer.glb";

export function TableAndComputer(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelPath);
  const {
    position,
    rotationY,
    scale,
    cableProxyOnePosition,
    cableProxyOneHalfExtents,
    cableProxyTwoPosition,
    cableProxyTwoHalfExtents,
  } = useSciFiTableCableProxyTransform();

  const verletBoxesRef = useRef<ResolvedCableProxyBox[]>([]);
  const tableTransformRef = useRef<TableCableProxyTransform>({
    position,
    rotationY,
    scale,
    cableProxyOnePosition,
    cableProxyOneHalfExtents,
    cableProxyTwoPosition,
    cableProxyTwoHalfExtents,
  });
  tableTransformRef.current = {
    position,
    rotationY,
    scale,
    cableProxyOnePosition,
    cableProxyOneHalfExtents,
    cableProxyTwoPosition,
    cableProxyTwoHalfExtents,
  };

  useEffect(() => {
    return registerSciFiVerletPropBoxProvider(() => {
      resolveTableCableProxyBoxes(
        tableTransformRef.current,
        verletBoxesRef.current,
      );
      return verletBoxesRef.current;
    });
  }, []);

  const { showCableProxyWireframes, glowEmissiveIntensity, glowColorScale } =
    useControls(TABLE_CABLE_PROXY_CONTROLS_PATH, {
      showCableProxyWireframes: {
        value: false,
        label: "Show cable proxy wireframes",
      },
      glowEmissiveIntensity: {
        value: tableGlowMaterialDefaults.emissiveIntensity,
        min: 0.5,
        max: 25,
        step: 0.5,
        label: "Glow emissive intensity",
      },
      glowColorScale: {
        value: tableGlowMaterialDefaults.emissiveColorScale,
        min: 0.1,
        max: 1,
        step: 0.05,
        label: "Glow color scale",
      },
    });

  const tunedGlowMaterial = useMemo(() => {
    const glow = materials.Glow as MeshStandardMaterial | undefined;
    if (!glow) return null;

    return createTunedTableGlowMaterial(glow, {
      emissiveIntensity: glowEmissiveIntensity,
      emissiveColorScale: glowColorScale,
    });
  }, [materials, glowEmissiveIntensity, glowColorScale]);

  const visualNodes = useMemo(() => {
    const bone = nodes.Bone.clone(true);
    const bone004 = nodes.Bone004.clone(true);

    if (tunedGlowMaterial) {
      applyTableGlowMaterial(bone, tunedGlowMaterial);
      applyTableGlowMaterial(bone004, tunedGlowMaterial);
    }

    return { bone, bone004 };
  }, [nodes, tunedGlowMaterial]);

  const transformPosition: [number, number, number] = [
    position.x,
    position.y,
    position.z,
  ];
  const transformRotation: [number, number, number] = [
    0,
    (rotationY * Math.PI) / 180,
    0,
  ];
  const transformScale: [number, number, number] = [scale, scale, scale];
  const scalePosition = (value: { x: number; y: number; z: number }) =>
    [value.x * scale, value.y * scale, value.z * scale] as [
      number,
      number,
      number,
    ];
  const propCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    SCIFI_CABLE_GROUP,
    SCIFI_CHARACTER_CONTROLLER_GROUP,
    0,
  ]);
  const cableOnlyCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    SCIFI_CABLE_GROUP,
  ]);
  const scaleSize = (value: { x: number; y: number; z: number }) =>
    [value.x * scale * 2, value.y * scale * 2, value.z * scale * 2] as [
      number,
      number,
      number,
    ];

  return (
    <>
      <group
        {...props}
        dispose={null}
        position={transformPosition}
        rotation={transformRotation}
        scale={transformScale}
      >
        <group scale={1.232}>
          <primitive object={visualNodes.bone} />
          <primitive object={visualNodes.bone004} />
        </group>
      </group>

      <RigidBody
        key={`${position.x}_${position.y}_${position.z}_${rotationY}_${scale}`}
        type="fixed"
        colliders="trimesh"
        includeInvisible
        friction={0.9}
        position={transformPosition}
        rotation={transformRotation}
        collisionGroups={propCollisionGroups}
      >
        <group scale={transformScale}>
          <mesh
            geometry={(nodes.table_collider as Mesh).geometry}
            position={[0.001, 0.957, 0.001]}
            rotation={[-Math.PI, 0, -Math.PI]}
            scale={[-0.305, -0.035, -0.319]}
            visible={false}
          />
          <group position={[0, 0, 0.07]}>
            <mesh
              geometry={(nodes.monitor_bottom_collider as Mesh).geometry}
              visible={false}
            />
            <mesh
              geometry={(nodes.monitor_top_collider as Mesh).geometry}
              visible={false}
            />
          </group>
        </group>
      </RigidBody>

      <RigidBody
        key={`cable_proxy_${position.x}_${position.y}_${position.z}_${rotationY}_${scale}_${cableProxyOnePosition.x}_${cableProxyOnePosition.y}_${cableProxyOnePosition.z}_${cableProxyOneHalfExtents.x}_${cableProxyOneHalfExtents.y}_${cableProxyOneHalfExtents.z}_${cableProxyTwoPosition.x}_${cableProxyTwoPosition.y}_${cableProxyTwoPosition.z}_${cableProxyTwoHalfExtents.x}_${cableProxyTwoHalfExtents.y}_${cableProxyTwoHalfExtents.z}`}
        type="fixed"
        colliders={false}
        position={transformPosition}
        rotation={transformRotation}
      >
        <CuboidCollider
          args={scalePosition(cableProxyOneHalfExtents)}
          position={scalePosition(cableProxyOnePosition)}
          collisionGroups={cableOnlyCollisionGroups}
          solverGroups={cableOnlyCollisionGroups}
          friction={2.4}
          restitution={0}
        />
        <CuboidCollider
          args={scalePosition(cableProxyTwoHalfExtents)}
          position={scalePosition(cableProxyTwoPosition)}
          collisionGroups={cableOnlyCollisionGroups}
          solverGroups={cableOnlyCollisionGroups}
          friction={2.4}
          restitution={0}
        />
      </RigidBody>

      {showCableProxyWireframes ? (
        <group
          position={transformPosition}
          rotation={transformRotation}
          userData={{ camExcludeCollision: true }}
        >
          <mesh position={scalePosition(cableProxyOnePosition)}>
            <boxGeometry args={scaleSize(cableProxyOneHalfExtents)} />
            <meshBasicMaterial
              color="#39d5ff"
              wireframe
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
          <mesh position={scalePosition(cableProxyTwoPosition)}>
            <boxGeometry args={scaleSize(cableProxyTwoHalfExtents)} />
            <meshBasicMaterial
              color="#39d5ff"
              wireframe
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      ) : null}
    </>
  );
}

useGLTF.preload(modelPath);

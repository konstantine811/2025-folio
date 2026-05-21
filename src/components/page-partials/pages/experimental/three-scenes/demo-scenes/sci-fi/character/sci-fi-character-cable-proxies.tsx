import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { sciFiBodyProxyCollisionGroups } from "../sci-fi-collision-groups";
import { sciFiCableProxyLimbs } from "./sci-fi-cable-proxy-limbs";

const PROXY_COLLISION_GROUPS = sciFiBodyProxyCollisionGroups();
const DEBUG_PROXY_COLOR = "#22c55e";

type ResolvedLimb = {
  config: (typeof sciFiCableProxyLimbs)[number];
  bone: Object3D;
  localPosition: Vector3;
  rotationOffset: Euler | null;
};

type SciFiCharacterCableProxiesProps = {
  skeletonRoot?: Object3D;
  enabled?: boolean;
  /** Wireframe capsules synced to proxy colliders (dev only). */
  debugVisual?: boolean;
};

export function SciFiCharacterCableProxies({
  skeletonRoot,
  enabled = true,
  debugVisual = false,
}: SciFiCharacterCableProxiesProps) {
  const bodyRefs = useRef<Map<string, RapierRigidBody>>(new Map());
  const worldPosition = useMemo(() => new Vector3(), []);
  const worldQuaternion = useMemo(() => new Quaternion(), []);
  const rotationOffsetQuat = useMemo(() => new Quaternion(), []);

  const resolvedLimbs = useMemo((): ResolvedLimb[] => {
    if (!skeletonRoot) return [];

    return sciFiCableProxyLimbs
      .map((config) => {
        let bone: Object3D | null = null;

        skeletonRoot.traverse((child) => {
          if (child.name === config.boneName) {
            bone = child;
          }
        });

        if (!bone) {
          console.warn(
            `[SciFiCharacterCableProxies] Bone "${config.boneName}" not found`,
          );
          return null;
        }

        return {
          config,
          bone,
          localPosition: new Vector3(...(config.localPosition ?? [0, 0, 0])),
          rotationOffset: config.localRotation
            ? new Euler(...config.localRotation)
            : null,
        };
      })
      .filter((entry): entry is ResolvedLimb => entry !== null);
  }, [skeletonRoot]);

  useBeforePhysicsStep(() => {
    if (!enabled) return;

    for (const limb of resolvedLimbs) {
      const body = bodyRefs.current.get(limb.config.id);
      if (!body) continue;

      limb.bone.updateWorldMatrix(true, false);

      worldPosition.copy(limb.localPosition);
      limb.bone.localToWorld(worldPosition);
      limb.bone.getWorldQuaternion(worldQuaternion);

      if (limb.rotationOffset) {
        rotationOffsetQuat.setFromEuler(limb.rotationOffset);
        worldQuaternion.multiply(rotationOffsetQuat);
      }

      body.setNextKinematicTranslation({
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z,
      });
      body.setNextKinematicRotation({
        x: worldQuaternion.x,
        y: worldQuaternion.y,
        z: worldQuaternion.z,
        w: worldQuaternion.w,
      });
    }
  });

  if (!enabled || resolvedLimbs.length === 0) return null;

  return (
    <>
      {resolvedLimbs.map(({ config }) => (
        <RigidBody
          key={config.id}
          ref={(body) => {
            if (body) {
              bodyRefs.current.set(config.id, body);
            } else {
              bodyRefs.current.delete(config.id);
            }
          }}
          type="kinematicPosition"
          colliders={false}
        >
          <CapsuleCollider
            args={[config.halfHeight, config.radius]}
            collisionGroups={PROXY_COLLISION_GROUPS}
            friction={1.4}
            restitution={0.02}
          />
          {debugVisual && (
            <mesh raycast={() => null}>
              <capsuleGeometry
                args={[config.radius, config.halfHeight * 2, 8, 16]}
              />
              <meshBasicMaterial
                color={DEBUG_PROXY_COLOR}
                wireframe
                transparent
                opacity={0.85}
                depthTest={false}
              />
            </mesh>
          )}
        </RigidBody>
      ))}
    </>
  );
}

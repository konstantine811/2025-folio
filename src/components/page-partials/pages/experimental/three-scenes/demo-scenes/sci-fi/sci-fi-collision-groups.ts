import { interactionGroups } from "@react-three/rapier";

/** Rapier membership groups used in the sci-fi scene. */
export const SCIFI_CABLE_GROUP = 4;
export const SCIFI_CABLE_FLOOR_GROUP = 5;
export const SCIFI_HELMET_GROUP = 6;
export const SCIFI_BODY_PROXY_GROUP = 7;
export const SCIFI_CHARACTER_CONTROLLER_GROUP = 8;
export const SCIFI_PROP_COLLIDER_GROUP = 1;

export const SCIFI_CONTROLLER_COLLIDES_WITH = [0, SCIFI_CABLE_FLOOR_GROUP, 1, 2] as const;

/** Cables collide with floor, helmet proxy, and body proxies — not the controller capsule. */
export function sciFiCableCollisionGroups() {
  return interactionGroups(SCIFI_CABLE_GROUP, [
    SCIFI_CABLE_FLOOR_GROUP,
    SCIFI_HELMET_GROUP,
    SCIFI_BODY_PROXY_GROUP,
    SCIFI_PROP_COLLIDER_GROUP,
  ]);
}

/** Controller capsule ignores cables and body proxies. */
export function sciFiControllerCapsuleCollisionGroups() {
  return interactionGroups(SCIFI_CHARACTER_CONTROLLER_GROUP, [
    ...SCIFI_CONTROLLER_COLLIDES_WITH,
  ]);
}

/** Body proxy capsules only interact with cables. */
export function sciFiBodyProxyCollisionGroups() {
  return interactionGroups(SCIFI_BODY_PROXY_GROUP, [SCIFI_CABLE_GROUP]);
}

/** Dynamic props (chair, etc.) — world, player capsule, and cable segments. */
export function sciFiPropDynamicCollisionGroups() {
  return interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    0,
    SCIFI_CHARACTER_CONTROLLER_GROUP,
    SCIFI_CABLE_GROUP,
  ]);
}

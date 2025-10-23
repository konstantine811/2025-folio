import { RapierRigidBody } from "@react-three/rapier";
import { World } from "arancini";
import { createReactAPI } from "arancini/react";
import { CrowdAgent } from "recast-navigation";
import { Object3D } from "three";

export type EntityType = {
  three?: Object3D;
  rigidBody?: RapierRigidBody;
  traversable?: true;
  crowdAgent?: CrowdAgent;
  followPlayer?: true;
  player?: true;
};

export const world = new World<EntityType>();
const { Entity, Component, useQuery } = createReactAPI(world);

export const playerQuery = world.query((e) => e.has("player", "rigidBody"));
export const traversableQuery = world.query((e) =>
  e.has("traversable", "three")
);
export const crowdAgentQuery = world.query((e) => e.has("crowdAgent"));
export const followersQuery = world.query((e) =>
  e.has("crowdAgent", "followPlayer")
);

export { Component, Entity, useQuery };

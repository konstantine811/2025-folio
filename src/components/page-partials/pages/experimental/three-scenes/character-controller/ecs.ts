import { RapierRigidBody } from "@react-three/rapier";
import { World } from "arancini";
import { createReactAPI } from "arancini/react";
import { NavMesh, NavMeshQuery } from "recast-navigation";
import { Object3D } from "three";

export type NavComponent = {
  navMesh?: NavMesh;
  navMeshQuery?: NavMeshQuery;
  navMeshVersion: number;
};

export type EntityType = {
  isPlayer?: true;
  three?: Object3D;
  rigidBody?: RapierRigidBody;
  nav?: NavComponent;
  traversable?: true;
};

export enum EntityFlags {
  IsPlayer = "isPlayer",
  IsNav = "nav",
  IsRigidBody = "rigidBody",
  IsTraversable = "traversable",
}

export const world = new World<EntityType>();

export const navQuery = world.query((entity) => entity.is(EntityFlags.IsNav));
export const playerQuery = world.query((entity) =>
  entity.has(EntityFlags.IsPlayer, EntityFlags.IsRigidBody),
);
export const traversableQuery = world.query((entity) =>
  entity.is(EntityFlags.IsTraversable),
);

const { Entity, Component } = createReactAPI(world);

export { Entity, Component };

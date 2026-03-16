import { Mesh } from "three";
import { traversableQuery } from "../../ecs";

export const getTraversableMeshes = () => {
  const traversable = traversableQuery.entities.map((e) => e.three);

  const traversableMeshes = new Set<Mesh>();

  for (const obj of traversable) {
    obj?.traverse((child) => {
      if (child instanceof Mesh) {
        traversableMeshes.add(child);
      }
    });
  }

  return Array.from(traversableMeshes);
};

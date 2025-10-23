// RegisterWalkable.tsx
import { RefObject, useEffect } from "react";
import { Mesh } from "three";
import { useNav } from "./useNavMesh";

export function RegisterObstacle({ target }: { target: RefObject<Mesh> }) {
  const add = useNav((s) => s.addMesh);
  const remove = useNav((s) => s.removeMesh);

  useEffect(() => {
    const m = target.current;
    if (!m) return;
    add(m);
    return () => remove(m);
  }, [target]); // intentionally depends on .current

  return null;
}

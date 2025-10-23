import {
  cloneElement,
  ReactElement,
  RefObject,
  useLayoutEffect,
  useRef,
} from "react";
import { Mesh } from "three";
import { useNav } from "./useNavMesh";

function ObstacleWrapper({ children }: { children: ReactElement }) {
  const ref = useRef<Mesh>(null!);
  const addMesh = useNav((s) => s.addMesh);
  const removeMesh = useNav((s) => s.removeMesh);

  useLayoutEffect(() => {
    const m = ref.current;
    if (m) addMesh(m);
    return () => {
      if (m) removeMesh(m);
    };
  }, [addMesh, removeMesh]);

  return cloneElement(children, { ref } as { ref: RefObject<Mesh> });
}

export default ObstacleWrapper;

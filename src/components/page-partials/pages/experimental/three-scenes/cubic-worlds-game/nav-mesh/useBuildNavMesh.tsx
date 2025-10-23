import { useEffect } from "react";
import { useNav } from "./useNavMesh";

const useBuildNavMesh = () => {
  const meshes = useNav((s) => s.meshes);
  const build = useNav((s) => s.buildStable);

  useEffect(() => {
    build();
  }, [meshes, build]);
  return null;
};

export default useBuildNavMesh;

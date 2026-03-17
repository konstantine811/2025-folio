import { useFrame } from "@react-three/fiber";
import { NavMeshHelper } from "@recast-navigation/three";
import { useRef, useState } from "react";
import { navQuery } from "../../../ecs";
import { MeshBasicMaterial } from "three";

export const NavMeshDebug = () => {
  const [helper, setHelper] = useState<NavMeshHelper>();
  const prevNavMeshVersion = useRef(-1);

  useFrame(() => {
    const nav = navQuery.first;

    if (!nav || !nav.nav?.navMesh) {
      if (helper) setHelper(undefined);
      return;
    }

    const navMesh = nav.nav.navMesh;
    const navMeshVersion = nav.nav.navMeshVersion;

    if (!navMeshVersion) return;

    if (navMeshVersion !== prevNavMeshVersion.current) {
      prevNavMeshVersion.current = navMeshVersion;

      const nextHelper = new NavMeshHelper(navMesh, {
        navMeshMaterial: new MeshBasicMaterial({
          color: "lightblue",
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        }),
      });

      setHelper(nextHelper);
    }
  });

  return <>{helper && <primitive object={helper} />}</>;
};

import { useEffect, useState } from "react";
import { useNav } from "./useNavMesh";
import { Object3D } from "three";
import { DebugDrawer, NavMeshHelper } from "@recast-navigation/three";

// ---- Debug NavMesh ----
function NavMeshDebug() {
  const navMesh = useNav((s) => s.navMesh);
  const isNavMeshDebug = useNav((s) => s.isNavMeshDebug);
  const [helper, setHelper] = useState<Object3D | null>(null);

  useEffect(() => {
    if (!navMesh) {
      setHelper(null);
      return;
    }

    // Prefer DebugDrawer if available, else fallback to NavMeshHelper
    let obj: DebugDrawer | NavMeshHelper | null = null;
    try {
      if (typeof DebugDrawer === "function") {
        obj = new DebugDrawer();
        obj.drawNavMesh(navMesh);
      }
    } catch {
      console.error("erorr nav mesh debug");
    }
    if (!obj && typeof NavMeshHelper === "function") {
      obj = new NavMeshHelper(navMesh);
    }
    setHelper(obj);

    return () => {
      if (!obj) return;
      obj.remove();
    };
  }, [navMesh]);

  return helper && isNavMeshDebug ? <primitive object={helper} /> : null;
}

export default NavMeshDebug;

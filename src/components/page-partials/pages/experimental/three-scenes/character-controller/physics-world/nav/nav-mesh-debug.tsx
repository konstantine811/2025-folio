import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { DebugDrawer } from "@recast-navigation/three";
import { useNavMeshStore } from "./useNavMeshStore";

export default function NavMeshDebug() {
  const navMesh = useNavMeshStore((s) => s.navMesh);
  const isNavMeshDebug = useNavMeshStore((s) => s.isNavMeshDebug);
  const scene = useThree((s) => s.scene);
  const drawer = useRef<DebugDrawer | null>(null);

  useEffect(() => {
    if (!navMesh || !isNavMeshDebug) {
      if (drawer.current) {
        scene.remove(drawer.current);
        drawer.current.dispose();
        drawer.current = null;
      }
      return;
    }

    const d = new DebugDrawer();
    d.drawNavMesh(navMesh);
    scene.add(d);
    drawer.current = d;

    return () => {
      scene.remove(d);
      d.dispose();
      drawer.current = null;
    };
  }, [navMesh, isNavMeshDebug, scene]);

  return null;
}

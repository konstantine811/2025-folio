// FlowText.tsx
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Material,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import { Flow, FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import { ThemePalette } from "@/config/theme-colors.config";
import { useSpringValue, easings } from "@react-spring/web";

export default function FlowText({
  text = "Hello three.js!",
  fontUrl = "/fonts/helvetiker_regular.typeface.json",
}: {
  text?: string;
  fontUrl?: string;
  theatreKey?: string;
}) {
  const font = useLoader(FontLoader, fontUrl);
  const { scene } = useThree();

  const flowRef = useRef<Flow | null>(null);
  const materialsRef = useRef<Material[]>([]);
  const t = useSpringValue(-0.1);

  const prev = useRef<number>(0.1); // важливо: початкове == стартовому значенню!

  // 2) крива
  const curve = useMemo(() => {
    const pts: Vector3[] = [];
    const segments = 64;
    const r = 2.4;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(
        new Vector3(Math.cos(a) * r, Math.sin(a) * 0.12, Math.sin(a) * r)
      );
    }
    const c = new CatmullRomCurve3(pts);
    c.curveType = "centripetal";
    c.closed = true;
    return c;
  }, []);

  // 3) будуємо Flow один раз
  useEffect(() => {
    if (!font) return;

    const geom = new TextGeometry(text, {
      font,
      size: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.001,
      depth: 0.01,
      bevelSize: 0.001,
      bevelOffset: 0,
      bevelSegments: 3,
    });

    geom.rotateX(-Math.PI / 2);
    geom.rotateZ(-Math.PI);
    geom.computeBoundingBox();
    geom.center();

    const baseMat = new MeshStandardMaterial({
      color: ThemePalette.dark["muted-foreground"],
      metalness: 1,
      roughness: 0.5,
      transparent: true,
    });
    const mesh = new Mesh(geom, baseMat);
    const flow = new Flow(mesh);
    flow.updateCurve(0, curve);
    flow.moveAlongCurve(0);

    flowRef.current = flow;
    scene.add(flow.object3D);

    // синхронізуємо prev з поточним theatre-значенням

    // ⬇️ тут беремо реальні матеріали, які буде рендерити Flow
    materialsRef.current = [];
    flow.object3D.traverse((o) => {
      if (o.type === "Mesh") {
        const mesh = o as Mesh;
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m: Material) => {
          // підстрахуємось, що фейд працює коректно
          (m as MeshStandardMaterial).transparent = true;
          // опційно, щоб уникнути артефактів при фейді:
          // (m as MeshStandardMaterial).depthWrite = false;
        });
        materialsRef.current.push(...mats);
      }
    });

    // старт анімації ТІЛЬКИ після створення Flow
    prev.current = 0.01;
    t.start(0.52, {
      config: { duration: 8000, easing: easings.easeOutSine },
    });
    return () => {
      if (flow.object3D.parent) flow.object3D.parent.remove(flow.object3D);
      flowRef.current = null;
      geom.dispose();
      baseMat.dispose();
      materialsRef.current = [];
    };
  }, [font, text, scene, curve, t]);

  useFrame(() => {
    const cur = t.get();
    const dt = cur - prev.current;
    if (dt) flowRef.current?.moveAlongCurve(dt);
    prev.current = cur;
  });

  return null;
}

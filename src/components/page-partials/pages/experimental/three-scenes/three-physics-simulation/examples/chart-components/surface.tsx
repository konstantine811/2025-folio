import { FC, useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
} from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";

const BOUNDS = { xmin: -10, xmax: 10, ymin: -10, ymax: 10 };
const RES = { x: 100, y: 100 };

// const baseFn = (x: number, y: number) => {
//   const r = Math.hypot(x, y) + 1e-6;
//   return Math.sin(3 * r) / r;
// };

type SurfaceData = {
  positions: Float32Array;
  baseZ: Float32Array;
  colors: Float32Array;
  indices: number[];
};

const buildSurface = (bounds = BOUNDS, res = RES): SurfaceData => {
  const { xmin, xmax, ymin, ymax } = bounds;
  const dx = (xmax - xmin) / res.x;
  const dy = (ymax - ymin) / res.y;

  const widthVerts = res.x + 1;
  const heightVerts = res.y + 1;
  const positions = new Float32Array(widthVerts * heightVerts * 3);
  const baseZ = new Float32Array(widthVerts * heightVerts);
  const colors = new Float32Array(widthVerts * heightVerts * 3);

  const zs: number[] = [];
  let ptr = 0;
  for (let j = 0; j < heightVerts; j++) {
    const y = ymin + j * dy;
    const z = 0;
    for (let i = 0; i < widthVerts; i++) {
      const x = xmin + i * dx;
      positions[ptr++] = x;
      positions[ptr++] = y;
      positions[ptr++] = z;
      baseZ[ptr / 3 - 1] = z;
      zs.push(z);
    }
  }

  const zmin = Math.min(...zs);
  const zmax = Math.max(...zs) + 1e-6;

  const c = new Color();
  for (let k = 0; k < zs.length; k++) {
    const t = (zs[k] - zmin) / (zmax - zmin);
    if (t < 0.5) {
      c.setRGB(t * 2 * 0.2, t * 2 * 0.2 + 0.6, 1.0);
    } else {
      c.setRGB(1.0, (1 - t) * 2 * 0.2 + 0.6, (1 - t) * 2 * 0.2);
    }
    colors[3 * k + 0] = c.r;
    colors[3 * k + 1] = c.g;
    colors[3 * k + 2] = c.b;
  }

  const indices: number[] = [];
  for (let j = 0; j < res.y; j++) {
    for (let i = 0; i < res.x; i++) {
      const a = j * widthVerts + i;
      const b = a + 1;
      const cI = a + widthVerts;
      const d = cI + 1;
      indices.push(a, cI, b, b, cI, d);
    }
  }

  return { positions, baseZ, colors, indices };
};

type Ripple = {
  x: number;
  y: number;
  t0: number;
};

const Surface: FC = () => {
  const geometryRef = useRef<BufferGeometry>(null);
  const meshRef = useRef<Mesh>(null);

  const { positions, baseZ, colors, indices } = useMemo(
    () => buildSurface(),
    []
  );
  const ripplesRef = useRef<Ripple[]>([]);

  useLayoutEffect(() => {
    const geom = geometryRef.current;
    if (geom) {
      geom.setAttribute("position", new BufferAttribute(positions, 3));
      geom.setAttribute("color", new BufferAttribute(colors, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
    }
  }, [positions, colors, indices]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!meshRef.current) return;
    const local = meshRef.current.worldToLocal(e.point.clone());
    ripplesRef.current.push({
      x: local.x,
      y: local.y,
      t0: performance.now() / 1000, // у R3F ¹: якщо нема clock – заміни на performance.now()/1000
    });
  };

  useFrame(({ clock }) => {
    const geom = geometryRef.current;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const ripples = ripplesRef.current;
    if (!ripples.length) return;

    const tNow = clock.getElapsedTime();
    // чистимо старі хвилі
    ripplesRef.current = ripples.filter((r) => tNow - r.t0 < 4);

    let ptr = 0;
    for (let i = 0; i < baseZ.length; i++) {
      const x = arr[ptr];
      const y = arr[ptr + 1];
      let z = baseZ[i];

      for (const r of ripplesRef.current) {
        const dt = tNow - r.t0;
        const dist = Math.hypot(x - r.x, y - r.y);
        const envelope = Math.exp(-dt * 1.2) * Math.exp(-dist * 1.0);
        const wave = Math.sin(6 * dt - 3 * dist);
        z += envelope * wave * 0.1;
      }

      arr[ptr + 2] = z;
      ptr += 3;
    }

    posAttr.needsUpdate = true;
    geom.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      rotation-x={-Math.PI / 2}
      onPointerMove={handlePointerDown}
    >
      <bufferGeometry ref={geometryRef} />
      <meshStandardMaterial
        vertexColors
        metalness={0.05}
        roughness={0.9}
        side={DoubleSide}
      />
    </mesh>
  );
};

export default Surface;

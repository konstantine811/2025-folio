import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Mesh, Raycaster, Vector2 } from "three";

interface Displacement {
  canvas: {
    width: number;
    height: number;
  };
  context: CanvasRenderingContext2D | null;
  screenCursor: Vector2;
  canvasCursor: Vector2;
  glowImagePath: string;
  glowImage: HTMLImageElement | null;
}

const RaycastPlane = () => {
  const raycast = useMemo(() => new Raycaster(), []);
  const interactivePlaneRef = useRef<Mesh>(null);
  const displacement = useMemo(() => {
    return {
      canvas: {
        width: 512,
        height: 512,
      },
      context: null,
      screenCursor: new Vector2(9999, 9999),
      canvasCursor: new Vector2(9999, 9999),
      glowImagePath: "/images/textures/glow.png",
    } as Displacement;
  }, []);

  const onPointerMove = (event: PointerEvent) => {
    displacement.screenCursor.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  };

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = displacement.canvas.width;
    canvas.height = displacement.canvas.height;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "10";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    displacement.context = ctx;
    if (!ctx) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const image = new Image();
    image.src = displacement.glowImagePath;
    displacement.glowImage = image;
    image.onload = () => {
      ctx.drawImage(
        image,
        displacement.canvasCursor.x,
        displacement.canvasCursor.y,
        32,
        32
      );
    };
    return () => {
      document.body.removeChild(canvas);
    };
  }, [displacement]);

  useFrame(({ camera }) => {
    raycast.setFromCamera(displacement.screenCursor, camera);
    if (interactivePlaneRef.current) {
      const intersections = raycast.intersectObject(
        interactivePlaneRef.current
      );
      if (intersections.length) {
        const uv = intersections[0].uv;
        if (uv) {
          displacement.canvasCursor.set(
            uv.x * displacement.canvas.width,
            uv.y * displacement.canvas.height
          );
        }
      }
    }
    if (displacement.context && displacement.glowImage) {
      displacement.context.drawImage(
        displacement.glowImage,
        displacement.canvasCursor.x,
        displacement.canvasCursor.y,
        32,
        32
      );
    }
  });
  return (
    <mesh onPointerMove={onPointerMove} ref={interactivePlaneRef}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

export default RaycastPlane;

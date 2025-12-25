import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  Raycaster,
  Vector2,
} from "three";
import { useRaycastGeometryStore } from "./storage/raycast-storage";

interface Displacement {
  canvas: {
    width: number;
    height: number;
  };
  context: CanvasRenderingContext2D | null;
  screenCursor: Vector2;
  canvasCursor: Vector2;
  canvasCursorPrevious: Vector2;
  glowImagePath: string;
  glowImage: HTMLImageElement | null;
  interactivePlane: {
    visible: boolean;
  };
}

const RaycastGeometry = ({
  raycasterGeometry = new PlaneGeometry(10, 10, 1, 1),
  isGeometryVisible = false,
  isDebug = false,
  cursorSize = 0.3,
}: {
  raycasterGeometry?: BufferGeometry;
  isGeometryVisible?: boolean;
  isDebug?: boolean;
  cursorSize?: number;
}) => {
  const raycast = useMemo(() => new Raycaster(), []);
  const interactivePlaneRef = useRef<Mesh>(null);
  const setDisplacementTexture = useRaycastGeometryStore(
    (s) => s.setDisplacementTexture
  );
  const displacementTexture = useRaycastGeometryStore(
    (s) => s.displacementTexture
  );
  const hs = useHeaderSizeStore((s) => s.size);
  const displacement = useMemo(() => {
    return {
      canvas: {
        width: 256,
        height: 256,
      },
      context: null,
      screenCursor: new Vector2(9999, 9999),
      canvasCursor: new Vector2(9999, 9999),
      canvasCursorPrevious: new Vector2(9999, 9999),
      glowImagePath: "/images/textures/glow.png",
      interactivePlane: {
        visible: isGeometryVisible,
      },
    } as Displacement;
  }, [isGeometryVisible]);

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
    canvas.style.top = `${hs + 2}px`;
    canvas.style.left = "2px";
    canvas.style.zIndex = "10";
    if (isDebug) {
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");
    setDisplacementTexture(new CanvasTexture(canvas));
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
      if (isDebug) {
        document.body.removeChild(canvas);
      }
    };
  }, [displacement, hs, setDisplacementTexture, isDebug]);

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
            (1 - uv.y) * displacement.canvas.height
          );
        }
      }
    }
    // Speed alpha
    const cursorDistance = displacement.canvasCursorPrevious.distanceTo(
      displacement.canvasCursor
    );
    displacement.canvasCursorPrevious.copy(displacement.canvasCursor);
    const alpha = Math.min(cursorDistance * 0.3, 1);
    if (displacement.context && displacement.glowImage) {
      const glowSize = displacement.canvas.width * cursorSize;

      displacement.context.globalCompositeOperation = "source-over";
      displacement.context.globalAlpha = 0.02;
      displacement.context.fillRect(
        0,
        0,
        displacement.canvas.width,
        displacement.canvas.height
      );
      displacement.context.globalCompositeOperation = "lighten";
      displacement.context.globalAlpha = alpha;
      displacement.context.drawImage(
        displacement.glowImage,
        displacement.canvasCursor.x - glowSize / 2,
        displacement.canvasCursor.y - glowSize / 2,
        glowSize,
        glowSize
      );
    }
    if (displacementTexture) {
      displacementTexture.needsUpdate = true;
    }
  });
  return (
    <mesh
      visible={displacement.interactivePlane.visible}
      onPointerMove={onPointerMove}
      ref={interactivePlaneRef}
    >
      <bufferGeometry attach="geometry" {...raycasterGeometry} />
      <meshBasicMaterial color="red" side={DoubleSide} />
    </mesh>
  );
};

export default RaycastGeometry;

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { LinearFilter, RGBAFormat, Texture } from "three";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";
import { WHEEL_CONTACT_HISTORY_SIZE } from "./wheel-contact-history";

const TEXTURE_SCALE = 6;
const LABEL_WIDTH = 18;
const CHANNELS_PER_WHEEL = 4;
const STRIP_WIDTH = 3.4;
const STRIP_HEIGHT = 0.18;
const STRIP_GAP = 0.08;
const RACK_OFFSET: [number, number, number] = [0, 1.05, 0.85];
const COORD_SCALE = 0.1;

const WHEEL_MARKER_COLORS = [
  "#e8a0c4",
  "#d48bb8",
  "#a6dce8",
  "#8fd4e8",
] as const;

function frac(value: number) {
  const scaled = value * COORD_SCALE;
  return scaled - Math.floor(scaled);
}

function WheelContactHistoryCanvasStrip({
  historiesRef,
  index,
}: {
  historiesRef: RefObject<WheelContactHistoryEntry[]>;
  index: number;
}) {
  const canvas = useMemo(() => {
    const element = document.createElement("canvas");
    element.width = LABEL_WIDTH + WHEEL_CONTACT_HISTORY_SIZE * TEXTURE_SCALE;
    element.height = CHANNELS_PER_WHEEL * TEXTURE_SCALE;
    return element;
  }, []);

  const context = useMemo(() => canvas.getContext("2d"), [canvas]);
  const texture = useMemo(() => {
    const nextTexture = new Texture(canvas);
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    nextTexture.format = RGBAFormat;
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.generateMipmaps = false;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [canvas]);

  useFrame(() => {
    if (!context) return;

    const entry = historiesRef.current[index];
    if (!entry) return;

    const { data } = entry;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ff2020";
    context.fillRect(0, 0, LABEL_WIDTH, TEXTURE_SCALE);
    context.fillStyle = "#20ff20";
    context.fillRect(0, TEXTURE_SCALE, LABEL_WIDTH, TEXTURE_SCALE);
    context.fillStyle = "#2070ff";
    context.fillRect(0, TEXTURE_SCALE * 2, LABEL_WIDTH, TEXTURE_SCALE);
    context.fillStyle = "#ffffff";
    context.fillRect(0, TEXTURE_SCALE * 3, LABEL_WIDTH, TEXTURE_SCALE);

    for (let i = 0; i < WHEEL_CONTACT_HISTORY_SIZE; i += 1) {
      const offset = i * 4;
      const drawX = LABEL_WIDTH + i * TEXTURE_SCALE;
      const x = frac(data[offset]);
      const y = frac(data[offset + 1]);
      const z = frac(data[offset + 2]);
      const a = data[offset + 3] > 0.5 ? 1 : 0;

      context.fillStyle = `rgb(${Math.round(x * 255)},0,0)`;
      context.fillRect(drawX, 0, TEXTURE_SCALE, TEXTURE_SCALE);

      context.fillStyle = `rgb(0,${Math.round(y * 255)},0)`;
      context.fillRect(
        drawX,
        TEXTURE_SCALE,
        TEXTURE_SCALE,
        TEXTURE_SCALE,
      );

      context.fillStyle = `rgb(0,0,${Math.round(z * 255)})`;
      context.fillRect(
        drawX,
        TEXTURE_SCALE * 2,
        TEXTURE_SCALE,
        TEXTURE_SCALE,
      );

      context.fillStyle = a > 0 ? "white" : "#111";
      context.fillRect(
        drawX,
        TEXTURE_SCALE * 3,
        TEXTURE_SCALE,
        TEXTURE_SCALE,
      );
    }

    texture.needsUpdate = true;
  });

  return (
    <mesh renderOrder={999} position={[0, 0, 0.02]}>
      <planeGeometry args={[STRIP_WIDTH, STRIP_HEIGHT]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

type WheelContactHistoryDebugRackProps = {
  historiesRef: RefObject<WheelContactHistoryEntry[]>;
};

export function WheelContactHistoryDebugRack({
  historiesRef,
}: WheelContactHistoryDebugRackProps) {
  const rackRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    rackRef.current?.lookAt(camera.position);
  });

  return (
    <group ref={rackRef} position={RACK_OFFSET}>
      {historiesRef.current.map((_, index) => {
        const y =
          (historiesRef.current.length - 1 - index) *
          (STRIP_HEIGHT + STRIP_GAP);
        const markerColor = WHEEL_MARKER_COLORS[index] ?? "#ffffff";

        return (
          <group key={index} position={[0, y, 0]}>
            <mesh position={[-STRIP_WIDTH / 2 - 0.1, 0, 0.01]} renderOrder={997}>
              <planeGeometry args={[0.12, STRIP_HEIGHT]} />
              <meshBasicMaterial
                color={markerColor}
                toneMapped={false}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>

            <mesh position={[0, 0, -0.01]} renderOrder={998}>
              <planeGeometry args={[STRIP_WIDTH + 0.06, STRIP_HEIGHT + 0.04]} />
              <meshBasicMaterial
                color="#2a2a2a"
                toneMapped={false}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            <WheelContactHistoryCanvasStrip
              historiesRef={historiesRef}
              index={index}
            />
          </group>
        );
      })}
    </group>
  );
}

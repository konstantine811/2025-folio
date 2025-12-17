import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useMemo } from "react";
import {
  color,
  mix,
  uniform,
  positionLocal,
  vec3,
  time,
  Fn,
  ShaderNodeObject,
  uv,
  max,
  mx_worley_noise_vec3,
} from "three/tsl";
import { UniformNode } from "three/webgpu";

type Props = {
  colorA?: string;
  colorB?: string;
  blinkSpeed?: number;
  scalingFactor?: number;
  movementSpeed?: number;
};

const ParticleNodeMaterial = ({
  colorA = "white",
  colorB = "orange",
  blinkSpeed = 1,
  scalingFactor = 5,
  movementSpeed = 0.5,
}: Props) => {
  const materialProps = useControls({
    colorA: { value: "skyblue" },
    colorB: { value: "blueviolet" },
    blinkSpeed: { value: 1, min: 0, max: 10 },
    scalingFactor: { value: 5, min: 1, max: 10 },
    movementSpeed: { value: 0.5, min: -5, max: 5, step: 0.01 },
  });
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      colorA: uniform(color(colorA)),
      colorB: uniform(color(colorB)),
      blinkSpeed: uniform(blinkSpeed),
      scalingFactor: uniform(scalingFactor),
      movementSpeed: uniform(movementSpeed),
    };

    const blink = Fn(
      ([t, speed]: [typeof time, ShaderNodeObject<UniformNode<number>>]) => {
        return t.mul(speed).sin().mul(0.5).add(0.5).toVar();
      }
    );

    //const randHeight = hash(vertexIndex);
    const randHeight = mx_worley_noise_vec3(
      uv().mul(uniforms.scalingFactor).add(time.mul(uniforms.movementSpeed))
    ).x;
    const offset = randHeight.mul(0.3);
    const finalPosition = positionLocal.add(vec3(0, 0, offset));

    const finalColor = mix(uniforms.colorA, uniforms.colorB, randHeight).mul(
      max(0.15, blink(time, uniforms.blinkSpeed))
    );

    return {
      nodes: {
        colorNode: finalColor,
        positionNode: finalPosition,
      },
      uniforms,
    };
  }, [colorA, colorB, blinkSpeed, scalingFactor, movementSpeed]);

  useFrame(() => {
    uniforms.colorA.value.set(materialProps.colorA);
    uniforms.colorB.value.set(materialProps.colorB);
    uniforms.blinkSpeed.value = materialProps.blinkSpeed;
    uniforms.scalingFactor.value = materialProps.scalingFactor;
    uniforms.movementSpeed.value = materialProps.movementSpeed;
  });

  return <meshStandardNodeMaterial {...nodes} />;
};

export default ParticleNodeMaterial;

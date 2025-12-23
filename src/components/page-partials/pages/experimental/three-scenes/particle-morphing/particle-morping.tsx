import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import {
  AdditiveBlending,
  Mesh,
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  ShaderMaterial,
} from "three";
import { useEffect, useRef } from "react";
import { useControls } from "leva";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const ShaderCustomMaterial = shaderMaterial(
  {
    uSize: 0.1,
    uResolution: new Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    blending: AdditiveBlending,
    depthWrite: false,
    uProgress: 0.5,
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

const ParticleMorphing = () => {
  const { scene } = useGLTF("/3d-models/models.glb");
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(30, 64, 64));
  const shaderCustomMaterialRef = useRef<ShaderMaterial>(null);
  useControls({
    progress: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        if (shaderCustomMaterialRef.current) {
          shaderCustomMaterialRef.current.uniforms.uProgress.value = value;
        }
      },
    },
  });

  useEffect(() => {
    geometryRef.current.setIndex(null);
    if (scene) {
      const particles = {
        maxCount: 0,
        positions: [] as Float32BufferAttribute[],
        geometry: new BufferGeometry(),
      };
      const positions = scene.children
        .map((child) => {
          if (child instanceof Mesh) {
            return child.geometry.attributes.position;
          }
        })
        .filter((position) => position !== undefined);
      particles.maxCount = Math.max(
        ...positions.map((position) => position.count)
      );
      positions.forEach((position) => {
        const originalArray = position.array;
        const newArray = new Float32Array(particles.maxCount * 3);

        for (let i = 0; i < particles.maxCount; i++) {
          const i3 = i * 3;
          if (i3 < originalArray.length) {
            newArray[i3] = originalArray[i3 + 0];
            newArray[i3 + 1] = originalArray[i3 + 1];
            newArray[i3 + 2] = originalArray[i3 + 2];
          } else {
            const randomIndex = Math.floor(position.count * Math.random()) * 3;
            newArray[i3 + 0] = originalArray[randomIndex + 0];
            newArray[i3 + 1] = originalArray[randomIndex + 1];
            newArray[i3 + 2] = originalArray[randomIndex + 2];
          }
        }
        particles.positions.push(new Float32BufferAttribute(newArray, 3));
      });
      particles.geometry.setAttribute("position", particles.positions[0]);
      geometryRef.current.setAttribute("position", particles.positions[1]);
      geometryRef.current.setAttribute(
        "aPositionTarget",
        particles.positions[3]
      );
    }
  }, [scene]);
  return (
    <>
      <points geometry={geometryRef.current}>
        <shaderCustomMaterial ref={shaderCustomMaterialRef} />
      </points>
    </>
  );
};

export default ParticleMorphing;

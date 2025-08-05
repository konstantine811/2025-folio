import { useFrame } from "@react-three/fiber";
import { JSX, useRef } from "react";
// import myShaderVertex from "./shaders/myshader.vertex.glsl?raw";
// import myShaderFragment from "./shaders/myshader.fragment.glsl?raw";
import { Color, ShaderMaterial, Uniform } from "three";
import { randFloat } from "three/src/math/MathUtils.js";

type Props = JSX.IntrinsicElements["mesh"] & {};

const vertexShader = /* glsl*/ `
        uniform float uTime;
        attribute vec3 aColor;
        varying vec3 vColor;
        void main() {
            vColor = aColor;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

const fragmentShader = /* glsl*/ `
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

const ShaderPlane = ({ ...props }: Props) => {
  const material = useRef<ShaderMaterial>(null!);
  const widthSegments = 1;
  const heightSegments = 1;
  const itemSize = 3;
  const vertexCount = itemSize * ((widthSegments + 1) * (heightSegments + 1));
  const aSpeedArray = new Float32Array(vertexCount).map(() => randFloat(0, 1));

  useFrame(({ clock }) => {
    material.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1, widthSegments, heightSegments]}>
        <bufferAttribute
          attach="attributes-aColor"
          args={[aSpeedArray, itemSize]} // itemSize = 1
        />
      </planeGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uColor: new Uniform(new Color("lightblue")),
          uTime: new Uniform(0.0),
        }}
      />
    </mesh>
  );
};

export default ShaderPlane;

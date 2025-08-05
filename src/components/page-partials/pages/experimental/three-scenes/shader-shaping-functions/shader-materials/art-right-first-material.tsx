import { forwardRef } from "react";
import { Color, ShaderMaterial, Uniform } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

const ArtRightFirstMaterial = forwardRef<ShaderMaterial, { uColor?: string }>(
  ({ uColor = "pink" }, ref) => {
    return (
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uColor: new Uniform(new Color(uColor)),
          uTime: new Uniform(0.0),
        }}
      ></shaderMaterial>
    );
  }
);

export default ArtRightFirstMaterial;

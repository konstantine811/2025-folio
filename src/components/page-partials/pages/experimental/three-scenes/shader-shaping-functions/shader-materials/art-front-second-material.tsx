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
  vec3 red = vec3(0.81, 0.15, 0.15);
  vec3 blue = vec3(0.215, 0.152, 0.615);
  vec3 yellow = vec3(0.89, 0.62, 0.26);
  vec3 yellowFluo = vec3(0.949,0.90,0.0627);
  vec3 white = vec3(0.89, 0.89, 0.89);
  vec3 black = vec3(0.22, 0.22, 0.22);

  float drawRectangle(float x0, float x1, float y0, float y1, vec2 uv) {
    float vertical = step(x0, uv.x) * step(uv.x, x1);
    float horizontal = step(y0, uv.y) * step(uv.y, y1);
    return vertical * horizontal;
  }
  void main() {
    vec3 finalColor = white;
    float middleVerticalLine = drawRectangle(0.5, 0.55, 0.0, 1.0, vUv);
    finalColor = mix(finalColor, black, middleVerticalLine);

    float bottomRictangle = drawRectangle(0.55, 1.0, 0.0, 0.5, vUv);
    finalColor = mix(finalColor, red, bottomRictangle);

    float middleRightLine = drawRectangle(0.55, 1.0, 0.45, 0.5, vUv);
    finalColor = mix(finalColor, black, middleRightLine);

    float topRightRectangle = drawRectangle(0.55, 1.0, 0.5, 1.0, vUv);
    finalColor = mix(finalColor, blue, topRightRectangle);

    float bottomLeftRectangle = drawRectangle(0.0, 0.5, 0.0, 0.2, vUv);
    finalColor = mix(finalColor, yellow, bottomLeftRectangle);

    float bottomLeftHorizontalLine = drawRectangle(0.0, 0.5, 0.2, 0.24, vUv);
    finalColor = mix(finalColor, black, bottomLeftHorizontalLine);

    float middleLeftHorizontalLine = drawRectangle(0.0, 0.5, 0.6, 0.64, vUv);
    finalColor = mix(finalColor, black, middleLeftHorizontalLine);

    float topLeftVerticalLine = drawRectangle(0.2, 0.25, 0.64, 1.0, vUv);
    finalColor = mix(finalColor, black, topLeftVerticalLine);

    float topLeftHorizontalLine = drawRectangle(0.25, 0.5, 0.82, 0.86, vUv);
    finalColor = mix(finalColor, black, topLeftHorizontalLine);


    float topLeftRectangle = drawRectangle(0.25, 0.5, 0.64, 0.82, vUv);
    finalColor = mix(finalColor, yellowFluo, topLeftRectangle);


    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const ArtFrontSecondMaterial = forwardRef<ShaderMaterial, { uColor?: string }>(
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

export default ArtFrontSecondMaterial;

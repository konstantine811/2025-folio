import { forwardRef } from "react";
import { Color, ShaderMaterial, Uniform, Vector2 } from "three";

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
  uniform vec2 uResolution;
  varying vec2 vUv;

  
  float sdHexagram( in vec2 p, in float r )
  {
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
  }

  vec3 yellowFluo = vec3(2.0, 2.0, 0.0);

  void main() {
    vec2 translatedUvs = (vUv - 0.5) * 2.0;
    translatedUvs.x *= uResolution.x / uResolution.y;
    translatedUvs *= cos(uTime);
    float hexagramDistance = sdHexagram(translatedUvs, 0.3);
    vec3 colorUsed = mix(uColor, yellowFluo, hexagramDistance);
    hexagramDistance = sin(hexagramDistance * 12.0 + uTime * 3.0) * 0.5 + 0.5;
    hexagramDistance /= 10.0;
    float pct = 0.022 / hexagramDistance;
    vec3 finalColor = pct * colorUsed;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const ArtFrontThirdMaterial = forwardRef<
  ShaderMaterial,
  { uColor?: string; uResolution?: [number, number] }
>(({ uColor = "pink", uResolution = [1, 1] }, ref) => {
  return (
    <shaderMaterial
      ref={ref}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uColor: new Uniform(new Color(uColor)),
        uTime: new Uniform(0.0),
        uResolution: new Uniform(new Vector2(...uResolution)),
      }}
    ></shaderMaterial>
  );
});

export default ArtFrontThirdMaterial;

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color } from "three";

/**
 * UV-edges darkening:
 * - gradientEdges ∈ [0..1] — сила затемнення по краях UV
 * - edgeWidth    ∈ [0..0.5] — товщина смуги від краю всередину
 *
 * Bottom gradient:
 * - gradientBottom ∈ [0..1] — наскільки темніший низ (за vUv.y)
 *
 * Без Fresnel — чорних “шапок” при нахилі більше не буде.
 */
const GradientMaterial = shaderMaterial(
  {
    baseColor: new Color("#9db34a"),
    colorA: new Color("#8bf45a"),
    colorB: new Color("#ff8a00"),
    randomK: Math.random(),

    specularColor: new Color("#000000"), // зроби білим, якщо хочеш "іскри"
    specularAmount: 0.25,
    specularPower: 48.0,

    bottomColor: new Color("#40521A"),
    bottomHeight: 0.0, // у просторі vUv.y
    bottomSoftness: 0.9,

    gradientEdges: 0.55, // сила UV-затемнення по краях
    edgeWidth: 0.12, // товщина затемнення від краю (0..0.5)

    transparency: 0.0,
    random: 1.0,
    emissionStrength: 0.0,

    time: 0.0,
    noiseScale: 3.0,
  },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormalW;

    void main() {
      vUv = uv;
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      vNormalW  = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  /* glsl */ `
    // ===== uniforms =====
    uniform vec3  baseColor;
    uniform vec3  colorA;
    uniform vec3  colorB;
    uniform float randomK;

    uniform vec3  specularColor;
    uniform float specularAmount;
    uniform float specularPower;

    uniform vec3  bottomColor;
    uniform float bottomHeight;    // у просторі vUv.y
    uniform float bottomSoftness;

    uniform float gradientEdges;   // сила UV edge darkening
    uniform float edgeWidth;       // товщина смуги від краю

    uniform float transparency;
    uniform float random;
    uniform float emissionStrength;

    uniform float time;
    uniform float noiseScale;

    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormalW;

    // простий value noise
    float hash(vec3 p){
      p = fract(p * 0.3183099 + vec3(0.1,0.2,0.3));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float valueNoise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f*f*(3.0 - 2.0*f);
      float n000 = hash(i + vec3(0,0,0));
      float n100 = hash(i + vec3(1,0,0));
      float n010 = hash(i + vec3(0,1,0));
      float n110 = hash(i + vec3(1,1,0));
      float n001 = hash(i + vec3(0,0,1));
      float n101 = hash(i + vec3(1,0,1));
      float n011 = hash(i + vec3(0,1,1));
      float n111 = hash(i + vec3(1,1,1));
      float n00 = mix(n000, n100, u.x);
      float n10 = mix(n010, n110, u.x);
      float n01 = mix(n001, n101, u.x);
      float n11 = mix(n011, n111, u.x);
      float n0  = mix(n00, n10, u.y);
      float n1  = mix(n01, n11, u.y);
      return mix(n0, n1, u.z);
    }

    void main(){
      // 1) база + Random Color (як у твоєму ноді Object Info → Random)
      float k = clamp(randomK, 0.0, 1.0);
      vec3 col = mix(baseColor, mix(colorA, colorB, k), 0.5);

      // 2) градієнт від кореня за vUv.y (НЕ worldY, щоби рельєф не ламався)
      float tBottom = smoothstep(bottomHeight, bottomHeight + max(1e-5, bottomSoftness), vUv.y);
      col = mix(bottomColor, col, tBottom);

      // 3) UV edge darkening:
      //    відстань до найближчого краю UV-прямокутника (0 на краю → 0.5 в центрі)
      float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      // маска країв: 1 біля краю, 0 в центрі
      float edgeMask = 1.0 - smoothstep(0.0, max(1e-4, edgeWidth), dEdge);
      // затемнюємо делікатно, але ніколи не в нуль (minBrightness)
      float minBrightness = 0.55;
      float darkFactor = mix(1.0, minBrightness, clamp(gradientEdges, 0.0, 1.0)) ;
      col = mix(col, col * darkFactor, edgeMask * gradientEdges);

      // 4) помірний “зернистий” спекуляр (без чорних “шапок”)
      vec3  N = normalize(vNormalW);
      vec3  V = normalize(cameraPosition - vWorldPos);
      vec3  R = reflect(-V, N);
      float spec = pow(max(dot(R, V), 0.0), specularPower);
      float n = valueNoise(vWorldPos * noiseScale + vec3(0.0, time*0.2, 0.0));
      spec *= (0.5 + 0.5*n) * specularAmount;
      // інтенсивність читається з яскравості specularColor
      float specAmt = max(max(specularColor.r, specularColor.g), specularColor.b);
      col += specularColor * (spec * specAmt);

      // 5) емісія (як у ноді)
      col += col * emissionStrength;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0 - transparency);
    }
  `
);

extend({ GradientMaterial });
export { GradientMaterial };

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector2 } from "three";

const GrassGradientMaterial = shaderMaterial(
  {
    // текстури
    albedoMap: null,
    edgeMaskMap: null,
    useEdgeMask: 10.0,

    // прозорість
    transparency: 0.0,

    // вітер
    time: 0.0,
    uWindAmp: 0.06,
    uWindFreq: 1.2,
    uWindDir: new Vector2(0.85, 0.2).normalize(),

    // вітер (detail-параметри, можна тюнити)
    windDirNoiseScale: 0.05, // масштаб шуму напряму
    windStrNoiseScale: 0.25, // масштаб шуму сили
    gustStrength: 1.25, // поривчастість (shape)
    noiseScrollDir: 0.05, // “дрейф” карти вітру

    // fallback-параметр для UV-затемнення, якщо edgeMask відсутня
    _fallbackEdgeWidth: 1.05, // 0..0.5
    _fallbackEdgeDark: 0.01, // мін. яскравість краю
  },
  /* glsl */ `
    // ===== attributes =====
    attribute float aBend;   // жорсткість пучка (per-instance)
    attribute float aTip;    // 0..1 по висоті

    // ===== uniforms =====
    uniform float time;
    uniform float uWindAmp;
    uniform float uWindFreq;
    uniform vec2  uWindDir;
    attribute float aPhase;
    // ===== varyings =====
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormalW;

    mat3 mat3fromMat4(mat4 m){ return mat3(m[0].xyz, m[1].xyz, m[2].xyz); }

    void main() {
      vUv = uv;

      vec3 pos = position;
      vec3 nrm = normal;

      float t = time * uWindFreq;

      // фаза від інстанса:
      float phase = aPhase * 6.2831853; // 2π
      float wave  = sin(t + phase);
      float gust  = sin(t * 0.37 + phase * 1.7);

      float tipWeight = smoothstep(0.5, 1.0, aTip);
      tipWeight *= tipWeight;

      float amp = uWindAmp * aBend * (0.7 + 0.3 * gust);
      vec2 disp = normalize(uWindDir) * (wave * amp) * tipWeight;
      pos.xz += disp;

      // у світ
      #ifdef USE_INSTANCING
        vec4 wp = modelMatrix * instanceMatrix * vec4(pos, 1.0);
        mat3 nm = mat3fromMat4(modelMatrix * instanceMatrix);
      #else
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        mat3 nm = mat3fromMat4(modelMatrix);
      #endif

      vWorldPos = wp.xyz;
      vNormalW  = normalize(nm * nrm);
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  /* glsl */ `
    uniform sampler2D albedoMap;
    uniform sampler2D edgeMaskMap;
    uniform float useEdgeMask;
    uniform float transparency;

    uniform float _fallbackEdgeWidth; // якщо edgeMask нема
    uniform float _fallbackEdgeDark;  // мін. яскравість на краю

    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormalW;

    void main() {
      // 1) колір із текстури
      vec3 col = texture2D(albedoMap, vUv).rgb;

      // 2) затемнення країв:
      float edge = 0.0;
      if (useEdgeMask > 0.5) {
        // маска: БІЛИЙ центр, ЧОРНІ краї
        float m = texture2D(edgeMaskMap, vUv).r;
        edge = 1.0 - m; // 1 на краю, 0 в центрі
      } else {
        // fallback по UV — смуга від краю до центру
        float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        edge = 1.0 - smoothstep(0.0, max(1e-4, _fallbackEdgeWidth), d);
      }
      // робимо край темнішим, але не до чорного
      float dark = mix(1.0, _fallbackEdgeDark, edge);
      col *= dark;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0 - transparency);
    }
  `
);
extend({ GrassGradientMaterial });

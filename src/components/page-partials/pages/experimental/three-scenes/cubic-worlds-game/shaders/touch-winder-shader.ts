import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector2 } from "three";

export const TouchWinderMaterial = shaderMaterial(
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
    // --- НОВЕ: слідова карта присутності ---
    uPresenceMap: null, // sampler2D
    uPresenceMinXZ: new Vector2(0, 0), // world мін XZ
    uPresenceSizeXZ: new Vector2(1, 1), // world розмір XZ (width,height)
    uPresenceTexel: new Vector2(1 / 1024, 1 / 1024), // 1/size канвасу
    uPresenceStrength: 0.35,

    // --- нове для "високих" пучків ---
    uTallThreshold: 100.02, // поріг scaleY інстанса, з якого вважаємо пучок "високим"
    uTallSwayAmp: 0.02, // амплітуда легкого похитування
    uTallSwayFreq: 1.8, // частота похитування
    uPresenceGamma: 0.8, // <1 робить різкіше (миттєвіше)
    uPresenceThreshold: 0.0, // якщо хочеш поріг
  },
  /* glsl */ `
  // ===== attributes =====
attribute float aBend;
attribute float aTip;
attribute float aPhase;

// ===== uniforms =====
uniform float time;
uniform float uWindAmp;
uniform float uWindFreq;
uniform vec2  uWindDir;

// presence
uniform sampler2D uPresenceMap;
uniform vec2 uPresenceMinXZ;
uniform vec2 uPresenceSizeXZ;
uniform vec2 uPresenceTexel; // залишили, раптом знадобиться
uniform float uPresenceStrength; // ТЕПЕР: сила вертикального "просідання"

// tall-sway
uniform float uTallThreshold;
uniform float uTallSwayAmp;
uniform float uTallSwayFreq;
uniform float uPresenceGamma;
uniform float uPresenceThreshold;

// ===== varyings =====
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

mat3 mat3fromMat4(mat4 m){ return mat3(m[0].xyz, m[1].xyz, m[2].xyz); }

// world XZ → UV (0..1)
vec2 worldXZToUV(vec2 xz) {
  return (xz - uPresenceMinXZ) / uPresenceSizeXZ;
}

void main() {
  vUv = uv;

  // --- локаль
  vec3 pos = position;
  vec3 nrm = normal;

  // --- базовий вітер (як було)
  float t = time * uWindFreq;
  float phase = aPhase * 6.2831853; // 2π
  float wave  = sin(t + phase);
  float gust  = sin(t * 0.37 + phase * 1.7);

  float tipWeight = smoothstep(0.5, 1.0, aTip);
  tipWeight *= tipWeight;

  float amp = uWindAmp * aBend * (0.7 + 0.3 * gust);
  vec2 disp = normalize(uWindDir) * (wave * amp) * tipWeight;
  pos.xz += disp;

  // --- у world після вітру
  #ifdef USE_INSTANCING
    vec4 wp = modelMatrix * instanceMatrix * vec4(pos, 1.0);
    mat3 nm = mat3fromMat4(modelMatrix * instanceMatrix);
  #else
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    mat3 nm = mat3fromMat4(modelMatrix);
  #endif

  // ===== presence: вертикальне "просідання" верхівки =====
  vec2 uvPresence = worldXZToUV(wp.xz);
  bool inside = all(greaterThanEqual(uvPresence, vec2(0.0))) &&
                all(lessThanEqual(uvPresence, vec2(1.0)));

  if (inside) {
    float dRaw = texture2D(uPresenceMap, uvPresence).r;
    float d = pow(clamp(dRaw, 0.0, 1.0), uPresenceGamma);     // різкіше
    // опціонально поріг:
    d = smoothstep(uPresenceThreshold, uPresenceThreshold + 0.2, d);

    float pushDown = d * uPresenceStrength * tipWeight;
    wp.y -= pushDown;
    // (опціонально) можна трішки зменшити локальний вітер під гравцем:
    // amp *= (1.0 - 0.6 * dC);
  }

  // ===== "занадто високі" — легке похитування з поверненням =====
  // Оцінюємо масштаб по Y інстанса (довжина другого стовпця normal matrix):
  float scaleY = length(nm[1]);
  float isTall = step(uTallThreshold, scaleY);

  if (isTall > 0.5) {
    float sway = uTallSwayAmp * sin(time * uTallSwayFreq + phase) * tipWeight;
    wp.xz += normalize(uWindDir) * sway;
  }

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
extend({ TouchWinderMaterial });

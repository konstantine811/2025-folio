import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector2 } from "three";

const VERT_GLSL = /* glsl */ `
precision highp float;

attribute float aBend;      // per-instance
attribute float aTip;       // 0..1 вздовж висоти
attribute vec3  offset;     // x,z позиція леза в патчі
attribute float rand;       // рандом інстансу

uniform float time;
uniform float uWindAmp, uWindFreq;
uniform vec2  uWindDir;

uniform float maxLean;        // макс. кут дуги
uniform float bendExp;        // форма дуги
uniform float bladeHalfWidth; // половина ширини (для thickening)
uniform float normalYaw;      // кут повороту нормалей

varying vec2  vUv;
varying vec3  vRotN1, vRotN2;
varying float vWidth;
varying float vHeight;

float hash(vec3 p){
  p = fract(p*0.3183099+vec3(0.1,0.2,0.3));
  p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float vnoise(vec3 p){
  vec3 i=floor(p), f=fract(p);
  vec3 u=f*f*(3.0-2.0*f);
  float n000=hash(i+vec3(0,0,0));
  float n100=hash(i+vec3(1,0,0));
  float n010=hash(i+vec3(0,1,0));
  float n110=hash(i+vec3(1,1,0));
  float n001=hash(i+vec3(0,0,1));
  float n101=hash(i+vec3(1,0,1));
  float n011=hash(i+vec3(0,1,1));
  float n111=hash(i+vec3(1,1,1));
  float n00=mix(n000,n100,u.x);
  float n10=mix(n010,n110,u.x);
  float n01=mix(n001,n101,u.x);
  float n11=mix(n011,n111,u.x);
  float n0=mix(n00,n10,u.y);
  float n1=mix(n01,n11,u.y);
  return mix(n0,n1,u.z);
}

mat3 rotX(float a){ float s=sin(a), c=cos(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float s=sin(a), c=cos(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float s=sin(a), c=cos(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

varying vec3 vWorldPos;
varying vec3 vWorldNormal;

void main(){
  vUv = uv;
  vWidth  = uv.x;
  vHeight = aTip;

  vec3 pos = position;
  vec3 nrm = normal;

  // 1) “дуга” уздовж висоти
  float h = pow(aTip, bendExp);
  float ang = vnoise(vec3(position.xz*0.5, 3.17)) * 6.2831853;
  float ax = cos(ang) * maxLean * h;
  float az = sin(ang) * maxLean * h;
  pos = rotX(ax) * pos;  nrm = rotX(ax) * nrm;
  pos = rotZ(az) * pos;  nrm = rotZ(az) * nrm;

  // 2) вітер (напрям + сила з шуму)
  float wdir = vnoise(vec3((pos.xz+offset.xz)*0.05 + time*0.05, 1.0));
  wdir = mix(0.0, 6.2831853, (wdir*0.5+0.5));
  vec2 windDirNoise = vec2(cos(wdir), sin(wdir));
  float wstr = vnoise(vec3((pos.xz+offset.xz)*0.25 + time, 2.0))*0.5+0.5;
  wstr = pow(clamp(wstr,0.0,1.0), 2.0) * 1.25;

  float t = time*uWindFreq;
  float hf = sin(t + wdir)*0.5 + 0.5;
  float sway = uWindAmp * aBend * (aTip*aTip) * (0.6 + 0.4*hf) * wstr;

  vec2 finalDir = normalize(uWindDir + windDirNoise*0.35);
  pos.xz += finalDir * sway;

  // 3) дві повернуті нормалі навколо Y
  vRotN1 = normalize( rotY(+normalYaw) * nrm );
  vRotN2 = normalize( rotY(-normalYaw) * nrm );

  // 4) у світ (InstancedBufferGeometry -> без instanceMatrix)
  vec3 worldP = pos + vec3(offset.x, 0.0, offset.z);
  vec4 worldPos = modelMatrix * vec4(worldP, 1.0);
  mat3 nm = mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz);

  vWorldNormal = normalize(nm * nrm);
  vWorldPos    = worldPos.xyz;

  // 5) view-space thickening
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float viewDotNormal = clamp(dot(normalize(vWorldNormal).xz, viewDir.xyz.xz), 0.0, 1.0);
  float thick = (1.0 - pow(1.0 - viewDotNormal, 4.0)) * smoothstep(0.0, 0.2, viewDotNormal);

  float sideSign = (vWidth < 0.5) ? -1.0 : 1.0;
  vec4 mv = viewMatrix * worldPos;
  mv.x += thick * sideSign * bladeHalfWidth;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG_GLSL = /* glsl */ `
    precision highp float;

    uniform sampler2D albedoMap;
    uniform float useAlbedo;
    uniform float transparency;

    varying vec2  vUv;
    varying float vWidth;   // 0..1
    varying float vHeight;  // 0..1
    varying vec3  vRotN1, vRotN2;

    void main(){
        // 1) нормаль: мікс двох повернутих нормалей за шириною
        float normalMixFactor = vWidth; // як у скріні
        vec3 N = normalize(mix(vRotN1, vRotN2, normalMixFactor));

        // 2) базовий колір: з текстури або простий tip->base градієнт
        vec3 base = mix(vec3(0.23,0.44,0.16), vec3(0.52,0.84,0.38), pow(vHeight, 1.6));
        if (useAlbedo > 0.5) {
            base = texture2D(albedoMap, vUv).rgb;
        }

        // простеньке ламбертове освітлення від “псевдо-світла” з камери
        vec3 L = normalize(vec3(0.4, 0.8, 0.2));
        float diff = max(dot(N, L), 0.0);
        vec3 col = base * (0.35 + 0.65*diff);

        gl_FragColor = vec4(col, 1.0 - transparency);
    }
`;

const GrassGradientMaterialSecond = shaderMaterial(
  {
    // текстура кольору (опціонально)
    albedoMap: null,
    useAlbedo: 0.0,

    // вітер
    time: 0,
    uWindAmp: 0.06,
    uWindFreq: 1.2,
    uWindDir: new Vector2(0.85, 0.2).normalize(),

    // “дуга” (вигин) і форма
    maxLean: 0.35, // ~20°
    bendExp: 2.2, // жорсткий низ, м’який верх
    bladeHalfWidth: 0.04, // половина ширини леза у локалі (метри)

    // thickening
    normalYaw: 0.3, // скільки повернути нормалі вліво/вправо (радіани)

    transparency: 0.0,
  },
  // vertex …
  VERT_GLSL,
  // fragment …
  FRAG_GLSL
);

extend({ GrassGradientMaterialSecond });

import * as tf from "@tensorflow/tfjs";
import { loadSceneParserModel } from "./model";
import { ObjectSpec, ObjectType, VocabData } from "../types/object.model";

// кеш словника щоб не фетчити кожен раз
let cachedVocabData: VocabData | null = null;

async function loadVocab(): Promise<VocabData> {
  if (cachedVocabData) return cachedVocabData;
  const res = await fetch("/data/ml/vocab.json");
  const data = (await res.json()) as VocabData;
  cachedVocabData = data;
  return data;
}

// токенізація повинна повторювати логіку тренування 1в1
function textToIdsBrowser(
  rawText: string,
  vocab: Record<string, number>,
  MAX_TOKENS: number
): number[] {
  const toks = rawText
    .toLowerCase()
    .replace(/[(),]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let ids = toks.map((t) => (t in vocab ? vocab[t] : 0));

  if (ids.length > MAX_TOKENS) {
    ids = ids.slice(0, MAX_TOKENS);
  } else {
    while (ids.length < MAX_TOKENS) {
      ids.push(0);
    }
  }

  return ids;
}

// -----------------------------
// 1. словник синонімів для типів
//    ключ = "канонічний тип", значення = слова з тексту користувача
//    ти можеш дописувати сюди нові типи (pyramid, cylinder...)
// -----------------------------
const TYPE_KEYWORDS: Record<string, string[]> = {
  sphere: ["сфера", "сферу", "сферою", "кулю", "куля", "шар", "sphere", "ball"],
  cube: ["куб", "куба", "box", "cube", "бокс", "блок"],
};

// повертає canonicalType ("sphere"/"cube"/...) або null якщо не знайдено
function guessTypeFromText(rawText: string): string | null {
  const lower = rawText.toLowerCase();
  const hits: Record<string, number> = {};

  for (const canonicalType in TYPE_KEYWORDS) {
    for (const kw of TYPE_KEYWORDS[canonicalType]) {
      if (lower.includes(kw.toLowerCase())) {
        hits[canonicalType] = (hits[canonicalType] ?? 0) + 1;
      }
    }
  }

  let bestType: string | null = null;
  let bestScore = 0;
  for (const t in hits) {
    if (hits[t] > bestScore) {
      bestScore = hits[t];
      bestType = t;
    }
  }

  return bestScore > 0 ? bestType : null;
}

// -----------------------------
// 2. словник синонімів для кольорів
//    ключ = canonicalColorName (з твого COLOR_TO_ID / COLOR_HEX_MAP),
//    значення = як юзер може це сказати
// -----------------------------
const COLOR_KEYWORDS: Record<string, string[]> = {
  red: ["червоний", "червону", "червона", "red", "червоного"],
  blue: ["синій", "синю", "синя", "blue", "синього"],
  green: ["зелений", "зелену", "зелена", "green", "зеленого"],
  yellow: ["жовтий", "жовту", "жовта", "yellow", "жовтого"],
  white: ["білий", "білу", "біла", "white", "білого"],
};

function guessColorFromText(rawText: string): string | null {
  const lower = rawText.toLowerCase();
  const hits: Record<string, number> = {};

  for (const canonicalColor in COLOR_KEYWORDS) {
    for (const kw of COLOR_KEYWORDS[canonicalColor]) {
      if (lower.includes(kw.toLowerCase())) {
        hits[canonicalColor] = (hits[canonicalColor] ?? 0) + 1;
      }
    }
  }

  let bestColor: string | null = null;
  let bestScore = 0;
  for (const c in hits) {
    if (hits[c] > bestScore) {
      bestScore = hits[c];
      bestColor = c;
    }
  }

  return bestScore > 0 ? bestColor : null;
}

// мапа canonical color name -> hex
const COLOR_HEX_MAP: Record<string, string> = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  yellow: "#ffff00",
  white: "#ffffff",
};

export async function predictSpecFromText(
  rawText: string
): Promise<ObjectSpec> {
  // модель і словник вантажимо паралельно
  const [model, vocabStuff] = await Promise.all([
    loadSceneParserModel(),
    loadVocab(),
  ]);

  const { vocab, MAX_TOKENS, TYPE_TO_ID, COLOR_TO_ID } = vocabStuff;

  // --------------------------
  // reverse-мапа для type
  // наприклад { cube:0, sphere:1 } -> {0:"cube",1:"sphere"}
  // --------------------------
  const ID_TO_TYPE: Record<number, ObjectType> = {};
  for (const typeName in TYPE_TO_ID) {
    const numericId = TYPE_TO_ID[typeName as ObjectType];
    ID_TO_TYPE[numericId] = typeName as ObjectType;
  }

  // --------------------------
  // reverse-мапа для кольорів:
  // COLOR_TO_ID { red:0, blue:1, ... } -> {0:"red",1:"blue",...}
  // --------------------------
  const ID_TO_COLORNAME: Record<number, string> = {};
  for (const colorName in COLOR_TO_ID) {
    const colorId = COLOR_TO_ID[colorName]; // number
    ID_TO_COLORNAME[colorId] = colorName; // "red" | "blue" | ...
  }

  // --------------------------
  // 1. текст -> ids
  // --------------------------
  const tokenIds = textToIdsBrowser(rawText, vocab, MAX_TOKENS);
  const inputTensor = tf.tensor2d([tokenIds], [1, tokenIds.length], "int32");

  // --------------------------
  // 2. модель.predict
  // --------------------------
  const outputTensors = model.predict(inputTensor) as tf.Tensor[];
  const [typeP, colorP, sizeP, radiusP, posP] = outputTensors;

  // argMax по класифікаційних головах
  const typeIdxArr = (await typeP.argMax(-1).array()) as number[]; // [idx]
  const colorIdxArr = (await colorP.argMax(-1).array()) as number[]; // [idx]

  // регресійні голови
  const sizeArr2D = (await sizeP.array()) as number[][]; // [[sx,sy,sz]]
  const radiusArr2D = (await radiusP.array()) as number[][]; // [[r]]
  const posArr2D = (await posP.array()) as number[][]; // [[x,y,z]]

  // чистимо
  tf.dispose(inputTensor);
  tf.dispose(outputTensors);

  // витягуємо batch=1
  const typeIdx = typeIdxArr[0] ?? 0;
  const colorIdx = colorIdxArr[0] ?? 0;

  const sizeArr = sizeArr2D[0] ?? [1, 1, 1];
  const radiusArr = radiusArr2D[0] ?? [1];
  const posArr = posArr2D[0] ?? [0, 0, 0];

  // =========================
  // 3. базовий прогноз моделі
  // =========================
  let predictedType = ID_TO_TYPE[typeIdx] ?? "cube"; // "cube" | "sphere" | ...
  let predictedColorName = ID_TO_COLORNAME[colorIdx] ?? "white"; // "red" | ...

  // =========================
  // 4. підказка з тексту юзера
  //    (intent override, масштабований)
  // =========================
  const hintedType = guessTypeFromText(rawText); // "sphere" | "cube" | null
  const hintedColor = guessColorFromText(rawText); // "red" | "blue" | null

  if (hintedType) {
    predictedType = hintedType as ObjectType;
  }

  if (hintedColor) {
    predictedColorName = hintedColor;
  }

  // переведемо колірне ім'я -> hex
  const finalColorHex = COLOR_HEX_MAP[predictedColorName] ?? "#ffffff";

  // =========================
  // 5. будуємо фінальний spec
  // =========================
  const spec: ObjectSpec = {
    type: predictedType,
    color: finalColorHex,
    size: [sizeArr[0] ?? 1, sizeArr[1] ?? 1, sizeArr[2] ?? 1],
    radius: radiusArr[0] ?? 1,
    position: [posArr[0] ?? 0, posArr[1] ?? 0, posArr[2] ?? 0],
  };

  return spec;
}

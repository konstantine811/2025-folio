import * as tf from "@tensorflow/tfjs";

let loadedModel: tf.LayersModel | null = null;

export async function loadSceneParserModel() {
  if (loadedModel) return loadedModel;

  loadedModel = await tf.loadLayersModel("/data/ml/model.json");
  return loadedModel;
}

import { LoadingManager, Mesh, SkinnedMesh, Texture, type AnimationClip, type Object3D, type Material } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import dracoWrapperUrl from 'three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url';
import dracoWasmUrl from 'three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { findCompanion, MissingResourcesError, resourceName } from './asset-resources';

export const isModelFile = (file: File) => /\.(fbx|glb|gltf)$/i.test(file.name);
export type LoadedAsset = { root: Object3D; clips: AnimationClip[]; missingTextures: string[] };

export async function loadAsset(file: File, companions: File[], allowMissingTextures = false): Promise<LoadedAsset> {
  const urls = new Map<File, string>();
  const urlFor = (f: File) => {
    let url = urls.get(f);
    if (!url) { url = URL.createObjectURL(f); urls.set(f, url); }
    return url;
  };
  const manager = new LoadingManager();
  manager.addHandler(/\.tga$/i, new TGALoader(manager));
  const decoderManager = new LoadingManager();
  decoderManager.setURLModifier(url => url.endsWith('.wasm') ? dracoWasmUrl : dracoWrapperUrl);
  const draco = new DRACOLoader(decoderManager).setDecoderConfig({ type: 'wasm' });
  const missing = new Set<string>();
  const complete = new Promise<void>(resolve => { manager.onLoad = resolve; });
  const failed = new Set<string>();
  manager.onError = url => {
    if (!url.startsWith('data:')) failed.add([...urls].find(([, value]) => value === url)?.[0].name ?? resourceName(url));
  };
  manager.setURLModifier(url => {
    if (/^(blob:|data:)/.test(url)) return url;
    const name = resourceName(url);
    const companion = findCompanion(url, companions);
    if (companion) return urlFor(companion);
    missing.add(name);
    // No implicit requests to remote paths embedded in an uploaded asset.
    return 'data:application/octet-stream;base64,';
  });
  let asset: LoadedAsset | undefined;
  manager.itemStart('studio-import');
  try {
    const buffer = await file.arrayBuffer();
    if (/\.fbx$/i.test(file.name)) {
      const root = new FBXLoader(manager).parse(buffer, '');
      asset = { root, clips: root.animations, missingTextures: [] };
    } else {
      const gltf = await new GLTFLoader(manager).setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer, '');
      asset = { root: gltf.scene, clips: gltf.animations, missingTextures: [] };
    }
    manager.itemEnd('studio-import');
    await complete;
    if (failed.size) throw new Error(`Не вдалося прочитати ресурси: ${[...failed].join(', ')}. Перевірте файли та спробуйте ще раз.`);
    if (missing.size) {
      const error = new MissingResourcesError(missing);
      if (!allowMissingTextures || !error.canSkipTextures) throw error;
      asset.missingTextures = error.resources;
      // FBX can retain an empty Texture after a failed image load. Remove it so
      // the neutral material renders and exports without broken image resources.
      asset.root.traverse(node => {
        if (!(node instanceof Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          for (const [key, value] of Object.entries(material as unknown as Record<string, unknown>)) {
            if (value instanceof Texture && !value.image) {
              value.dispose(); Reflect.set(material, key, null); material.needsUpdate = true;
            }
          }
        }
      });
    }
    return asset;
  } catch (error) {
    if (asset) disposeAsset(asset.root);
    if (missing.size && !(error instanceof MissingResourcesError)) throw new MissingResourcesError(missing);
    throw error instanceof Error ? error : new Error(`Не вдалося прочитати ${file.name}`);
  } finally { draco.dispose(); for (const url of urls.values()) URL.revokeObjectURL(url); }
}

export function disposeAsset(root: Object3D) {
  const textures = new Set<Texture>();
  const materials = new Set<Material>();
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    if (node instanceof SkinnedMesh) node.skeleton.dispose();
    node.geometry.dispose();
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
}

export async function exportCharacter(root: Object3D, clips: AnimationClip[], binary: boolean) {
  if (!clips.length) throw new Error('Позначте хоча б одну анімацію для експорту.');
  // The original rig stays in its rest pose; the viewport always animates a clone.
  const data = await new GLTFExporter().parseAsync(clone(root), { binary, animations: clips, trs: true, onlyVisible: false });
  return new Blob([data instanceof ArrayBuffer ? data : JSON.stringify(data)], { type: binary ? 'model/gltf-binary' : 'model/gltf+json' });
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

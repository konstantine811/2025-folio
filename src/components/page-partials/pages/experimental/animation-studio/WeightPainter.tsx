import { useEffect, useMemo, useRef } from 'react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { Color, Mesh, Float32BufferAttribute, MeshStandardMaterial, SkinnedMesh, type Object3D } from 'three';
import { SkinWeightEditor, type BrushMode } from './skin-weights';

export type Painting = {
  editor: SkinWeightEditor; navigation: boolean; mesh: number; bone: string; fallback: string;
  radius: number; strength: number; mode: BrushMode; heatmap: boolean; revision: number;
  onChange: () => void;
};
export default function WeightPainter({ model, painting, onPause }: { model: Object3D; painting: Painting; onPause: () => void }) {
  const { navigation, editor, mesh: meshIndex, bone, fallback, radius, strength, mode, heatmap, revision, onChange } = painting;
  const meshes = useMemo(() => { const list: SkinnedMesh[] = []; model.traverse(node => { if (node instanceof SkinnedMesh && node.geometry.getAttribute('skinWeight')) list.push(node); }); return list; }, [model]);
  const mesh = meshes[meshIndex];
  const active = useRef<number | null>(null);
  const cursor = useRef<Mesh>(null);
  const last = useRef(0);
  const boneIndex = mesh?.skeleton.bones.findIndex(b => b.name === bone) ?? -1;
  const fallbackIndex = mesh?.skeleton.bones.findIndex(b => b.name === fallback) ?? -1;
  const overlay = useMemo(() => {
    if (!mesh) return null;
    const geometry = editor.meshes[meshIndex].geometry.clone();
    geometry.setAttribute('skinIndex', editor.meshes[meshIndex].geometry.getAttribute('skinIndex'));
    geometry.setAttribute('skinWeight', editor.meshes[meshIndex].geometry.getAttribute('skinWeight'));
    geometry.setAttribute('color', new Float32BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 3), 3));
    return { geometry, material: new MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }) };
  }, [mesh, editor, meshIndex]);
  useEffect(() => {
    if (!mesh || !overlay) return;
    const geometry = mesh.geometry, material = mesh.material;
    if (heatmap) { mesh.geometry = overlay.geometry; mesh.material = overlay.material; }
    return () => { mesh.geometry = geometry; mesh.material = material; };
  }, [mesh, overlay, heatmap]);
  useEffect(() => {
    if (!overlay) return;
    const color = new Color(), attribute = overlay.geometry.getAttribute('color');
    for (let v = 0; v < attribute.count; v++) {
      color.setHSL((1 - Math.min(1, editor.weight(meshIndex, v, boneIndex))) * 0.66, 1, 0.45);
      attribute.setXYZ(v, color.r, color.g, color.b);
    }
    attribute.needsUpdate = true;
  }, [editor, meshIndex, boneIndex, overlay, revision]);
  useEffect(() => () => { overlay?.geometry.dispose(); overlay?.material.dispose(); }, [overlay]);
  const changeRef = useRef(onChange); changeRef.current = onChange;
  useEffect(() => {
    const finish = (event?: Event) => { if (event instanceof PointerEvent && event.pointerId !== active.current) return; if (active.current !== null) { active.current = null; editor.finish(); changeRef.current(); } };
    window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish); window.addEventListener('blur', finish);
    return () => { finish(); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish); window.removeEventListener('blur', finish); };
  }, [editor, meshIndex, boneIndex, fallbackIndex, mode, navigation]);
  useEffect(() => { if (cursor.current) cursor.current.visible = false; }, [navigation]);
  useFrame(() => { if (mesh) { model.updateMatrixWorld(true); mesh.computeBoundingSphere(); } });
  function dab(event: ThreeEvent<PointerEvent>) {
    if (navigation || !mesh || event.object !== mesh || !event.face || boneIndex < 0 || fallbackIndex < 0 || boneIndex === fallbackIndex) return;
    event.stopPropagation();
    editor.paint(meshIndex, mesh, [event.face.a, event.face.b, event.face.c], event.point, radius, strength, boneIndex, fallbackIndex, mode);
    mesh.computeBoundingSphere();
    onChange();
  }
  return <><mesh ref={cursor} visible={false} raycast={() => {}}><sphereGeometry args={[radius, 20, 12]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.4} depthWrite={false} /></mesh><primitive object={model} dispose={null}
    onPointerDown={(event: ThreeEvent<PointerEvent>) => { if (navigation || (event.pointerType === 'mouse' && event.button !== 0) || event.object !== mesh || active.current !== null) return; active.current = event.pointerId; last.current = 0; onPause(); dab(event); }}
    onPointerOut={() => { if (cursor.current) cursor.current.visible = false; }}
    onPointerMove={(event: ThreeEvent<PointerEvent>) => { if (cursor.current) { cursor.current.visible = !navigation && event.object === mesh; cursor.current.position.copy(event.point); } if (navigation || active.current !== event.pointerId || performance.now() - last.current < 30) return; last.current = performance.now(); dab(event); }}
    onPointerUp={(event: ThreeEvent<PointerEvent>) => { if (active.current === event.pointerId) { active.current = null; editor.finish(); onChange(); } }} /></>;
}

import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { AnimationMixer, MOUSE, TOUCH, Euler, LoopOnce, Quaternion, SkeletonHelper, SkinnedMesh, type AnimationAction, type AnimationClip, type Object3D } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { rotationAt, type PoseKey } from './animation-core';

import WeightPainter, { type Painting } from './WeightPainter';

export type Transport = { time: number; playing: boolean; speed: number };
type Props = {
  root: Object3D; clip: AnimationClip | null; transport: React.RefObject<Transport>;
  selectedBone: string; skeleton: boolean; editing: boolean; keys: PoseKey[];
  restPreview: boolean; painting?: Painting;
  onTime: (time: number) => void; onPause: () => void;
  onRotate: (rotation: [number, number, number]) => void;
};

function Rig(props: Props) {
  const { root, clip, transport, selectedBone, skeleton, editing, keys, onTime, onPause, onRotate } = props;
  const model = useMemo(() => clone(root), [root]);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const helper = useMemo(() => new SkeletonHelper(model), [model]);
  const dragging = useRef(false);
  const base = useRef(new Quaternion());
  const report = useRef(0);
  const currentAction = useRef<AnimationAction | null>(null);
  useEffect(() => {
    if (!clip) return;
    // Allocate and release together: StrictMode must never replay an uncached action.
    const action = mixer.clipAction(clip).setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    currentAction.current = action;
    action.reset().play();
    return () => {
      action.stop(); mixer.uncacheClip(clip); currentAction.current = null;
    };
  }, [clip, mixer]);
  useEffect(() => () => { helper.dispose(); }, [helper]);
  useEffect(() => () => {
    model.traverse(node => { if (node instanceof SkinnedMesh) node.skeleton.dispose(); });
  }, [model]);
  const bone = model.getObjectByName(selectedBone);
  useFrame((_, delta) => {
    const action = currentAction.current;
    if (dragging.current || !action || !clip) return;
    const t = transport.current;
    if (t.playing) t.time = (t.time + Math.min(delta, 0.1) * t.speed) % Math.max(clip.duration, 0.001);
    action.enabled = true;
    action.time = Math.min(t.time, clip.duration);
    mixer.update(0);
    model.updateMatrixWorld(true);
    report.current += delta;
    if (report.current > 0.08) { onTime(t.time); report.current = 0; }
  });
  return <>
    <>{props.painting ? <WeightPainter model={model} painting={props.painting} onPause={onPause} /> : <primitive object={model} dispose={null} />}</>
    <primitive object={helper} visible={skeleton} dispose={null} />
    {editing && !props.painting && bone && <TransformControls object={bone} mode="rotate" space="local" size={0.7}
      onMouseDown={() => {
        dragging.current = true; onPause();
        base.current.copy(bone.quaternion).multiply(rotationAt(keys, selectedBone, transport.current.time).invert());
      }}
      onMouseUp={() => {
        const offset = base.current.clone().invert().multiply(bone.quaternion);
        const e = new Euler().setFromQuaternion(offset, 'XYZ');
        dragging.current = false;
        onRotate([e.x, e.y, e.z].map(v => v * 180 / Math.PI) as [number, number, number]);
      }} />}
  </>;
}

class ViewportBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert" className="as-empty">Не вдалося відкрити 3D-перегляд. Перевірте підтримку WebGL та перезавантажте сторінку.</p> : this.props.children; }
}

export default function StudioViewport(props: Props) {
  const painting = !!props.painting && !props.painting.navigation;
  return <ViewportBoundary><Canvas style={{ touchAction: 'none' }} camera={{ position: [3, 1.8, 3.5], fov: 40, near: 0.01, far: 100 }} dpr={[1, 1.5]}>
    <color attach="background" args={['#151b20']} />
    <ambientLight intensity={1.5} />
    <directionalLight position={[3, 5, 3]} intensity={2.5} />
    <directionalLight position={[-3, 2, -2]} intensity={1.5} color="#8aabcf" />
    <gridHelper args={[10, 40, '#495b65', '#26353e']} />
    <OrbitControls touches={{ ONE: painting ? undefined : TOUCH.ROTATE, TWO: painting ? undefined : TOUCH.DOLLY_PAN }} mouseButtons={{ LEFT: painting ? undefined : MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: props.painting ? MOUSE.ROTATE : MOUSE.PAN }} makeDefault target={[0, 0.9, 0]} minDistance={0.3} maxDistance={15} />
    {/* A fresh rig prevents a manual edit or cached mixer pose leaking into the comparison. */}
    <Rig key={props.restPreview ? 'rest' : 'animated'} {...props} />
  </Canvas></ViewportBoundary>;
}

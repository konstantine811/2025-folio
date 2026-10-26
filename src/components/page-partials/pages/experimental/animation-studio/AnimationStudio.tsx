import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Download, LoaderCircle, Pause, Play, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { Euler, type Object3D } from 'three';
import { useHeaderSizeStore } from '@/storage/headerSizeStore';
import { bakeAnimation, bonesOf, prepareCharacter, retargetAnimation, rotationAt, uniqueClipName, type ClipEntry, type Draft, type Layer, type Mask } from './animation-core';
import { disposeAsset, downloadBlob, exportCharacter, isModelFile, loadAsset } from './asset-io';
import { MissingResourcesError } from './asset-resources';
import StudioViewport, { type Transport } from './StudioViewport';
import { SkinWeightEditor, type BrushMode } from './skin-weights';
import './animation-studio.css';

const emptyDraft = (): Draft => ({ name: 'Моя анімація', duration: 2, layers: [], keys: [] });
const masks: [Mask, string][] = [['all', 'Усе тіло'], ['upper', 'Верх тіла'], ['lower', 'Низ тіла'], ['left', 'Ліва сторона'], ['right', 'Права сторона']];
const makeLayer = (entry: ClipEntry): Layer => ({ id: crypto.randomUUID(), clipId: entry.id, weight: 1, mask: 'all', start: 0, end: entry.clip.duration, speed: 1, loop: true });
const message = (e: unknown) => e instanceof Error ? e.message : 'Не вдалося виконати операцію.';
type PendingImport = { kind: 'character' | 'animations'; files: File[]; resources: string[]; canSkipTextures: boolean };

export default function AnimationStudio() {
  const hs = useHeaderSizeStore(s => s.size);
  const [root, setRoot] = useState<Object3D | null>(null);
  const [weightEditor, setWeightEditor] = useState<SkinWeightEditor | null>(null);
  const [weightMode, setWeightMode] = useState(false);
  const [weightNavigation, setWeightNavigation] = useState(false);
  const [weightMesh, setWeightMesh] = useState(0);
  const [fallbackBone, setFallbackBone] = useState('');
  const [brushMode, setBrushMode] = useState<BrushMode>('add');
  const [brushRadius, setBrushRadius] = useState(0.08);
  const [brushStrength, setBrushStrength] = useState(0.15);
  const [heatmap, setHeatmap] = useState(true);
  const [weightRevision, setWeightRevision] = useState(0);
  const weightsChanged = () => setWeightRevision(v => v + 1);
  const [fileName, setFileName] = useState('character');
  const [clips, setClips] = useState<ClipEntry[]>([]);
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [selectedBone, setSelectedBone] = useState('');
  const [search, setSearch] = useState('');
  const [skeleton, setSkeleton] = useState(true);
  const [restPreview, setRestPreview] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [format, setFormat] = useState('glb');
  const [rename, setRename] = useState('');
  const [undo, setUndo] = useState<Draft[]>([]);
  const [redo, setRedo] = useState<Draft[]>([]);
  const transport = useRef<Transport>({ time: 0, playing: false, speed: 1 });
  const characterInput = useRef<HTMLInputElement>(null);
  const animationInput = useRef<HTMLInputElement>(null);
  const resourceInput = useRef<HTMLInputElement>(null);
  const ownedRoot = useRef<Object3D | null>(null);
  const mounted = useRef(true);
  const working = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; disposeAssetIfPresent(ownedRoot.current); }; }, []);
  useEffect(() => {
    if (!root) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [root]);
  const bones = useMemo(() => root ? bonesOf(root).map(b => b.name) : [], [root]);
  const entry = clips.find(c => c.id === selected);
  const compiled = useMemo(() => {
    if (!root || !editing) return { clip: null, error: '' };
    try { return { clip: bakeAnimation(root, clips, draft), error: '' }; }
    catch (e) { return { clip: null, error: message(e) }; }
  }, [root, editing, clips, draft]);
  const preview = editing ? compiled.clip : entry?.clip ?? null;
  const duration = preview?.duration ?? draft.duration;
  const pause = () => { transport.current.playing = false; setPlaying(false); };
  const seek = (value: number) => { transport.current.time = value; setTime(value); };
  const edit = (next: Draft) => { setUndo(h => [...h.slice(-49), draft]); setRedo([]); setDraft(next); };
  const rotate = (rotation: [number, number, number]) => {
    if (!selectedBone) return;
    pause();
    const at = Math.min(draft.duration, Math.round(transport.current.time * 30) / 30);
    edit({ ...draft, keys: [...draft.keys.filter(k => k.bone !== selectedBone || Math.abs(k.time - at) > 0.001), { bone: selectedBone, time: at, rotation }] });
  };
  const rotation = useMemo(() => {
    const e = new Euler().setFromQuaternion(rotationAt(draft.keys, selectedBone, time), 'XYZ');
    return [e.x, e.y, e.z].map(v => Math.round(v * 180 / Math.PI * 100) / 100) as [number, number, number];
  }, [draft.keys, selectedBone, time]);
  async function run(label: string, fn: () => Promise<void>) {
    if (working.current) return;
    working.current = true; pause(); setBusy(label); setError(''); setNotice('');
    try { await fn(); } catch (e) { if (mounted.current) setError(message(e)); }
    finally { working.current = false; if (mounted.current) setBusy(''); }
  }
  async function importCharacter(files: File[], retry = false, allowMissingTextures = false) {
    const models = files.filter(isModelFile);
    if (models.length !== 1) { setError('Виберіть одного персонажа (.fbx, .glb або .gltf) та, за потреби, його текстури й .bin.'); return; }
    if (!retry && root && !window.confirm('Замінити персонажа? Поточна бібліотека та незбережена композиція будуть очищені.')) return;
    await run('Завантажую персонажа…', async () => {
      setPendingImport(null);
      const asset = await loadAsset(models[0], files, allowMissingTextures).catch(e => {
        if (mounted.current && e instanceof MissingResourcesError) setPendingImport({ kind: 'character', files, resources: e.resources, canSkipTextures: e.canSkipTextures });
        throw e;
      });
      let next: Object3D;
      try { next = prepareCharacter(asset.root); } catch (e) { disposeAsset(asset.root); throw e; }
      if (!mounted.current) { disposeAsset(next); return; }
      const entries: ClipEntry[] = [];
      for (const clip of asset.clips) {
        const copy = clip.clone(); copy.name = uniqueClipName(clip.name || 'Animation', entries);
        entries.push({ id: crypto.randomUUID(), clip: copy, included: true, source: models[0].name });
      }
      disposeAssetIfPresent(ownedRoot.current); ownedRoot.current = next;
      const skinEditor = new SkinWeightEditor(next);
      setWeightEditor(skinEditor); setWeightMode(false); setWeightMesh(0); setWeightRevision(0);
      setFallbackBone(skinEditor.meshes[0]?.skeleton.bones[1]?.name ?? '');
      setRoot(next); setRestPreview(false); setClips(entries); setSelected(entries[0]?.id ?? ''); setRename(entries[0]?.clip.name ?? '');
      setFileName(models[0].name.replace(/\.[^.]+$/, '')); setSelectedBone(bonesOf(next)[0]?.name ?? '');
      setDraft(emptyDraft()); setUndo([]); setRedo([]); setEditing(!entries.length); seek(0);
      setNotice(`Персонаж готовий. Кісток: ${bonesOf(next).length}; анімацій: ${entries.length}.${asset.missingTextures.length ? ` Відкрито без текстур: ${asset.missingTextures.join(', ')}. Експорт також буде без них.` : ''}`);
    });
  }
  async function importAnimations(files: File[], allowMissingTextures = false) {
    if (!root) return;
    const models = files.filter(isModelFile);
    if (!models.length) { setError('Виберіть анімації .fbx, .glb або .gltf.'); return; }
    await run('Додаю анімації…', async () => {
      setPendingImport(null);
      const added: ClipEntry[] = []; const failures: string[] = []; const skipped: string[] = [];
      const waiting: File[] = []; const missing = new Set<string>();
      for (const file of models) {
        try {
          const asset = await loadAsset(file, files, allowMissingTextures);
          try {
            if (!asset.clips.length) throw new Error('Файл не містить анімацій.');
            for (const source of asset.clips) {
              const clip = retargetAnimation(asset.root, root, source, skipped);
              clip.name = uniqueClipName(asset.clips.length === 1 ? file.name.replace(/\.[^.]+$/, '') : source.name, [...clips, ...added]);
              added.push({ id: crypto.randomUUID(), clip, included: true, source: file.name });
            }
          } finally { disposeAsset(asset.root); }
        } catch (e) {
          failures.push(`${file.name}: ${message(e)}`);
          if (e instanceof MissingResourcesError) { waiting.push(file); e.resources.forEach(name => missing.add(name)); }
        }
      }
      if (!mounted.current) return;
      setClips(current => [...current, ...added]);
      if (waiting.length) setPendingImport({ kind: 'animations', files: [...waiting, ...files.filter(f => !isModelFile(f))], resources: [...missing], canSkipTextures: new MissingResourcesError(missing).canSkipTextures });
      setNotice(`Додано анімацій: ${added.length}.${skipped.length ? ` Пропущено незмінні допоміжні доріжки без відповідника: ${[...new Set(skipped)].join(', ')}.` : ''}`);
      if (failures.length) setError(failures.join('\n'));
    });
  }
  function resumeImport(extraFiles: File[] = [], withoutTextures = false) {
    if (!pendingImport) return;
    const names = new Set(extraFiles.map(file => file.name));
    const files = [...pendingImport.files.filter(file => !names.has(file.name)), ...extraFiles];
    if (pendingImport.kind === 'character') void importCharacter(files, true, withoutTextures);
    else void importAnimations(files, withoutTextures);
  }
  function startDraft(from?: ClipEntry) {
    pause(); seek(0); setRestPreview(false); setEditing(true); setUndo([]); setRedo([]);
    setDraft(from ? { name: `${from.clip.name} · edit`, duration: Math.min(60, Math.max(0.1, from.clip.duration)), layers: [makeLayer(from)], keys: [] } : emptyDraft());
  }
  function saveDraft() {
    if (!compiled.clip) return;
    const clip = compiled.clip.clone(); clip.name = uniqueClipName(draft.name, clips);
    const id = crypto.randomUUID();
    setClips([...clips, { id, clip, included: true, source: 'Власна композиція' }]);
    setSelected(id); setRename(clip.name); setNotice(`«${clip.name}» додано до набору для експорту.`);
  }
  const included = clips.filter(c => c.included);
  const changeLayer = (id: string, update: Partial<Layer>) => edit({ ...draft, layers: draft.layers.map(l => l.id === id ? { ...l, ...update } : l) });
  return <main className="animation-studio" style={{ paddingTop: hs + 16 }}>
    <header className="as-header">
      <div><Link to="/labs" className="as-back"><ArrowLeft size={14} /> Майстерня / Games</Link><h1>Animation Studio <span>Mixamo</span></h1><p>Персонаж, рух і власні анімації — в одному файлі.</p></div>
      <div className="as-export"><select aria-label="Формат експорту" value={format} onChange={e => setFormat(e.target.value)}><option value="glb">GLB · один файл</option><option value="gltf">glTF · вбудовані ресурси</option></select>
        <button className="as-primary" disabled={!root || !included.length || !!busy} onClick={() => void run('Експортую персонажа…', async () => {
          const blob = await exportCharacter(root!, included.map(c => c.clip), format === 'glb');
          downloadBlob(blob, `${fileName}-animated.${format}`); setNotice(`Експортовано анімацій: ${included.length}.`);
        })}><Download size={16} /> Експорт ({included.length})</button></div>
    </header>
    <input ref={characterInput} type="file" multiple hidden aria-label="Файл персонажа" accept=".fbx,.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.tga" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; if (files.length) void importCharacter(files); }} />
    <input ref={animationInput} type="file" multiple hidden aria-label="Файли анімацій" accept=".fbx,.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.tga" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; if (files.length) void importAnimations(files); }} />
    <input ref={resourceInput} type="file" multiple hidden aria-label="Відсутні ресурси моделі" accept=".bin,.png,.jpg,.jpeg,.webp,.tga,.bmp,.gif" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; if (files.length) resumeImport(files); }} />
    {busy && <div className="as-notice" role="status"><LoaderCircle className="as-spin" size={16} /> {busy}</div>}
    {error && <div className="as-error" role="alert">{error}</div>}
    {pendingImport && <section className="as-resource-prompt" aria-label="Додати відсутні файли">
      <p>Модель збережена для повторної спроби. Виберіть потрібні файли — імпорт продовжиться автоматично.</p>
      <ul>{pendingImport.resources.map(name => <li key={name}>{name}</li>)}</ul>
      <div className="as-row"><button className="as-primary" disabled={!!busy} onClick={() => resourceInput.current?.click()}><Upload size={15} /> Додати відсутні файли</button>
        {pendingImport.canSkipTextures && <button disabled={!!busy} onClick={() => resumeImport([], true)}>Відкрити без текстур</button>}
        <button disabled={!!busy} onClick={() => { setPendingImport(null); setError(''); }}>Скасувати імпорт</button></div>
      {pendingImport.canSkipTextures && <p className="as-help">Без текстур можна працювати зі скелетом та анімаціями. Зовнішній вигляд і експорт не міститимуть відсутніх зображень.</p>}
    </section>}
    {!busy && notice && <div className="as-notice" role="status">{notice}</div>}
    <fieldset className="as-workspace" aria-busy={!!busy} disabled={!!busy}>
      <aside className="as-panel as-library"><h2>01 / Персонаж і кліпи</h2>
        <button disabled={!!busy} onClick={() => characterInput.current?.click()}><Upload size={15} /> {root ? 'Замінити персонажа' : 'Додати персонажа'}</button>
        <p className="as-help">Mixamo: FBX Binary, With Skin. Для glTF виберіть також .bin і текстури.</p>
        {root && <p className="as-filename">{fileName} <small>{bones.length} кісток</small></p>}
        <button disabled={!root || !!busy} onClick={() => animationInput.current?.click()}><Plus size={15} /> Додати анімації</button>
        <p className="as-help">Можна вибрати кілька FBX Without Skin для цього скелета. Прапорці визначають набір експорту.</p>
        <div className="as-clips">{clips.map(c => <div key={c.id} className={`as-clip ${selected === c.id && !editing ? 'active' : ''}`}>
          <input type="checkbox" aria-label={`Експортувати ${c.clip.name}`} checked={c.included} onChange={e => setClips(clips.map(x => x.id === c.id ? { ...x, included: e.target.checked } : x))} />
          <button title={c.source} onClick={() => { pause(); seek(0); setSelected(c.id); setRename(c.clip.name); setEditing(false); }}><span>{c.clip.name}</span><small>{c.clip.duration.toFixed(2)} с</small></button>
          <button aria-label={`Видалити ${c.clip.name}`} disabled={draft.layers.some(l => l.clipId === c.id)} onClick={() => { setClips(clips.filter(x => x.id !== c.id)); if (selected === c.id) { setSelected(''); pause(); } }}><Trash2 size={13} /></button>
        </div>)}</div>
        {entry && !editing && <div className="as-section"><label>Назва кліпу<input value={rename} onChange={e => setRename(e.target.value)} /></label><button disabled={!rename.trim()} onClick={() => { const clip = entry.clip.clone(); clip.name = uniqueClipName(rename, clips.filter(c => c.id !== entry.id)); setRename(clip.name); setClips(clips.map(c => c.id === entry.id ? { ...c, clip } : c)); }}>Перейменувати</button><button onClick={() => startDraft(entry)}>Редагувати копію</button></div>}
        <button disabled={!root || !!busy} onClick={() => startDraft()}><Plus size={15} /> Нова анімація</button>
        {root && !editing && <button onClick={() => { setEditing(true); pause(); seek(0); }}>Повернутися до композиції</button>}
      </aside>
      <section className="as-stage">
        <div className="as-stage-bar"><button disabled={!weightEditor?.meshes.length} aria-pressed={weightMode} onClick={() => { pause(); setWeightMode(!weightMode); }}>Ваги шкіри</button><>{weightMode && <div className="as-row" role="group" aria-label="Керування вагами"><button aria-pressed={!weightNavigation} onClick={() => setWeightNavigation(false)}>Пензель</button><button aria-pressed={weightNavigation} onClick={() => setWeightNavigation(true)}>Огляд</button></div>}</><span>{restPreview ? 'Початкова поза моделі' : editing ? 'Композиція' : entry?.clip.name ?? 'Перегляд персонажа'}</span><label><input type="checkbox" disabled={!root} checked={restPreview} onChange={e => { pause(); setRestPreview(e.target.checked); }} /> Без анімації</label><label><input type="checkbox" checked={skeleton} onChange={e => setSkeleton(e.target.checked)} /> Скелет</label></div>
        <div className="as-canvas">{root ? <StudioViewport root={root} painting={weightMode && weightEditor ? { editor: weightEditor, navigation: weightNavigation, mesh: weightMesh, bone: selectedBone, fallback: fallbackBone, radius: brushRadius, strength: brushStrength, mode: brushMode, heatmap, revision: weightRevision, onChange: weightsChanged } : undefined} clip={restPreview ? null : preview} restPreview={restPreview} transport={transport} selectedBone={selectedBone} skeleton={skeleton} editing={editing && !restPreview} keys={draft.keys} onTime={setTime} onPause={pause} onRotate={rotate} /> : <div className="as-empty"><div className="as-empty-symbol">↗</div><h2>Дайте персонажу рух</h2><p>Завантажте персонажа Mixamo, додайте його анімації та складіть власний набір.</p><button className="as-primary" disabled={!!busy} onClick={() => characterInput.current?.click()}><Upload size={16} /> Обрати персонажа</button><small>FBX / GLB / glTF · файли залишаються на вашому пристрої</small></div>}</div>
        <div className="as-transport"><button aria-label={playing ? 'Пауза' : 'Відтворити'} disabled={!preview || !!busy || restPreview || weightMode} onClick={() => { transport.current.playing = !playing; setPlaying(!playing); }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button><button aria-label="На початок" onClick={() => { pause(); seek(0); }}><RotateCcw size={16} /></button><input aria-label="Час анімації" type="range" min={0} max={duration} step={1 / 30} value={Math.min(time, duration)} onChange={e => { pause(); seek(Number(e.target.value)); }} /><span>{time.toFixed(2)} / {duration.toFixed(2)} с</span><select aria-label="Швидкість перегляду" defaultValue="1" onChange={e => { transport.current.speed = Number(e.target.value); }}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></div>
        <p className="as-help as-stage-hint">{weightMode ? (weightNavigation ? 'Огляд: один палець або ліва кнопка — обертання; два пальці — масштаб і переміщення. Для малювання натисніть «Пензель».' : 'Пензель: проведіть одним пальцем або лівою кнопкою по поверхні. Для обертання дотиком натисніть «Огляд». Права кнопка — обертання; колесо — масштаб.') : 'Миша — огляд · колесо — масштаб · оберіть кістку для редагування обертання'}</p>
        {editing && root && <div className="as-composer"><div className="as-section-title"><h2>02 / Композиція</h2><div><button disabled={!undo.length} onClick={() => { setRedo(h => [draft, ...h]); setDraft(undo[undo.length - 1]); setUndo(undo.slice(0, -1)); }}>Скасувати</button><button disabled={!redo.length} onClick={() => { setUndo(h => [...h, draft]); setDraft(redo[0]); setRedo(redo.slice(1)); }}>Повторити</button></div></div>
          <div className="as-row"><label>Назва<input value={draft.name} onChange={e => edit({ ...draft, name: e.target.value })} /></label><label>Тривалість, с<input type="number" min="0.1" max="60" step="0.1" value={draft.duration} onChange={e => { const value = e.target.valueAsNumber; if (Number.isFinite(value) && value >= 0.1 && value <= 60) { edit({ ...draft, duration: value, keys: draft.keys.filter(k => k.time <= value) }); seek(Math.min(time, value)); } }} /></label></div>
          <p className="as-help">Поєднайте ходьбу для низу тіла з рухом рук для верху. Вага визначає внесок кожного шару. Кліпи починаються разом.</p>
          {draft.layers.map((l, index) => <div className="as-layer" key={l.id}><div className="as-row"><strong>Шар {index + 1}</strong><select aria-label={`Кліп шару ${index + 1}`} value={l.clipId} onChange={e => { const c = clips.find(c => c.id === e.target.value)!; changeLayer(l.id, { clipId: c.id, start: 0, end: c.clip.duration }); }}>{clips.map(c => <option key={c.id} value={c.id}>{c.clip.name}</option>)}</select><button aria-label={`Видалити шар ${index + 1}`} onClick={() => edit({ ...draft, layers: draft.layers.filter(x => x.id !== l.id) })}><Trash2 size={14} /></button></div>
            <div className="as-row"><label>Частина тіла<select value={l.mask} onChange={e => changeLayer(l.id, { mask: e.target.value as Mask })}>{masks.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Вага {Math.round(l.weight * 100)}%<input type="range" min="0" max="1" step="0.05" value={l.weight} onChange={e => changeLayer(l.id, { weight: Number(e.target.value) })} /></label></div>
            <div className="as-row">{(['start', 'end', 'speed'] as const).map((field, i) => <label key={field}>{['Від, с', 'До, с', 'Швидкість'][i]}<input type="number" min={field === 'speed' ? 0.1 : 0} step="0.1" value={l[field]} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) changeLayer(l.id, { [field]: e.target.valueAsNumber }); }} /></label>)}<label className="as-check"><input type="checkbox" checked={l.loop} onChange={e => changeLayer(l.id, { loop: e.target.checked })} /> Цикл</label></div></div>)}
          <div className="as-row"><button disabled={!clips.length || draft.layers.length >= 8} onClick={() => edit({ ...draft, layers: [...draft.layers, makeLayer(entry ?? clips[0])] })}><Plus size={15} /> Додати шар</button><button className="as-primary" disabled={!compiled.clip || !draft.name.trim() || !!busy} onClick={saveDraft}>Зберегти кліп у набір</button></div>
          {compiled.error && <p role="alert" className="as-error">{compiled.error}</p>}
          <p className="as-help">Перед експортом збережіть композицію у набір. Запікається у 30 FPS; тривалість до 60 с.</p>
        </div>}
      </section>
      <aside className="as-panel as-inspector"><h2>03 / Кістки та ключі</h2><input aria-label="Пошук кістки" placeholder="Пошук: hand, spine…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="as-bones">{bones.filter(b => b.toLowerCase().includes(search.toLowerCase())).map(b => <button key={b} aria-pressed={selectedBone === b} className={selectedBone === b ? 'active' : ''} onClick={() => setSelectedBone(b)}>{b.replace(/^mixamorig[:_]?/, '')}</button>)}</div>
        {weightMode && weightEditor && <div className="as-weight-controls">
          <h3>Пензель ваг: {selectedBone}</h3>
          <label>Поверхня<select aria-label="Поверхня для ваг" value={weightMesh} onChange={e => { weightEditor.finish(); setWeightMesh(Number(e.target.value)); const mesh = weightEditor.meshes[Number(e.target.value)]; setSelectedBone(mesh.skeleton.bones[0]?.name ?? ''); setFallbackBone(mesh.skeleton.bones[1]?.name ?? ''); }}>{weightEditor.meshes.map((mesh, i) => <option key={mesh.uuid} value={i}>{mesh.name || `Поверхня ${i + 1}`}</option>)}</select></label>
          <label>Дія<select aria-label="Дія пензля" value={brushMode} onChange={e => setBrushMode(e.target.value as BrushMode)}><option value="add">Посилити вплив</option><option value="remove">Послабити вплив</option><option value="smooth">Згладити перехід</option></select></label>
          <label>Радіус: {brushRadius.toFixed(2)}<input aria-label="Радіус пензля" type="range" min="0.01" max="0.3" step="0.01" value={brushRadius} onChange={e => setBrushRadius(Number(e.target.value))} /></label>
          <label>Сила: {Math.round(brushStrength * 100)}%<input aria-label="Сила пензля" type="range" min="0.01" max="1" step="0.01" value={brushStrength} onChange={e => setBrushStrength(Number(e.target.value))} /></label>
          <label>Резервна кістка<select aria-label="Резервна кістка" value={fallbackBone} onChange={e => setFallbackBone(e.target.value)}>{weightEditor.meshes[weightMesh]?.skeleton.bones.map(b => <option key={b.uuid} value={b.name}>{b.name}</option>)}</select></label>
          <p className="as-help">Решта ваги розподіляється між іншими впливами вершини. Якщо їх немає — переходить до резервної кістки.</p>
          {(selectedBone === fallbackBone || !weightEditor.meshes[weightMesh]?.skeleton.bones.some(b => b.name === selectedBone)) && <p role="status" className="as-help">Оберіть кістку цієї поверхні та іншу резервну кістку, щоб малювати.</p>}
          <label className="as-check"><input type="checkbox" checked={heatmap} onChange={e => setHeatmap(e.target.checked)} /> Кольори впливу</label>
          <div className="as-weight-legend">0% · синій → зелений → червоний · 100%</div>
          <div className="as-row"><button disabled={!weightEditor.undoStack.length} onClick={() => { weightEditor.undo(); weightsChanged(); }}>Скасувати мазок</button><button disabled={!weightEditor.redoStack.length} onClick={() => { weightEditor.redo(); weightsChanged(); }}>Повторити мазок</button></div>
          <button onClick={() => { weightEditor.reset(weightMesh); weightsChanged(); }}>Відновити ваги поверхні</button>
          <p className="as-help">Для сідниць спробуйте посилити Hips і згладити перехід до UpLeg. Почніть із сили 10–15%. Вимкніть кольори, щоб оцінити форму. Зміни діють у всіх кліпах та зберігаються в експорті.</p>
        </div>}
        {!root && <p className="as-help">Скелет з’явиться після завантаження персонажа.</p>}
        {root && restPreview && <p className="as-help">Показано початкову позу імпортованої моделі без кліпів і власних ключів. Вимкніть «Без анімації», щоб повернутися до того самого моменту та продовжити редагування.</p>}
        {root && !editing && !weightMode && <p className="as-help">Відкрийте «Редагувати копію» або створіть нову анімацію, щоб змінювати пози.</p>}
        {root && editing && !restPreview && !weightMode && <><h3>{selectedBone.replace(/^mixamorig[:_]?/, '')}</h3><p className="as-help">Обертання відносно анімації, у градусах. Зміна осі або 3D-маніпулятора записує ключ у поточний момент.</p><div className="as-row">{rotation.map((value, axis) => <label key={axis}>{['X', 'Y', 'Z'][axis]}<input aria-label={`Обертання ${['X', 'Y', 'Z'][axis]}`} type="number" step="1" value={value} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) { const next = [...rotation] as [number, number, number]; next[axis] = e.target.valueAsNumber; rotate(next); } }} /></label>)}</div>
          <button onClick={() => rotate(rotation)}>Ключ у {time.toFixed(2)} с</button><button onClick={() => rotate([0, 0, 0])}>Нульове обертання</button>
          <div className="as-keys">{draft.keys.filter(k => k.bone === selectedBone).sort((a, b) => a.time - b.time).map(k => <div key={k.time}><button onClick={() => { pause(); seek(k.time); }}>◆ {k.time.toFixed(2)} с</button><button aria-label={`Видалити ключ ${k.time}`} onClick={() => edit({ ...draft, keys: draft.keys.filter(x => x !== k) })}><Trash2 size={13} /></button></div>)}</div><p className="as-help">Ключі з’єднуються плавним обертанням. Для циклу задайте однакові пози на початку та в кінці.</p></>}
      </aside>
    </fieldset>
  </main>;
}

function disposeAssetIfPresent(root: Object3D | null) { if (root) disposeAsset(root); }

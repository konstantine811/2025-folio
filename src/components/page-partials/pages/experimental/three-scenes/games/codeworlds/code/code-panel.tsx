import { useRef, useState } from "react";
import { EXAMPLES } from "./examples";
import { SOURCE_LIMIT } from "./world-model";

export type CodePanelProps = {
  source: string; onChange: (source: string) => void; onRun: () => void;
  onSave: () => void; onCancel: () => void; busy: boolean;
  messages: string[]; failed: boolean; saved: string;
  embedded?: boolean;
};
export function CodePanel({ source, onChange, onRun, onSave, onCancel, busy, messages, failed, saved, embedded = false }: CodePanelProps) {
  const [help, setHelp] = useState(false);
  const gutter = useRef<HTMLDivElement>(null);
  return <aside className={`flex min-h-0 w-full flex-col bg-[#111b23] text-slate-200 ${embedded ? "h-full rounded overflow-hidden" : "border-l border-white/10 lg:w-[40%] lg:min-w-[350px]"}`} aria-label="Редактор світу">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
      <div><span className="mr-2 text-emerald-300">{`</>`}</span><strong className="text-sm">world.js</strong><span className="ml-3 text-xs text-slate-500">JavaScript</span></div>
      <button className="text-xs text-emerald-300 hover:text-white" onClick={() => setHelp(!help)}>{help ? "Сховати API" : "Довідник API"}</button>
    </div>
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
      <label htmlFor="cw-example" className="text-xs text-slate-400">Приклад</label>
      <select id="cw-example" defaultValue="" className="min-w-0 flex-1 rounded bg-slate-800 px-2 py-1 text-xs" onChange={e => { const example = EXAMPLES[Number(e.target.value)]; if (example) onChange(example.code); e.target.value = ""; }}>
        <option value="" disabled>Обрати шаблон…</option>
        {EXAMPLES.map((example, i) => <option key={example.name} value={i}>{example.name}</option>)}
      </select>
    </div>
    {help && <div className="max-h-64 overflow-auto border-b border-white/10 bg-[#192732] p-4 text-xs leading-6">
      <p className="font-semibold text-emerald-300">Код → об’єкти → пригоди</p>
      <p><code>world.name("Назва")</code> — назва світу.</p>
      <p><code>world.ground("#829b83")</code> — колір землі.</p>
      <p><code>world.spawn(x, y, z)</code> — позиція ніг персонажа.</p>
      <p><code>world.create("block", {`{ position: [0, 0, 5], size: [2, 3, 2], color: "#d4b27a" }`})</code></p>
      <p>Типи: <b>block · platform · tree · crystal</b>. Position — центр основи; size — ширина, висота, глибина. Необов’язковий id має бути унікальним.</p>
      <p>Доступні let, const, масиви, for, if, арифметика, порівняння та console.log. Функції, імпорти й браузерні API поки не підтримуються.</p>
      <p className="text-slate-400">До 200 об’єктів. x/z: −21…21; y: 0…20; size: 0.2…12. Кожен запуск створює світ заново.</p>
    </div>}
    <div className="relative flex min-h-[220px] flex-1 overflow-hidden">
      <div ref={gutter} aria-hidden="true" className="w-11 shrink-0 overflow-hidden select-none border-r border-white/5 py-4 pr-2 text-right font-mono text-[12px] leading-6 text-slate-600">
        {source.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea aria-label="JavaScript код світу" value={source} maxLength={SOURCE_LIMIT} spellCheck={false}
        className="h-full min-h-[220px] w-full resize-none whitespace-pre bg-transparent px-3 py-4 font-mono text-[12px] leading-6 text-emerald-100 outline-none focus:bg-white/[0.02]"
        wrap="off" onChange={e => onChange(e.target.value)} onScroll={e => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); onRun(); }
          if (e.key === "Tab") { e.preventDefault(); const field = e.currentTarget, start = field.selectionStart, end = field.selectionEnd; onChange(source.slice(0, start) + "  " + source.slice(end)); requestAnimationFrame(() => field.setSelectionRange(start + 2, start + 2)); }
        }} />
    </div>
    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-3">
      <button onClick={busy ? onCancel : onRun} className="rounded-md bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200">{busy ? "Зупинити" : "▶ Створити світ"}</button>
      <button onClick={onSave} className="rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/5">Зберегти</button>
      <span className="text-[11px] text-slate-500">⌘ / Ctrl + Enter</span>
      {saved && <p className="w-full text-xs text-slate-400" role="status">{saved}</p>}
    </div>
    <div className="max-h-36 min-h-24 overflow-auto border-t border-white/10 bg-[#0c141b] p-3 font-mono text-xs" aria-live="polite">
      <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">Консоль</p>
      {messages.map((message, i) => <p key={i} className={`whitespace-pre-wrap break-words ${failed ? "text-rose-300" : "text-emerald-200"}`}>{message}</p>)}
    </div>
  </aside>;
}

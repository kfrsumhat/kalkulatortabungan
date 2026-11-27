import type React from "react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { getIn } from "../../lib/path.ts";
import { useAdmin } from "./ctx.tsx";

export function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: ReactNode; id: string }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-mut">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-[#b3261e]">{error}</p>}
    </div>
  );
}

interface P { label: string; path: string; hint?: string }
export function TextF({ label, path, hint, area, type = "text" }: P & { area?: boolean; type?: "text" | "date" | "color" }) {
  const { cfg, set, errors } = useAdmin(); const id = useId(); const v = String(getIn(cfg, path) ?? "");
  const common = { id, value: v, className: "fld", "aria-invalid": !!errors[path], onChange: (e: { target: { value: string } }) => set(path, e.target.value) };
  return <Field label={label} hint={hint} error={errors[path]} id={id}>{area ? <textarea rows={4} {...common} /> : <input type={type} {...common} />}</Field>;
}
export function NumF({ label, path, hint, step = "any" }: P & { step?: string }) {
  const { cfg, set, errors } = useAdmin(); const id = useId(); const v = getIn(cfg, path) as number;
  const [txt, setTxt] = useState(String(v));
  useEffect(() => { if (parseFloat(txt) !== v) setTxt(String(v)); /* sinkron saat berubah dari luar */ }, [v]); // eslint-disable-line
  return (
    <Field label={label} hint={hint} error={errors[path]} id={id}>
      <input id={id} className="fld" type="number" step={step} inputMode="decimal" value={txt} aria-invalid={!!errors[path]}
        onChange={(e) => { setTxt(e.target.value); const n = parseFloat(e.target.value); set(path, isNaN(n) ? NaN : n); }} />
    </Field>
  );
}
export function Toggle({ label, path }: { label: string; path: string }) {
  const { cfg, set } = useAdmin(); const id = useId();
  return (
    <label htmlFor={id} className="mb-3 flex items-center gap-3 text-sm font-semibold">
      <input id={id} type="checkbox" className="h-5 w-5 accent-[var(--g)]" checked={!!getIn(cfg, path)} onChange={(e) => set(path, e.target.checked)} />{label}
    </label>
  );
}
export function SelectF({ label, path, options }: { label: string; path: string; options: [string, string][] }) {
  const { cfg, set } = useAdmin(); const id = useId();
  return <Field label={label} id={id}><select id={id} className="fld" value={String(getIn(cfg, path))} onChange={(e) => set(path, e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>;
}

/** Daftar angka dipisah koma (tenor, chip nominal). */
export function NumList({ label, path, hint }: P) {
  const { cfg, set, errors } = useAdmin(); const id = useId(); const v = getIn(cfg, path) as number[];
  const [txt, setTxt] = useState(v.join(", "));
  useEffect(() => { const cur = txt.split(",").map((x) => x.trim()).filter(Boolean).map(Number); if (JSON.stringify(cur) !== JSON.stringify(v)) setTxt(v.join(", ")); }, [v]); // eslint-disable-line
  return (
    <Field label={label} hint={hint} error={errors[path]} id={id}>
      <input id={id} className="fld" inputMode="numeric" value={txt} aria-invalid={!!errors[path]}
        onChange={(e) => { setTxt(e.target.value); set(path, e.target.value.split(",").map((x) => x.trim()).filter(Boolean).map(Number).filter((n) => !isNaN(n))); }} />
    </Field>
  );
}

const Btn = ({ children, onClick, label, danger }: { children: ReactNode; onClick: () => void; label: string; danger?: boolean }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg border border-bd bg-white text-sm hover:bg-g2 ${danger ? "text-[#b3261e]" : ""}`}>{children}</button>
);
export const AddBtn = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button type="button" onClick={onClick} className="rounded-xl border-2 border-dashed border-g/50 px-4 py-2 text-sm font-bold text-g hover:bg-g2">{children}</button>
);
export { Btn };

/** Editor daftar teks: tambah / ubah / hapus / urut (tombol + drag). */
export function StrList({ label, path, hint, rows = 3 }: P & { rows?: number }) {
  const { cfg, set, errors } = useAdmin(); const items = getIn(cfg, path) as string[];
  const [drag, setDrag] = useState<number | null>(null);
  const move = (i: number, j: number) => { if (j < 0 || j >= items.length) return; const n = items.slice(); const [x] = n.splice(i, 1); n.splice(j, 0, x); set(path, n); };
  return (
    <fieldset className="mb-4">
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      {hint && <p className="mb-2 text-xs text-mut">{hint}</p>}
      <ol className="space-y-2">
        {items.map((t, i) => (
          <li key={i} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            className="flex items-start gap-2 rounded-xl border border-bd bg-white p-2">
            <span className="cursor-grab select-none px-1 pt-2 text-mut" aria-hidden="true">⠿</span>
            <textarea aria-label={`${label} ${i + 1}`} rows={rows} className="fld !border !py-2 text-sm" value={t} onChange={(e) => set(path, items.map((x, j) => (j === i ? e.target.value : x)))} />
            <div className="flex flex-col gap-1"><Btn label="Naikkan" onClick={() => move(i, i - 1)}>↑</Btn><Btn label="Turunkan" onClick={() => move(i, i + 1)}>↓</Btn><Btn danger label="Hapus" onClick={() => set(path, items.filter((_, j) => j !== i))}>✕</Btn></div>
          </li>
        ))}
      </ol>
      {errors[path] && <p role="alert" className="mt-1 text-xs font-semibold text-[#b3261e]">{errors[path]}</p>}
      <div className="mt-2"><AddBtn onClick={() => set(path, [...items, ""])}>+ Tambah poin</AddBtn></div>
    </fieldset>
  );
}

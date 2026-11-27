import { useEffect, useState } from "react";
import type { Product } from "../../types/config.ts";
import { useAdmin } from "./ctx.tsx";
import { AddBtn, Btn, Field, NumF, NumList, SelectF, StrList, TextF, Toggle } from "./fields.tsx";
import { useId } from "react";

const blank = (id: string): Product => ({
  id, type: "simple", active: true, icon: "💰", nm: "Produk Baru", sub: "Subjudul", desc: "", rate: 3, basis: "30", hb: 30, tenor: [1, 3, 6, 12],
  dayMap: {}, quick: [10e6, 50e6, 100e6, 500e6, 1e9], notes: [], terms: [], lblRate: "Suku bunga", lblGross: "Bunga kotor", lblNet: "Bunga bersih diterima",
  tiers: [], tab: 0, end: "2099-12-31", minDays: 30, promoTitle: "", promoBody: "", prime: 0,
});

function TierEditor({ i }: { i: number }) {
  const { cfg, update, errors } = useAdmin(); const p = cfg.products[i]; const id = useId();
  const ch = (fn: (t: [number, number][]) => [number, number][]) => update((c) => { const n = structuredClone(c); n.products[i].tiers = fn(n.products[i].tiers); return n; });
  return (
    <fieldset className="mb-4"><legend className="mb-1 text-sm font-semibold">Tier hadiah (saldo minimal → % p.a.)</legend>
      {p.tiers.map((t, j) => (
        <div key={j} className="mb-2 grid grid-cols-[1fr_90px_36px] gap-2">
          <input aria-label={`Tier ${j + 1} saldo minimal`} id={id + j} type="number" className="fld" value={t[0]} aria-invalid={!!errors[`products.${i}.tiers.${j}.0`]} onChange={(e) => ch((a) => a.map((x, k) => (k === j ? [parseFloat(e.target.value) || 0, x[1]] : x)))} />
          <input aria-label={`Tier ${j + 1} persen`} type="number" step="any" className="fld" value={t[1]} aria-invalid={!!errors[`products.${i}.tiers.${j}.1`]} onChange={(e) => ch((a) => a.map((x, k) => (k === j ? [x[0], parseFloat(e.target.value) || 0] : x)))} />
          <Btn danger label="Hapus tier" onClick={() => ch((a) => a.filter((_, k) => k !== j))}>✕</Btn>
        </div>
      ))}
      {Object.entries(errors).filter(([k]) => k.startsWith(`products.${i}.tiers`)).map(([k, m]) => <p key={k} role="alert" className="text-xs font-semibold text-[#b3261e]">{m}</p>)}
      <AddBtn onClick={() => ch((a) => [...a, [(a.length ? a[a.length - 1][0] * 2 : 10000000), (a.length ? a[a.length - 1][1] : 3)]])}>+ Tambah tier</AddBtn>
    </fieldset>
  );
}

function DayMapEditor({ i }: { i: number }) {
  const { cfg, set, errors } = useAdmin(); const m = cfg.products[i].dayMap;
  const init = () => Object.entries(m).map(([k, v]) => [+k, v] as [number, number]).sort((a, b) => a[0] - b[0]);
  const [rows, setRows] = useState<[number, number][]>(init);
  useEffect(() => { if (JSON.stringify(Object.fromEntries(rows.filter((r) => r[0] > 0 && r[1] > 0))) !== JSON.stringify(m)) setRows(init()); }, [m]); // eslint-disable-line
  const commit = (r: [number, number][]) => { setRows(r); set(`products.${i}.dayMap`, Object.fromEntries(r.filter((x) => x[0] > 0 && x[1] > 0))); };
  return (
    <fieldset className="mb-4"><legend className="mb-1 text-sm font-semibold">Tabel tenor → jumlah hari</legend>
      {rows.map((r, j) => (
        <div key={j} className="mb-2 grid grid-cols-[1fr_1fr_36px] gap-2">
          <input aria-label={`Baris ${j + 1} tenor (bulan)`} type="number" className="fld" value={r[0]} onChange={(e) => commit(rows.map((x, k) => (k === j ? [parseInt(e.target.value) || 0, x[1]] : x)))} />
          <input aria-label={`Baris ${j + 1} jumlah hari`} type="number" className="fld" value={r[1]} onChange={(e) => commit(rows.map((x, k) => (k === j ? [x[0], parseInt(e.target.value) || 0] : x)))} />
          <Btn danger label="Hapus baris" onClick={() => commit(rows.filter((_, k) => k !== j))}>✕</Btn>
        </div>
      ))}
      <p className="mb-2 text-xs text-mut">Kolom kiri: tenor (bulan); kolom kanan: jumlah hari.</p>
      {errors[`products.${i}.dayMap`] && <p role="alert" className="text-xs font-semibold text-[#b3261e]">{errors[`products.${i}.dayMap`]}</p>}
      <AddBtn onClick={() => commit([...rows, [0, 0]])}>+ Tambah baris</AddBtn>
    </fieldset>
  );
}

export function ProductsTab() {
  const { cfg, update } = useAdmin();
  const [sel, setSel] = useState(0);
  const idx = Math.min(sel, cfg.products.length - 1);
  const p = cfg.products[idx];
  const edit = (fn: (a: Product[]) => Product[]) => update((c) => ({ ...c, products: fn(c.products.slice()) }));
  const uid = (base: string) => { let n = 1, id = base; while (cfg.products.some((x) => x.id === id)) id = `${base}-${++n}`; return id; };
  const move = (i: number, j: number) => { if (j < 0 || j >= cfg.products.length) return; edit((a) => { const [x] = a.splice(i, 1); a.splice(j, 0, x); return a; }); setSel(j); };
  const b = `products.${idx}.`;
  return (
    <div>
      <ul className="mb-3 space-y-1.5" aria-label="Daftar produk">
        {cfg.products.map((x, i) => (
          <li key={x.id} className={`flex items-center gap-1.5 rounded-xl border p-1.5 ${i === idx ? "border-g bg-g2" : "border-bd bg-white"}`}>
            <button type="button" onClick={() => setSel(i)} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left text-sm font-bold">
              <span aria-hidden="true">{x.icon}</span><span className="truncate">{x.nm}</span>{!x.active && <span className="rounded bg-bd px-1.5 text-[10px] font-semibold text-mut">nonaktif</span>}
            </button>
            <Btn label="Naikkan" onClick={() => move(i, i - 1)}>↑</Btn><Btn label="Turunkan" onClick={() => move(i, i + 1)}>↓</Btn>
            <Btn label="Duplikat" onClick={() => { edit((a) => { const cp = structuredClone(x); cp.id = uid(x.id + "-salinan"); cp.nm = x.nm + " (salinan)"; a.splice(i + 1, 0, cp); return a; }); setSel(i + 1); }}>⧉</Btn>
            <Btn danger label="Hapus produk" onClick={() => { if (cfg.products.length > 1 && confirm(`Hapus produk "${x.nm}"?`)) { edit((a) => a.filter((_, k) => k !== i)); setSel(0); } }}>✕</Btn>
          </li>
        ))}
      </ul>
      <div className="mb-5 flex flex-wrap gap-2">
        <AddBtn onClick={() => { edit((a) => [...a, blank(uid("produk"))]); setSel(cfg.products.length); }}>+ Tambah produk</AddBtn>
      </div>
      {p && (
        <section aria-label={`Edit ${p.nm}`} className="rounded-2xl border border-bd bg-white p-4">
          <Toggle label="Produk aktif (tampil di tab nasabah)" path={b + "active"} />
          <TextF label="Nama produk" path={b + "nm"} />
          <TextF label="Subjudul tab" path={b + "sub"} />
          <TextF label="Ikon (emoji)" path={b + "icon"} />
          <TextF label="Deskripsi produk" path={b + "desc"} area hint="Mendukung **tebal** dan placeholder {bank} {pajak} {asOf}." />
          <SelectF label="Jenis perhitungan" path={b + "type"} options={[["simple", "Bunga / bagi hasil sederhana"], ["du", "Hadiah bertingkat + tabungan (Double Untung)"], ["silah", "Hadiah SILAH (LPS − prime risk)"]]} />
          <hr className="my-4 border-bd" />
          {p.type === "simple" && (<>
            <NumF label="Suku bunga / bagi hasil (% p.a.)" path={b + "rate"} />
            <TextF label="Label baris suku (kosongkan untuk menyembunyikan)" path={b + "lblRate"} />
            <TextF label="Label nilai kotor" path={b + "lblGross"} /><TextF label="Label total bersih" path={b + "lblNet"} />
          </>)}
          {p.type === "silah" && (<><NumF label="Suku bunga LPS yang berlaku (%)" path={b + "rate"} /><NumF label="Prime risk (%)" path={b + "prime"} /><DayMapEditor i={idx} /></>)}
          {p.type === "du" && (<>
            <TierEditor i={idx} />
            <NumF label="Suku bunga tabungan (% p.a.)" path={b + "tab"} />
            <TextF label="Promo berlaku sampai" path={b + "end"} type="date" />
            <NumF label="Minimal penempatan (hari)" path={b + "minDays"} />
            <TextF label="Judul banner promo" path={b + "promoTitle"} hint="Placeholder: {promoEnd} {sisa} {minDays}" />
            <TextF label="Isi banner promo" path={b + "promoBody"} area />
          </>)}
          {p.type !== "du" && (<>
            <NumList label="Tenor (bulan, pisahkan koma)" path={b + "tenor"} hint="Unik dan terurut naik, mis. 1, 3, 6, 12." />
            <SelectF label="Cara hitung bawaan" path={b + "basis"} options={[["30", "30 hari/bulan"], ["cal", "Kalender 365 hari/tahun"]]} />
            <NumF label="Hari per bulan (mode 30 hari)" path={b + "hb"} />
          </>)}
          <NumList label="Chip nominal cepat (Rp, pisahkan koma)" path={b + "quick"} />
          <StrList label="Catatan produk" path={b + "notes"} />
          <StrList label="Syarat & Ketentuan produk" path={b + "terms"} hint="Placeholder: {bank} {pajak} {asOf} {promoEnd} {minDays} {tiers} {tab} {minNominal}" />
        </section>
      )}
    </div>
  );
}
void Field;

import type React from "react";
import { useRef, useState } from "react";
import { useConfig } from "../../hooks/useConfig.tsx";
import { fill, rp, waNo } from "../../lib/format.ts";
import { newSalt, sha256 } from "../../lib/hash.ts";
import { imageToDataUrl } from "../../lib/image.ts";
import { useAdmin } from "./ctx.tsx";
import { StrList, TextF, NumF, Toggle } from "./fields.tsx";

const Note = ({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) => (
  <p className={`mb-4 rounded-xl border p-3 text-xs leading-relaxed ${tone === "warn" ? "border-[#f2d98a] bg-[#fff8e1]" : "border-bd bg-g2"}`}>{children}</p>
);
const Btn = ({ children, onClick, kind = "primary", disabled }: { children: React.ReactNode; onClick: () => void; kind?: "primary" | "ghost"; disabled?: boolean }) => (
  <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${kind === "primary" ? "bg-g text-white" : "border border-bd bg-white"}`}>{children}</button>
);

export function GeneralTab() {
  const { cfg, set } = useAdmin();
  const up = (key: "logo" | "cover", o: Parameters<typeof imageToDataUrl>[1]) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    try { set(key, await imageToDataUrl(f, o)); } catch (err) { alert(err instanceof Error ? err.message : "Gagal memuat gambar."); }
  };
  return (<>
    <TextF label="Nama unit" path="unit" /><TextF label="Nama bank" path="bank" />
    <TextF label="Judul hero" path="heroTitle" hint="Placeholder: {unit} {bank}" /><TextF label="Tagline / subjudul" path="tagline" />
    <div className="mb-4"><span className="mb-1 block text-sm font-semibold">Logo</span>
      <img src={cfg.logo} alt="Pratinjau logo" className="mb-2 h-14 rounded-lg border border-bd bg-white p-1" />
      <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={up("logo", { maxW: 600, maxH: 300, type: "image/png" })} className="text-sm" />
      <p className="mt-1 text-xs text-mut">PNG/JPG/WebP/SVG. Otomatis diperkecil.</p>
    </div>
    <div className="mb-4"><span className="mb-1 block text-sm font-semibold">Sampul header</span>
      {cfg.cover ? <img src={cfg.cover} alt="Pratinjau sampul" className="mb-2 h-24 w-full rounded-lg border border-bd object-cover" /> : <p className="mb-2 rounded-lg border border-dashed border-bd p-3 text-xs text-mut">Belum ada sampul (header polos).</p>}
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={up("cover", { maxW: 1600, maxH: 600, type: "image/jpeg", q: 0.8 })} className="text-sm" />
      {cfg.cover && <div className="mt-2"><Btn kind="ghost" onClick={() => set("cover", "")}>Hapus sampul</Btn></div>}
      <p className="mt-1 text-xs text-mut">Disarankan 1600×500 px. Otomatis diperkecil & diberi lapisan warna utama agar teks tetap terbaca.</p>
    </div>
    <div className="grid grid-cols-2 gap-3"><TextF label="Warna utama" path="theme.primary" type="color" /><TextF label="Warna aksen" path="theme.accent" type="color" /></div>
    <TextF label="Format warna utama (#RRGGBB)" path="theme.primary" /><TextF label="Format warna aksen (#RRGGBB)" path="theme.accent" />
    <TextF label="SEO title" path="seo.title" /><TextF label="SEO description" path="seo.description" area />
  </>);
}

export function ContactTab() {
  const { cfg } = useAdmin();
  const sample = { bank: cfg.bank, unit: cfg.unit, produk: cfg.products[0]?.nm ?? "Produk", nominal: rp(100e6), periode: "jangka waktu 12 bulan", hari: 360, estimasi: rp(2761644), tanggalMulai: "", tanggalJatuhTempo: "" };
  return (<>
    <TextF label="Nomor WhatsApp Business" path="wa" hint={`Dinormalisasi otomatis → ${waNo(cfg.wa) || "-"}`} />
    <Note>Placeholder: {"{bank} {unit} {produk} {nominal} {periode} {hari} {estimasi} {tanggalMulai} {tanggalJatuhTempo}"}</Note>
    <TextF label="Template pesan — Daftar" path="waDaftar" area />
    <p className="-mt-2 mb-4 rounded-lg bg-white p-2 text-xs text-mut">Pratinjau: {fill(cfg.waDaftar, sample)}</p>
    <TextF label="Template pesan — Tanya" path="waTanya" area />
    <p className="-mt-2 mb-4 rounded-lg bg-white p-2 text-xs text-mut">Pratinjau: {fill(cfg.waTanya, sample)}</p>
    <TextF label="Teks pengaduan" path="cs" area /><TextF label="Kontak OJK" path="ojk" area /><TextF label="Catatan tambahan (opsional)" path="extra" area />
  </>);
}

export const TaxTab = () => (<><NumF label="Pajak atas bunga/bagi hasil/hadiah (%)" path="pajak" hint="0–100" /><TextF label="Tarif berlaku per tanggal" path="asOf" type="date" /></>);

export const InfoTab = () => (<>
  <StrList label="Informasi Penting" path="info" rows={4} hint="Variabel: {bank} {pajak} {asOf} {hitung}. Gunakan **teks** untuk menebalkan. Catatan & S&K per produk ada di tab Produk." />
  <TextF label="Teks disclaimer (banner kuning)" path="texts.disclaimer" area />
  <TextF label="Teks privasi WhatsApp" path="texts.privacy" area />
  <TextF label="Cara hitung — mode 30 hari/bulan" path="texts.hitung30" hint="Placeholder: {hb}" area />
  <TextF label="Cara hitung — kalender" path="texts.hitungCal" area />
  <TextF label="Cara hitung — Double Untung" path="texts.hitungDu" area />
  <TextF label="Cara hitung — SILAH" path="texts.hitungSilah" area />
</>);

export const AnimTab = () => (<><Toggle label="Smooth scroll (Lenis)" path="anim.smoothScroll" /><Toggle label="Animasi judul per kata (GSAP)" path="anim.splitTitles" />
  <Note>Pengguna dengan pengaturan "kurangi gerakan" di perangkatnya selalu mendapat versi tanpa animasi, apa pun pilihan di sini.</Note></>);

export function SecurityTab() {
  const { update } = useAdmin(); const [a, setA] = useState(""); const [b, setB] = useState(""); const [msg, setMsg] = useState("");
  const save = async () => {
    if (a.length < 6) return setMsg("Minimal 6 karakter.");
    if (a !== b) return setMsg("Konfirmasi tidak sama.");
    const salt = newSalt(), hash = await sha256(salt, a);
    update((c) => ({ ...c, admin: { salt, hash } })); setA(""); setB(""); setMsg("Tersimpan di draft. Unduh & publikasikan config.json agar berlaku untuk semua.");
  };
  return (<>
    <Note tone="warn"><b>Jujur soal keamanan:</b> halaman ini statis tanpa server, jadi kata sandi hanya diperiksa di browser. Hash-nya ikut tersimpan di config.json yang bisa dibaca siapa pun. Ini sekadar pengaman agar nasabah tidak sengaja mengubah pengaturan — bukan keamanan sungguhan. Perubahan hanya sah setelah Anda mengganti file di repo.</Note>
    <label className="mb-1 block text-sm font-semibold" htmlFor="np1">Kata sandi / PIN baru</label><input id="np1" type="password" className="fld mb-3" value={a} onChange={(e) => setA(e.target.value)} autoComplete="new-password" />
    <label className="mb-1 block text-sm font-semibold" htmlFor="np2">Ulangi kata sandi</label><input id="np2" type="password" className="fld mb-3" value={b} onChange={(e) => setB(e.target.value)} autoComplete="new-password" />
    <Btn onClick={save}>Simpan kata sandi</Btn>{msg && <p role="status" className="mt-2 text-sm">{msg}</p>}
  </>);
}

export function ExportTab({ errorCount }: { errorCount: number }) {
  const { dirty, exportConfig, importConfig, history, snapshot, restore, resetToPublished, resetToDefault } = useConfig();
  const file = useRef<HTMLInputElement>(null); const [msg, setMsg] = useState("");
  return (<>
    {dirty && <Note tone="warn"><b>Perubahan belum dipublikasikan ke nasabah.</b> Saat ini hanya tampil sebagai pratinjau di browser ini.</Note>}
    <Note><b>Alur publikasi:</b> 1) klik <i>Unduh config.json</i> → 2) ganti file <code>public/config.json</code> di repo → 3) deploy ulang. Nasabah akan melihat versi baru setelah deploy selesai.</Note>
    {errorCount > 0 && <Note tone="warn">Masih ada {errorCount} kesalahan input (ditandai merah di tab lain). Perbaiki dulu sebelum mengunduh.</Note>}
    <div className="mb-5 flex flex-wrap gap-2">
      <Btn disabled={errorCount > 0} onClick={exportConfig}>⬇ Unduh config.json</Btn>
      <Btn kind="ghost" onClick={() => file.current?.click()}>⬆ Import config.json</Btn>
      <Btn kind="ghost" onClick={() => snapshot("Manual")}>Simpan versi</Btn>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setMsg(importConfig(await f.text()) ?? "Import berhasil (menjadi draft)."); e.target.value = ""; }} />
    </div>
    {msg && <p role="status" className="mb-4 text-sm">{msg}</p>}
    <div className="mb-5 flex flex-wrap gap-2">
      <Btn kind="ghost" onClick={() => confirm("Buang draft dan kembali ke versi terpublikasi?") && resetToPublished()}>Buang draft</Btn>
      <Btn kind="ghost" onClick={() => confirm("Reset semua ke data bawaan (dari file HTML awal)?") && resetToDefault()}>Reset ke default</Btn>
    </div>
    <h3 className="mb-2 text-sm font-bold">Riwayat 10 versi terakhir</h3>
    {history.length === 0 && <p className="text-sm text-mut">Belum ada riwayat.</p>}
    <ul className="space-y-1.5">{history.map((v) => (
      <li key={v.ts} className="flex items-center justify-between gap-2 rounded-xl border border-bd bg-white px-3 py-2 text-sm">
        <span>{new Date(v.ts).toLocaleString("id-ID")} · <span className="text-mut">{v.label}</span></span>
        <Btn kind="ghost" onClick={() => confirm("Restore versi ini sebagai draft?") && restore(v)}>Restore</Btn>
      </li>))}</ul>
  </>);
}

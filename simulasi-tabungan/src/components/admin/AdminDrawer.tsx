import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useConfig } from "../../hooks/useConfig.tsx";
import { newSalt, sha256 } from "../../lib/hash.ts";
import { setIn } from "../../lib/path.ts";
import { validate } from "../../lib/validate.ts";
import type { Config } from "../../types/config.ts";
import { ACtx } from "./ctx.tsx";
import { ProductsTab } from "./ProductsTab.tsx";
import { AnimTab, ContactTab, ExportTab, GeneralTab, InfoTab, SecurityTab, TaxTab } from "./OtherTabs.tsx";

const SESSION = "sim.admin.ok", FAILS = "sim.admin.fails", LOCK = "sim.admin.lock";
const ss = { get: (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* noop */ } }, del: (k: string) => { try { sessionStorage.removeItem(k); } catch { /* noop */ } } };

function Gate({ onOk }: { onOk: () => void }) {
  const { config, setConfig } = useConfig();
  const [pw, setPw] = useState(""), [pw2, setPw2] = useState(""), [msg, setMsg] = useState(""), [now, setNow] = useState(Date.now());
  const lockUntil = +(ss.get(LOCK) ?? 0), locked = lockUntil > now;
  useEffect(() => { if (!locked) return; const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [locked]);
  const first = !config.admin;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    if (!crypto?.subtle) { setMsg("Browser ini tidak mendukung SHA-256 (butuh HTTPS atau localhost)."); return; }
    if (first) {
      if (pw.length < 6) return setMsg("Minimal 6 karakter.");
      if (pw !== pw2) return setMsg("Konfirmasi tidak sama.");
      const salt = newSalt(); setConfig((c) => ({ ...c, admin: { salt, hash: "" } }));
      const hash = await sha256(salt, pw); setConfig((c) => ({ ...c, admin: { salt, hash } }));
      ss.set(SESSION, "1"); return onOk();
    }
    const a = config.admin!;
    if ((await sha256(a.salt, pw)) === a.hash) { ss.del(FAILS); ss.set(SESSION, "1"); return onOk(); }
    const n = +(ss.get(FAILS) ?? 0) + 1;
    if (n >= 5) { ss.set(LOCK, String(Date.now() + 60_000)); ss.del(FAILS); setNow(Date.now()); setMsg("5 kali salah. Terkunci 60 detik."); }
    else { ss.set(FAILS, String(n)); setMsg(`Kata sandi salah (${n}/5).`); }
    setPw("");
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 p-5">
      <h2 className="font-display text-2xl font-bold text-g">{first ? "Buat kata sandi admin" : "Masuk Admin"}</h2>
      {first && <p className="text-sm text-mut">Pertama kali: tetapkan kata sandi (min. 6 karakter). Tidak ada kata sandi bawaan.</p>}
      <label className="block text-sm font-semibold" htmlFor="pw">Kata sandi</label>
      <input id="pw" type="password" autoFocus className="fld" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={first ? "new-password" : "current-password"} disabled={locked} />
      {first && (<><label className="block text-sm font-semibold" htmlFor="pw2">Ulangi kata sandi</label><input id="pw2" type="password" className="fld" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></>)}
      {locked && <p role="alert" className="text-sm font-semibold text-[#b3261e]">Terkunci. Coba lagi dalam {Math.ceil((lockUntil - now) / 1000)} detik.</p>}
      {msg && !locked && <p role="alert" className="text-sm font-semibold text-[#b3261e]">{msg}</p>}
      <button disabled={locked} className="w-full rounded-xl bg-g px-4 py-3 font-bold text-white disabled:opacity-50">{first ? "Simpan & masuk" : "Masuk"}</button>
      <p className="rounded-xl border border-[#f2d98a] bg-[#fff8e1] p-3 text-xs">Catatan jujur: proteksi ini hanya berjalan di sisi klien (browser) dan bukan keamanan sungguhan. Perubahan baru berlaku untuk nasabah setelah file config.json diganti di repo dan di-deploy.</p>
    </form>
  );
}

const TABS = ["Umum & Branding", "Kontak & WhatsApp", "Pajak & Tanggal", "Produk", "Info & S&K", "Animasi", "Keamanan", "Ekspor & Riwayat"] as const;

export default function AdminDrawer({ onClose }: { onClose: () => void }) {
  const { config, setConfig, dirty } = useConfig();
  const [ok, setOk] = useState(ss.get(SESSION) === "1");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Umum & Branding");
  const errors = useMemo(() => validate(config), [config]);
  const nErr = Object.keys(errors).length;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => { window.removeEventListener("keydown", k); prev?.focus?.(); };
  }, [onClose]);

  const ctx = useMemo(() => ({
    cfg: config, errors,
    set: (path: string, v: unknown) => setConfig((c) => setIn(c, path, v)),
    update: (fn: (c: Config) => Config) => setConfig(fn),
  }), [config, errors, setConfig]);

  return (
    <div className="fixed inset-0 z-50">
      <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Panel Admin"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-bg shadow-2xl outline-none">
        <div className="flex items-center justify-between border-b border-bd bg-white px-4 py-3">
          <div><h2 className="font-display text-lg font-bold text-g">⚙ Admin</h2>
            <p className="text-xs text-mut">{dirty ? "Draft belum dipublikasikan" : "Sama dengan versi terpublikasi"}{nErr ? ` · ${nErr} kesalahan` : ""}</p></div>
          <div className="flex gap-2">
            {ok && <button className="rounded-lg border border-bd px-3 py-1.5 text-sm" onClick={() => { ss.del(SESSION); setOk(false); }}>Keluar</button>}
            <button className="rounded-lg bg-g px-3 py-1.5 text-sm font-bold text-white" onClick={onClose} aria-label="Tutup panel admin">Tutup</button>
          </div>
        </div>
        {!ok ? <div className="flex-1 overflow-y-auto" data-lenis-prevent><Gate onOk={() => setOk(true)} /></div> : (
          <>
            <div role="tablist" aria-label="Menu admin" className="flex gap-1.5 overflow-x-auto border-b border-bd bg-white px-3 py-2" data-lenis-prevent>
              {TABS.map((t) => (
                <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${t === tab ? "bg-g text-white" : "bg-g2 text-ink"}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4" data-lenis-prevent>
              <ACtx.Provider value={ctx}>
                {tab === "Umum & Branding" && <GeneralTab />}
                {tab === "Kontak & WhatsApp" && <ContactTab />}
                {tab === "Pajak & Tanggal" && <TaxTab />}
                {tab === "Produk" && <ProductsTab />}
                {tab === "Info & S&K" && <InfoTab />}
                {tab === "Animasi" && <AnimTab />}
                {tab === "Keamanan" && <SecurityTab />}
                {tab === "Ekspor & Riwayat" && <ExportTab errorCount={nErr} />}
              </ACtx.Provider>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}

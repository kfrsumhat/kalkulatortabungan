import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useConfig } from "./hooks/useConfig.tsx";
import { useLenisGsap } from "./hooks/useLenisGsap.ts";
import { useReducedMotion } from "./hooks/useReducedMotion.ts";
import { fixDates, simulate } from "./lib/calc.ts";
import { fd } from "./lib/format.ts";
import { scrollToEl } from "./lib/lenisRef.ts";
import { fillAll } from "./lib/text.ts";
import { waLink } from "./lib/wa.ts";
import { Header } from "./components/Header.tsx";
import { ProductTabs } from "./components/ProductTabs.tsx";
import { InputCard } from "./components/InputCard.tsx";
import { Results } from "./components/Results.tsx";
import { InfoSection } from "./components/InfoSection.tsx";
import { FloatingWA } from "./components/Floating.tsx";
import { IconBulb, IconGear } from "./components/icons.tsx";
import { Card } from "./components/Card.tsx";
import { Md } from "./components/Md.tsx";
import { ADMIN_ENABLED } from "./lib/env.ts";

const AdminDrawer = lazy(() => import("./components/admin/AdminDrawer.tsx"));

export default function App() {
  const { config } = useConfig();
  const rm = useReducedMotion();
  const [adminOpen, setAdminOpen] = useState(() => ADMIN_ENABLED && location.hash === "#admin");
  useLenisGsap(config.anim.smoothScroll && !rm, adminOpen);

  const active = useMemo(() => config.products.filter((p) => p.active), [config.products]);
  const [curId, setCurId] = useState(active[0]?.id ?? "");
  const [nom, setNom] = useState(100e6);
  const [tenMap, setTenMap] = useState<Record<string, number>>({});
  const [basisMap, setBasisMap] = useState<Record<string, "30" | "cal">>({});
  const [dSr, setDSr] = useState<string | null>(null);
  const [dEr, setDEr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const touch = () => setTouched(true);

  const closeAdmin = useCallback(() => { setAdminOpen(false); if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search); }, []);

  useEffect(() => { const f = () => setAdminOpen(ADMIN_ENABLED && location.hash === "#admin"); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);

  const base = active.find((p) => p.id === curId) ?? active[0];
  if (!base) return <main className="p-10 text-center">Belum ada produk aktif. Aktifkan produk lewat menu Admin.</main>;
  const c = { ...base, basis: basisMap[base.id] ?? base.basis };
  const du = c.type === "du";
  const ten0 = tenMap[c.id];
  const ten = c.tenor.includes(ten0) ? ten0 : c.tenor.includes(12) ? 12 : c.tenor[0] ?? 12;
  const now = new Date();
  const [dS, dE] = du ? fixDates(c, dSr, dEr, now) : ["", ""];
  const sim = simulate(config, c, { nom, ten, dS, dE }, now);
  const links = {
    daftar: waLink(config, c, sim, nom, dS, dE, "daftar"),
    tanya: waLink(config, c, sim, nom, dS, dE, "tanya"),
  };
  const hasResult = sim.status === "ok";
  const split = config.anim.splitTitles;

  const pickRow = (key: string) => { touch(); if (du) setDEr(key); else setTenMap((m) => ({ ...m, [c.id]: +key })); };

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <ProductTabs products={active} cur={c.id} onPick={(id) => { touch(); setCurId(id); }} />
      <main id="panel-sim" role="tabpanel" aria-labelledby={`tab-${c.id}`} className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={c.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            {c.desc && <p className="mb-5 max-w-3xl text-[15px] text-mut"><b className="text-ink">{c.nm}:</b> <Md text={fillAll(config, c, c.desc)} /></p>}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="space-y-6">
                <InputCard c={c} split={split} nom={nom} onNom={(n) => { touch(); setNom(n); }} ten={ten} onTen={(t) => { touch(); setTenMap((m) => ({ ...m, [c.id]: t })); }}
                  onBasis={(b) => { touch(); setBasisMap((m) => ({ ...m, [c.id]: b })); }}
                  dS={dS} dE={dE} onDS={(s) => { touch(); setDSr(s); setDEr(null); }} onDE={(e) => { touch(); setDEr(e); }}
                  onCalc={() => { touch(); scrollToEl(document.getElementById("hasil")); }} />
                {c.notes.length > 0 && (
                  <Card className="p-5" hover={false}>
                    <ul className="space-y-1.5 text-sm text-mut">{c.notes.map((n, i) => <li key={i}>• <Md text={fillAll(config, c, n)} /></li>)}</ul>
                  </Card>
                )}
              </div>
              <Results cfg={config} c={c} sim={sim} nom={nom} ten={ten} split={split} onPickRow={pickRow} links={links} pulse={touched && hasResult} />
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#f2d98a] bg-[#fff8e1] p-4 text-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fdeeb5] text-[#8a6100]"><IconBulb /></span>
              <p className="pt-1.5">{config.texts.disclaimer}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <InfoSection cfg={config} c={c} split={split} />
      </main>
      <footer className="border-t border-bd bg-white px-4 py-8 pb-28 text-center text-sm text-mut lg:pb-8">
        <p className="font-semibold text-ink">{config.bank} · {config.unit}</p>
        <p>Tarif pada simulasi ini berlaku per {fd(config.asOf)}. {config.bank} terdaftar dan diawasi OJK.</p>
        {ADMIN_ENABLED && <button type="button" onClick={() => setAdminOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs underline underline-offset-2"><IconGear /> Admin</button>}
      </footer>
      <FloatingWA show={hasResult && !adminOpen} href={links.daftar} />
      <Suspense fallback={null}>
        <AnimatePresence>{adminOpen && <AdminDrawer key="admin" onClose={closeAdmin} />}</AnimatePresence>
      </Suspense>
    </MotionConfig>
  );
}

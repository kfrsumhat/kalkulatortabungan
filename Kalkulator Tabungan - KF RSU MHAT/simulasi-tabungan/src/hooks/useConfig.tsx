import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Config } from "../types/config.ts";
import bundled from "../../public/config.json";
import { clearDraft, loadDraft, loadHistory, pushHistory, saveDraft, type Version } from "../lib/storage.ts";
import { looksLikeConfig } from "../lib/validate.ts";

const DEFAULT = bundled as unknown as Config;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

interface Ctx {
  config: Config;
  published: Config; // versi di config.json yang sedang live
  dirty: boolean; // draft berbeda dari yang terpublikasi
  setConfig: (fn: (c: Config) => Config) => void;
  history: Version[];
  snapshot: (label: string) => void;
  restore: (v: Version) => void;
  resetToPublished: () => void;
  resetToDefault: () => void;
  importConfig: (text: string) => string | null; // pesan error atau null
  exportConfig: () => void;
}
const Cx = createContext<Ctx | null>(null);
export const useConfig = () => { const c = useContext(Cx); if (!c) throw new Error("ConfigProvider hilang"); return c; };

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<Config>(DEFAULT);
  const [config, setCfg] = useState<Config>(() => loadDraft() ?? DEFAULT);
  const [history, setHistory] = useState<Version[]>(() => loadHistory());

  // muat config.json saat runtime (sumber data produksi)
  useEffect(() => {
    const ac = new AbortController();
    fetch("config.json", { cache: "no-store", signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!looksLikeConfig(j)) return;
        setPublished(j);
        if (!loadDraft()) setCfg(j);
      })
      .catch(() => { /* offline: pakai salinan bawaan */ });
    return () => ac.abort();
  }, []);

  // terapkan tema + SEO
  useEffect(() => {
    const r = document.documentElement.style, t = config.theme;
    r.setProperty("--g", t.primary); r.setProperty("--g2", t.tint); r.setProperty("--ink", t.ink);
    r.setProperty("--mut", t.mut); r.setProperty("--bd", t.bd); r.setProperty("--bg", t.bg); r.setProperty("--ac", t.accent);
    document.title = config.seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", config.seo.description);
  }, [config]);

  const setConfig = useCallback((fn: (c: Config) => Config) => {
    setCfg((prev) => { const n = fn(prev); saveDraft(n); return n; });
  }, []);
  const snapshot = useCallback((label: string) => setHistory(pushHistory(config, label)), [config]);
  const apply = (c: Config) => { setCfg(c); saveDraft(c); };

  const value = useMemo<Ctx>(() => ({
    config, published, dirty: !same(config, published), setConfig, history, snapshot,
    restore: (v) => { setHistory(pushHistory(config, "Sebelum restore")); apply(v.config); },
    resetToPublished: () => { setHistory(pushHistory(config, "Sebelum reset")); clearDraft(); setCfg(published); },
    resetToDefault: () => { setHistory(pushHistory(config, "Sebelum reset default")); apply({ ...DEFAULT, admin: config.admin }); },
    importConfig: (text) => {
      try {
        const j = JSON.parse(text);
        if (!looksLikeConfig(j)) return "File bukan config.json yang valid (schemaVersion/products/info/texts/theme tidak lengkap).";
        setHistory(pushHistory(config, "Sebelum import")); apply(j); return null;
      } catch { return "File bukan JSON yang valid."; }
    },
    exportConfig: () => {
      setHistory(pushHistory(config, "Diunduh"));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...config, admin: null }, null, 2)], { type: "application/json" }));
      a.download = "config.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [config, published, history, setConfig, snapshot]);

  return <Cx.Provider value={value}>{children}</Cx.Provider>;
}

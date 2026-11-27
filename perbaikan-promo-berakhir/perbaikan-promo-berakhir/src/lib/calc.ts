import type { Config, Product } from "../types/config.ts";
import { fd, pct, rp } from "./format.ts";

/* ---------- tanggal (identik dengan file HTML asli) ---------- */
export const iso = (d: Date) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const U = (x: string) => Date.UTC(+x.slice(0, 4), +x.slice(5, 7) - 1, +x.slice(8, 10));
export const diff = (a: string, b: string) => Math.round((U(b) - U(a)) / 864e5);
export const addD = (x: string, n: number) => new Date(U(x) + n * 864e5).toISOString().slice(0, 10);

export const promoLeft = (c: Product, now: Date) =>
  Math.ceil((new Date(c.end + "T23:59:59").getTime() - now.getTime()) / 864e5);
export const minEnd = (c: Product, dS: string) => addD(dS, c.minDays || 30);
export const feasible = (c: Product, dS: string) => minEnd(c, dS) <= c.end;

/** Normalisasi tanggal Double Untung (fungsi fix() di HTML). */
export function fixDates(c: Product, dS: string | null, dE: string | null, now: Date): [string, string] {
  const t = iso(now);
  let s = dS || t;
  if (s < t) s = t;
  if (s > c.end) s = c.end;
  let e = dE && dE <= c.end ? dE : c.end;
  const m = minEnd(c, s);
  if (e < m) e = m;
  return [s, e];
}

/** Jumlah hari untuk tenor (bulan). */
export const daysOf = (c: Product, t: number) =>
  c.dayMap && c.dayMap[t] ? +c.dayMap[t] : c.basis === "cal" ? Math.round((365 * t) / 12) : Math.round(t * c.hb);

/* ---------- rumus inti ---------- */
export const hit = (n: number, rate: number, d: number, pajak: number) => {
  const g = ((n * rate) / 100 * d) / 365;
  const t = (g * pajak) / 100;
  return { g, t, net: g - t };
};

export type Line = [label: string, value: string, negative?: boolean];
export interface CalcResult {
  err?: string;
  net: number;
  gross: number;
  tax: number;
  tot: string;
  lines: Line[];
}
const fail = (err: string): CalcResult => ({ err, net: 0, gross: 0, tax: 0, tot: "", lines: [] });

export function computeProduct(c: Product, pajak: number, n: number, d: number): CalcResult {
  const tx = "Pajak " + pajak + "%";
  if (c.type === "du") {
    const T = c.tiers.slice().sort((x, y) => x[0] - y[0]);
    if (!T.length || n < T[0][0]) return fail("Nominal minimal " + rp(T.length ? T[0][0] : 0) + " untuk mendapat hadiah Double Untung.");
    let rt = T[0][1];
    T.forEach((t) => { if (n >= t[0]) rt = t[1]; });
    const h = hit(n, rt, d, pajak), b = hit(n, c.tab, d, pajak);
    return {
      net: h.net + b.net, gross: h.g + b.g, tax: h.t + b.t, tot: "Total perolehan bersih",
      lines: [
        ["Suku bunga hadiah (tier saldo)", pct(rt) + " p.a."],
        ["Suku bunga tabungan", pct(c.tab) + " p.a."],
        ["Bunga kotor (hadiah + tabungan)", rp(h.g + b.g)],
        [tx, "− " + rp(h.t + b.t), true],
      ],
    };
  }
  if (c.type === "silah") {
    const nr = c.rate - c.prime, r = hit(n, nr, d, pajak);
    return {
      net: r.net, gross: r.g, tax: r.t, tot: "Hadiah bersih diterima",
      lines: [["Suku bunga hadiah SILAH", pct(nr) + " p.a."], ["Bunga kotor", rp(r.g)], [tx, "− " + rp(r.t), true]],
    };
  }
  const r = hit(n, c.rate, d, pajak);
  const lines: Line[] = [];
  if (c.lblRate) lines.push([c.lblRate, pct(c.rate) + " p.a."]);
  lines.push([c.lblGross, rp(r.g)], [tx, "− " + rp(r.t), true]);
  return { net: r.net, gross: r.g, tax: r.t, tot: c.lblNet, lines };
}

/* ---------- simulasi lengkap (setara calc() di HTML) ---------- */
export interface SimInput { nom: number; ten: number; dS: string; dE: string }
export type SimStatus = "empty" | "ended" | "short" | "tier" | "ok";
export interface Row { key: string; label: string; sub: string; net: number; per: number; selected: boolean }
export interface Sim {
  status: SimStatus;
  message?: string;
  d: number;
  r?: CalcResult;
  rows: Row[];
  periode: string; // "jangka waktu 12 bulan" | "periode … s.d. … (N hari)"
  banner?: { title: string; body: string };
  perLabel: string; // "per hari" | "per bulan"
}

export function simulate(cfg: Config, c: Product, i: SimInput, now: Date): Sim {
  const du = c.type === "du";
  const d = du ? diff(i.dS, i.dE) : daysOf(c, i.ten);
  const periode = du ? `periode ${fd(i.dS)} s.d. ${fd(i.dE)} (${d} hari)` : `jangka waktu ${i.ten} bulan`;
  const base: Sim = { status: "empty", d, rows: [], periode, perLabel: du ? "per hari" : "per bulan" };
  if (!(i.nom > 0)) return base;
  const left = du ? promoLeft(c, now) : 0;
  const vars = { promoEnd: fd(c.end), sisa: left, minDays: c.minDays || 30 };
  const fillT = (s: string) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String((vars as Record<string, unknown>)[k]) : m));
  if (du && left > 0) base.banner = { title: fillT(c.promoTitle), body: fillT(c.promoBody) };
  if (du && left <= 0) return { ...base, status: "ended", message: `Promo ${c.nm} telah berakhir pada ${fd(c.end)}.` };
  if (du && !feasible(c, i.dS)) return { ...base, status: "short", message: `Sisa masa promo kurang dari ${c.minDays || 30} hari` };
  const r = computeProduct(c, cfg.pajak, i.nom, d);
  if (r.err) return { ...base, status: "tier", message: r.err };

  let rows: Row[];
  if (du) {
    const mxd = diff(i.dS, c.end);
    const dp = [...new Set([30, 60, 90, 120, 180, mxd].filter((n) => n >= (c.minDays || 30) && n <= mxd))].sort((a, b) => a - b);
    rows = dp.map((n) => {
      const e = addD(i.dS, n), x = computeProduct(c, cfg.pajak, i.nom, n).net;
      return { key: e, label: fd(e), sub: n + " hari", net: x, per: x / n, selected: e === i.dE };
    });
  } else {
    rows = c.tenor.map((t) => {
      const x = computeProduct(c, cfg.pajak, i.nom, daysOf(c, t)).net;
      return { key: String(t), label: t + " bulan", sub: "", net: x, per: x / t, selected: t === i.ten };
    });
  }
  return { ...base, status: "ok", r, rows };
}

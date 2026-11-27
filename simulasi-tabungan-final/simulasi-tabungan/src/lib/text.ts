import type { Config, Product } from "../types/config.ts";
import { fd, fill, pct, rp } from "./format.ts";

export function hitungText(cfg: Config, c: Product) {
  if (c.type === "silah") return cfg.texts.hitungSilah;
  if (c.type === "du") return cfg.texts.hitungDu;
  return c.basis === "cal" ? cfg.texts.hitungCal : fill(cfg.texts.hitung30, { hb: c.hb });
}
export function textVars(cfg: Config, c: Product) {
  const T = c.tiers.slice().sort((a, b) => a[0] - b[0]);
  return {
    bank: cfg.bank, unit: cfg.unit, pajak: cfg.pajak, asOf: fd(cfg.asOf), hitung: hitungText(cfg, c),
    promoEnd: fd(c.end), minDays: c.minDays || 30, tab: pct(c.tab),
    tiers: T.map((t) => "mulai " + rp(t[0]) + " = " + pct(t[1])).join("; "),
    minNominal: rp(T.length ? T[0][0] : 0),
  };
}
export const fillAll = (cfg: Config, c: Product, s: string) => fill(s, textVars(cfg, c));

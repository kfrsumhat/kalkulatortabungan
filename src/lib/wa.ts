import type { Config, Product } from "../types/config.ts";
import type { Sim } from "./calc.ts";
import { fd, fill, rp, waNo } from "./format.ts";

export type WaKind = "tanya" | "daftar";

/** Link dasar (chat kosong) bila tidak ada hasil; selain itu ?text= berisi ringkasan. */
export function waLink(cfg: Config, c: Product, sim: Sim, nom: number, dS: string, dE: string, kind: WaKind): string {
  const base = "https://wa.me/" + waNo(cfg.wa);
  if (sim.status !== "ok" || !sim.r) return base;
  const du = c.type === "du";
  const msg = fill(kind === "tanya" ? cfg.waTanya : cfg.waDaftar, {
    bank: cfg.bank, unit: cfg.unit, produk: c.nm, nominal: rp(nom), periode: sim.periode, hari: sim.d,
    estimasi: rp(sim.r.net), tanggalMulai: du ? fd(dS) : "", tanggalJatuhTempo: du ? fd(dE) : "",
  });
  return base + "?text=" + encodeURIComponent(msg);
}

export function summaryText(cfg: Config, c: Product, sim: Sim, nom: number): string {
  if (sim.status !== "ok" || !sim.r) return "";
  return `Simulasi ${c.nm} - ${cfg.bank} ${cfg.unit}\nNominal: ${rp(nom)}\n${sim.periode}\nEstimasi bersih: ${rp(sim.r.net)}`;
}

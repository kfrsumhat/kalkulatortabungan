import type { Config } from "../types/config.ts";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + "T00:00:00").getTime());
export type Errors = Record<string, string>;

export function validate(c: Config): Errors {
  const e: Errors = {};
  const num = (path: string, v: number, min = 0, max = Infinity, lbl = "Nilai") => {
    if (typeof v !== "number" || !isFinite(v)) e[path] = lbl + " harus berupa angka.";
    else if (v < min) e[path] = lbl + " tidak boleh kurang dari " + min + ".";
    else if (v > max) e[path] = lbl + " tidak boleh lebih dari " + max + ".";
  };
  if (!c.unit.trim()) e["unit"] = "Nama unit wajib diisi.";
  if (!c.bank.trim()) e["bank"] = "Nama bank wajib diisi.";
  if (!isDate(c.asOf)) e["asOf"] = "Tanggal tidak valid.";
  if (waDigits(c.wa).length < 9) e["wa"] = "Nomor WhatsApp tidak valid.";
  num("pajak", c.pajak, 0, 100, "Pajak");
  for (const k of ["primary", "accent"] as const) if (!/^#[0-9a-fA-F]{6}$/.test(c.theme[k])) e["theme." + k] = "Gunakan format #RRGGBB.";
  if (new Set(c.products.map((p) => p.id)).size !== c.products.length) e["products"] = "ID produk harus unik.";
  c.products.forEach((p, i) => {
    const b = `products.${i}.`;
    if (!p.nm.trim()) e[b + "nm"] = "Nama produk wajib diisi.";
    num(b + "rate", p.rate, 0, 100, "Suku bunga");
    num(b + "hb", p.hb, 1, 31, "Hari per bulan");
    if (p.type === "silah") { num(b + "prime", p.prime, 0, 100, "Prime risk"); if (p.prime > p.rate) e[b + "prime"] = "Prime risk melebihi suku bunga LPS."; }
    if (p.type === "du") {
      num(b + "tab", p.tab, 0, 100, "Bunga tabungan");
      num(b + "minDays", p.minDays, 1, 3650, "Minimal hari");
      if (!isDate(p.end)) e[b + "end"] = "Tanggal tidak valid.";
      p.tiers.forEach((t, j) => { num(`${b}tiers.${j}.0`, t[0], 0, Infinity, "Saldo"); num(`${b}tiers.${j}.1`, t[1], 0, 100, "Persentase"); });
      const s = p.tiers.map((t) => t[0]);
      if (new Set(s).size !== s.length) e[b + "tiers"] = "Saldo minimal tiap tier harus unik.";
    } else {
      if (!p.tenor.length) e[b + "tenor"] = "Minimal satu tenor.";
      if (p.tenor.some((t, j) => t <= 0 || (j > 0 && t <= p.tenor[j - 1]))) e[b + "tenor"] = "Tenor harus unik, terurut naik, dan > 0.";
      if (p.type === "silah") for (const t of p.tenor) if (!(p.dayMap[t] > 0)) e[b + "dayMap"] = `Tenor ${t} bulan belum punya jumlah hari.`;
    }
    p.quick.forEach((q, j) => { if (!(q >= 0)) e[`${b}quick.${j}`] = "Nominal tidak valid."; });
  });
  return e;
}
const waDigits = (s: string) => String(s).replace(/\D/g, "");

/** Validasi ringan untuk file import. */
export function looksLikeConfig(x: unknown): x is Config {
  const c = x as Config;
  return !!c && typeof c === "object" && typeof c.schemaVersion === "number" && Array.isArray(c.products) && Array.isArray(c.info) && !!c.texts && !!c.theme;
}

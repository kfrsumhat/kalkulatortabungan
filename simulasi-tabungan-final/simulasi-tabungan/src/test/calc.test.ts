import { describe, expect, it } from "vitest";
import { computeProduct, daysOf, simulate, fixDates } from "../lib/calc.ts";
import cfg from "../../public/config.json";
import type { Config } from "../types/config.ts";

const C = cfg as unknown as Config;
const P = (id: string) => C.products.find((p) => p.id === id)!;
const now = new Date("2026-11-26T10:00:00");

describe("Deposito", () => {
  it("Rp100jt, 12 bulan (360 hari), 3,5%, pajak 20%", () => {
    const d = daysOf(P("dep"), 12);
    expect(d).toBe(360);
    const r = computeProduct(P("dep"), 20, 100e6, d);
    expect(r.gross).toBeCloseTo(3452054.79, 2);
    expect(r.net).toBeCloseTo(2761643.84, 2);
  });
  it("mode kalender: 12 bulan = 365 hari", () => {
    expect(daysOf({ ...P("dep"), basis: "cal" }, 12)).toBe(365);
  });
});
describe("Deposito Syariah", () => {
  it("Rp50jt, 6 bulan, 4,3%", () => {
    const r = computeProduct(P("syr"), 20, 50e6, daysOf(P("syr"), 6));
    expect(r.net).toBeCloseTo(((50e6 * 0.043 * 180) / 365) * 0.8, 6);
  });
});
describe("Double Untung", () => {
  it("di bawah tier terendah -> error", () => {
    expect(computeProduct(P("du"), 20, 9_999_999, 60).err).toMatch(/Nominal minimal Rp 10\.000\.000/);
  });
  it("tier 4,5% untuk Rp500jt + bunga tabungan 0,85%, 90 hari", () => {
    const r = computeProduct(P("du"), 20, 500e6, 90);
    expect(r.net).toBeCloseTo(((500e6 * 0.0535 * 90) / 365) * 0.8, 6);
  });
  it("promo berakhir & sisa < minimal hari", () => {
    expect(simulate(C, P("du"), { nom: 1e8, ten: 12, dS: "2027-02-01", dE: "2027-02-01" }, new Date("2027-02-01T09:00:00")).status).toBe("ended");
    expect(simulate(C, P("du"), { nom: 1e8, ten: 12, dS: "2027-01-20", dE: "2027-01-31" }, new Date("2027-01-20T09:00:00")).status).toBe("short");
  });
  it("fixDates menjaga jatuh tempo >= minimal hari & <= akhir promo", () => {
    const [s, e] = fixDates(P("du"), null, null, now);
    expect(s).toBe("2026-11-26");
    expect(e).toBe("2027-01-31");
  });
});
describe("SILAH", () => {
  it("Rp100jt, 12 bulan = 365 hari, (3,75-0,25)%", () => {
    expect(daysOf(P("silah"), 12)).toBe(365);
    expect(computeProduct(P("silah"), 20, 100e6, 365).net).toBeCloseTo(100e6 * 0.035 * 0.8, 6);
  });
});
describe("simulate", () => {
  it("nominal 0 -> empty", () => {
    expect(simulate(C, P("dep"), { nom: 0, ten: 12, dS: "", dE: "" }, now).status).toBe("empty");
  });
});

export type ProductType = "simple" | "du" | "silah";

export interface Product {
  id: string;
  type: ProductType;
  active: boolean;
  icon: string;
  nm: string;
  sub: string;
  desc: string;
  rate: number; // % p.a. (simple, silah = suku bunga LPS)
  basis: "30" | "cal";
  hb: number; // hari per bulan (mode 30)
  tenor: number[];
  dayMap: Record<string, number>; // tenor (bulan) -> hari (SILAH)
  quick: number[];
  notes: string[];
  terms: string[];
  lblRate: string; // kosong = baris suku bunga disembunyikan
  lblGross: string;
  lblNet: string;
  tiers: [number, number][]; // Double Untung: [saldo minimal, % hadiah]
  tab: number; // bunga tabungan (Double Untung)
  end: string; // akhir promo (YYYY-MM-DD)
  minDays: number;
  promoTitle: string;
  promoBody: string;
  prime: number; // prime risk (SILAH)
}

export interface Config {
  schemaVersion: number;
  unit: string;
  bank: string;
  heroTitle: string;
  tagline: string;
  asOf: string;
  logo: string;
  seo: { title: string; description: string };
  theme: { primary: string; accent: string; tint: string; ink: string; mut: string; bd: string; bg: string };
  anim: { smoothScroll: boolean; splitTitles: boolean };
  wa: string;
  waTanya: string;
  waDaftar: string;
  pajak: number;
  cs: string;
  ojk: string;
  extra: string;
  texts: { disclaimer: string; privacy: string; hitung30: string; hitungCal: string; hitungDu: string; hitungSilah: string };
  info: string[];
  products: Product[];
  admin: { salt: string; hash: string } | null;
}

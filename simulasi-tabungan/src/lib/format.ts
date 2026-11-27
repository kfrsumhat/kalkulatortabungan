export const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
export const pct = (n: number) => (+(+n).toFixed(4)).toString().replace(".", ",") + "%";
export const fd = (x: string) =>
  new Date(x + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** Label ringkas untuk sumbu grafik & chip: 1,5 jt / 2 M */
export const compact = (n: number) => {
  const f = (v: number, s: string) => (+v.toFixed(1)).toString().replace(".", ",") + " " + s;
  if (n >= 1e9) return f(n / 1e9, "M");
  if (n >= 1e6) return f(n / 1e6, "jt");
  if (n >= 1e3) return f(n / 1e3, "rb");
  return String(Math.round(n));
};

export const fill = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/** 082… -> 62…; buang non-digit */
export const waNo = (raw: string) => {
  let n = String(raw).replace(/\D/g, "");
  if (n[0] === "0") n = "62" + n.slice(1);
  return n;
};

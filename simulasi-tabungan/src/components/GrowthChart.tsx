import { compact, rp } from "../lib/format.ts";

/** Grafik garis + area SVG: bunga kotor vs bersih terhadap waktu (bunga sederhana → linear per hari). */
export function GrowthChart({ gross, net, total, unit }: { gross: number; net: number; total: number; unit: "bulan" | "hari" }) {
  const W = 480, H = 260, L = 56, R = 14, T = 14, B = 36;
  const x = (t: number) => L + ((W - L - R) * t) / total;
  const y = (v: number) => T + (H - T - B) * (1 - (gross > 0 ? v / gross : 0));
  const ticks = [0, 1, 2, 3, 4];
  const area = (v: number) => `M${x(0)},${y(0)} L${x(total)},${y(v)} L${x(total)},${y(0)} Z`;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" className="h-auto w-full"
        aria-label={`Grafik pertumbuhan selama ${total} ${unit}: bunga kotor ${rp(gross)}, bunga bersih ${rp(net)}.`}>
        {ticks.map((i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y((gross * i) / 4)} y2={y((gross * i) / 4)} style={{ stroke: "var(--bd)" }} strokeWidth="1" />
            <text x={L - 8} y={y((gross * i) / 4) + 4} textAnchor="end" fontSize="11" style={{ fill: "var(--mut)" }}>{compact((gross * i) / 4)}</text>
            <text x={x((total * i) / 4)} y={H - 14} textAnchor="middle" fontSize="11" style={{ fill: "var(--mut)" }}>{+((total * i) / 4).toFixed(1)}</text>
          </g>
        ))}
        <path d={area(gross)} style={{ fill: "var(--ac)" }} opacity=".16" />
        <path d={area(net)} style={{ fill: "var(--g)" }} opacity=".16" />
        <line x1={x(0)} y1={y(0)} x2={x(total)} y2={y(gross)} style={{ stroke: "var(--ac)" }} strokeWidth="3" strokeLinecap="round" />
        <line x1={x(0)} y1={y(0)} x2={x(total)} y2={y(net)} style={{ stroke: "var(--g)" }} strokeWidth="3" strokeLinecap="round" />
        <circle cx={x(total)} cy={y(gross)} r="4.5" style={{ fill: "var(--ac)" }} />
        <circle cx={x(total)} cy={y(net)} r="4.5" style={{ fill: "var(--g)" }} />
        <text x={(L + W - R) / 2} y={H - 1} textAnchor="middle" fontSize="11" style={{ fill: "var(--mut)" }}>{unit === "hari" ? "Hari" : "Bulan"}</text>
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-mut">
        <span className="flex items-center gap-1.5"><i className="h-1 w-5 rounded bg-ac" />Bunga kotor</span>
        <span className="flex items-center gap-1.5"><i className="h-1 w-5 rounded bg-g" />Bunga bersih (setelah pajak)</span>
      </figcaption>
    </figure>
  );
}

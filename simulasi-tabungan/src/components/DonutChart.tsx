import { motion } from "motion/react";
import { rp } from "../lib/format.ts";

/** Donut: komposisi bunga kotor → bagian bersih vs pajak. */
export function DonutChart({ net, tax, pokok }: { net: number; tax: number; pokok: number }) {
  const r = 54, C = 2 * Math.PI * r, tot = net + tax || 1, share = net / tot, len = C * share;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={`Dari bunga kotor, ${Math.round(share * 100)} persen diterima bersih dan ${Math.round((1 - share) * 100)} persen pajak.`}>
          <circle cx="70" cy="70" r={r} fill="none" strokeWidth="18" style={{ stroke: "var(--ac)" }} />
          <motion.circle cx="70" cy="70" r={r} fill="none" strokeWidth="18" style={{ stroke: "var(--g)" }}
            initial={{ strokeDasharray: `0 ${C}` }} animate={{ strokeDasharray: `${len} ${C}` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <b className="font-display text-3xl text-g">{Math.round(share * 100)}%</b><span className="text-xs text-mut">Bersih</span>
        </div>
      </div>
      <div className="grid w-full gap-3">
        <div className="rounded-2xl border border-bd bg-g2 p-3.5"><p className="text-xs text-mut">Dana Pokok</p><p className="text-lg font-bold text-g">{rp(pokok)}</p></div>
        <div className="rounded-2xl border border-ac/40 p-3.5" style={{ background: "color-mix(in srgb, var(--ac) 14%, white)" }}><p className="text-xs text-mut">Bunga Bersih</p><p className="text-lg font-bold text-ink">{rp(net)}</p></div>
      </div>
    </div>
  );
}

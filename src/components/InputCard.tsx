import type React from "react";
import { motion } from "motion/react";
import type { Product } from "../types/config.ts";
import { addD, diff, feasible, iso, minEnd } from "../lib/calc.ts";
import { compact, fd } from "../lib/format.ts";
import { Card } from "./Card.tsx";
import { Chip } from "./Chip.tsx";
import { SplitHeading } from "./SplitHeading.tsx";
import { IconCal, IconCalc, IconClock, IconWallet } from "./icons.tsx";

interface Props {
  c: Product; split: boolean;
  nom: number; onNom: (n: number) => void;
  ten: number; onTen: (t: number) => void;
  onBasis: (b: "30" | "cal") => void;
  dS: string; dE: string; onDS: (s: string) => void; onDE: (e: string) => void;
  onCalc: () => void;
}

const L = ({ icon, children, htmlFor }: { icon: React.ReactNode; children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><span className="text-g">{icon}</span>{children}</label>
);

export function InputCard({ c, split, nom, onNom, ten, onTen, onBasis, dS, dE, onDS, onDE, onCalc }: Props) {
  const du = c.type === "du";
  const today = iso(new Date());
  const mx = du ? diff(dS, c.end) : 0;
  const pr = du ? [30, 60, 90, 120, 180].filter((n) => n >= (c.minDays || 30) && n < mx) : [];
  return (
    <Card className="overflow-hidden" hover={false}>
      <div className="flex items-center gap-3 border-b border-bd bg-g2 px-5 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-g shadow-sm"><IconCalc /></span>
        <div>
          <SplitHeading text="Input Anda" enabled={split} className="font-display text-xl font-bold text-g" />
          <p className="text-sm text-mut">Masukkan detail penempatan dana</p>
        </div>
      </div>
      <div className="space-y-6 p-5">
        <div>
          <L icon={<IconWallet />} htmlFor="nom">Nominal penempatan</L>
          <div className="flex items-center gap-2 rounded-xl border-2 border-bd bg-white px-3 focus-within:border-g">
            <span className="font-semibold text-mut">Rp</span>
            <input id="nom" inputMode="numeric" autoComplete="off" placeholder="0" className="w-full bg-transparent py-2.5 text-xl font-bold outline-none"
              value={nom ? nom.toLocaleString("id-ID") : ""}
              onChange={(e) => onNom(+e.target.value.replace(/\D/g, "").slice(0, 13) || 0)} data-lenis-prevent />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {c.quick.map((v) => <Chip key={v} on={nom === v} onClick={() => onNom(v)}>{compact(v).replace(" rb", " rb")}</Chip>)}
          </div>
        </div>

        {!du && (
          <div>
            <L icon={<IconClock />}>Jangka waktu</L>
            <div className="flex flex-wrap gap-2">
              {c.tenor.map((t) => <Chip key={t} on={t === ten} onClick={() => onTen(t)}>{t} bulan</Chip>)}
            </div>
            {c.type === "simple" && (
              <div className="mt-5">
                <L icon={<IconCal />}>Cara hitung hari</L>
                <div className="flex flex-wrap gap-2">
                  {([["30", "30 hari/bulan"], ["cal", "Kalender 365 hari/tahun"]] as const).map(([b, l]) => (
                    <Chip key={b} on={c.basis === b} onClick={() => onBasis(b)}>{l}</Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {du && (
          <div className="space-y-4">
            <div>
              <L icon={<IconCal />} htmlFor="d1">Tanggal penempatan</L>
              <input id="d1" type="date" className="fld" min={today} max={c.end} value={dS} onChange={(e) => e.target.value && onDS(e.target.value)} data-lenis-prevent />
            </div>
            <div>
              <L icon={<IconCal />} htmlFor="d2">Sampai tanggal (jatuh tempo)</L>
              <input id="d2" type="date" className="fld" min={minEnd(c, dS)} max={c.end} value={dE} onChange={(e) => e.target.value && onDE(e.target.value)} data-lenis-prevent />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {pr.map((n) => <Chip key={n} on={addD(dS, n) === dE} onClick={() => onDE(addD(dS, n))}>{n} hari</Chip>)}
                {feasible(c, dS) && <Chip on={dE === c.end} onClick={() => onDE(c.end)}>Sampai akhir promo</Chip>}
              </div>
              <p className="mt-2 text-xs text-mut">Minimal penempatan {c.minDays || 30} hari. Batas maksimal jatuh tempo {fd(c.end)}.</p>
            </div>
          </div>
        )}

        <motion.button type="button" onClick={onCalc} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-g px-5 py-3.5 text-base font-bold text-white shadow-lift">
          <IconCalc /> Hitung simulasi
        </motion.button>
      </div>
    </Card>
  );
}

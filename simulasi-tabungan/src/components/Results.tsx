import type React from "react";
import type { Config, Product } from "../types/config.ts";
import type { Line, Sim } from "../lib/calc.ts";
import { rp } from "../lib/format.ts";
import { Card } from "./Card.tsx";
import { CompareTable } from "./CompareTable.tsx";
import { CountUp } from "./CountUp.tsx";
import { CtaWhatsApp } from "./CtaWhatsApp.tsx";
import { DonutChart } from "./DonutChart.tsx";
import { GrowthChart } from "./GrowthChart.tsx";
import { SplitHeading } from "./SplitHeading.tsx";
import { IconChart } from "./icons.tsx";

interface Props {
  cfg: Config; c: Product; sim: Sim; nom: number; ten: number; split: boolean;
  onPickRow: (key: string) => void;
  links: { daftar: string; tanya: string }; summary: string; pulse: boolean;
}

const Notice = ({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "promo" }) => (
  <div className={`rounded-2xl border p-4 text-sm ${tone === "promo" ? "border-[#f2d98a] bg-[#fff8e1]" : "border-bd bg-white"}`}>{children}</div>
);

export function Results({ cfg, c, sim, nom, ten, split, onPickRow, links, summary, pulse }: Props) {
  const du = c.type === "du";
  const r = sim.r;
  return (
    <Card className="overflow-hidden" hover={false} id="hasil">
      <div className="flex items-center gap-3 border-b border-bd bg-g2 px-5 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-g shadow-sm"><IconChart /></span>
        <div>
          <SplitHeading text="Hasil Simulasi" enabled={split} className="font-display text-xl font-bold text-g" />
          <p className="text-sm text-mut">Lihat estimasi perolehan Anda</p>
        </div>
      </div>
      <div className="space-y-4 p-5" aria-live="polite">
        {sim.banner && (
          <Notice tone="promo"><b>{sim.banner.title}</b><br /><span className="text-xs text-mut">{sim.banner.body}</span></Notice>
        )}

        {sim.status === "empty" && <Notice>Masukkan nominal untuk melihat hasil.</Notice>}
        {sim.status === "ended" && <Notice><b>{sim.message}</b><br /><span className="text-xs text-mut">Silakan hubungi kami untuk produk penempatan dana lainnya.</span></Notice>}
        {sim.status === "short" && <Notice><b>{sim.message}</b><br /><span className="text-xs text-mut">Penempatan baru tidak dapat memenuhi minimal {c.minDays || 30} hari. Silakan hubungi kami.</span></Notice>}
        {sim.status === "tier" && <Notice><b>{sim.message}</b></Notice>}

        {sim.status === "ok" && r && (
          <>
            <div className="rounded-2xl border border-bd bg-g2 p-5 text-center">
              <p className="text-sm text-mut">Estimasi {r.tot.charAt(0).toLowerCase() + r.tot.slice(1)} ({du ? sim.d + " hari" : ten + " bulan"})</p>
              <p className="my-1 break-words font-display text-4xl font-bold text-g sm:text-5xl"><CountUp value={r.net} /></p>
              <p className="text-sm text-mut">≈ {rp(r.net / (du ? sim.d : ten))} {sim.perLabel} · dana pokok {rp(nom)}</p>
            </div>

            <div className="rounded-2xl border border-bd p-4">
              <h3 className="mb-2 text-sm font-bold">Rincian</h3>
              <dl>
                {([...r.lines, ["Jumlah hari", sim.d + " hari"]] as Line[]).map((l, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 border-b border-dashed border-bd py-2 last:border-0">
                    <dt className="flex items-center gap-2 text-mut"><i className={`h-2.5 w-2.5 rounded-full ${l[2] ? "bg-[#b3261e]" : i % 2 ? "bg-ac" : "bg-g"}`} aria-hidden="true" />{l[0]}</dt>
                    <dd className={`text-right font-bold ${l[2] ? "text-[#b3261e]" : ""}`}>{l[1]}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-bd p-4">
              <h3 className="mb-2 text-sm font-bold">Bandingkan {du ? "tanggal jatuh tempo" : "jangka waktu"}</h3>
              <CompareTable rows={sim.rows} du={du} perLabel={sim.perLabel} onPick={onPickRow} />
            </div>
          </>
        )}

        <CtaWhatsApp daftar={links.daftar} tanya={links.tanya} privacy={cfg.texts.privacy} summary={summary} pulse={pulse} />

        {sim.status === "ok" && r && (
          <>
            <div className="rounded-2xl border border-bd p-4">
              <h3 className="mb-2 text-sm font-bold">Pertumbuhan perolehan</h3>
              <GrowthChart gross={r.gross} net={r.net} total={du ? sim.d : ten} unit={du ? "hari" : "bulan"} />
            </div>
            <div className="rounded-2xl border border-bd p-4">
              <h3 className="mb-3 text-sm font-bold">Komposisi bunga</h3>
              <DonutChart net={r.net} tax={r.tax} pokok={nom} />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

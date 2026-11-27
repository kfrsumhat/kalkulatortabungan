import type { Row } from "../lib/calc.ts";
import { rp } from "../lib/format.ts";

export function CompareTable({ rows, du, perLabel, onPick }: { rows: Row[]; du: boolean; perLabel: string; onPick: (key: string) => void }) {
  return (
    <div className="overflow-x-auto" data-lenis-prevent>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Perbandingan {du ? "tanggal jatuh tempo" : "jangka waktu"}</caption>
        <thead><tr className="text-mut">
          <th scope="col" className="py-2 text-left font-semibold">{du ? "Jatuh tempo" : "Tenor"}</th>
          <th scope="col" className="py-2 text-right font-semibold">Total bersih</th>
          <th scope="col" className="py-2 text-right font-semibold capitalize">{perLabel}</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} onClick={() => onPick(r.key)} className={`cursor-pointer border-t border-bd ${r.selected ? "bg-g2 font-bold" : "hover:bg-g2/50"}`}>
              <td className="py-2.5 pr-2 text-left">
                <button type="button" onClick={(e) => { e.stopPropagation(); onPick(r.key); }} aria-pressed={r.selected} className="text-left">
                  {r.label}{r.sub && <span className="block text-xs font-normal text-mut">{r.sub}</span>}
                </button>
              </td>
              <td className="py-2.5 text-right tabular-nums">{rp(r.net)}</td>
              <td className="py-2.5 text-right tabular-nums">{rp(r.per)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

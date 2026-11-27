import type React from "react";
import type { Config, Product } from "../types/config.ts";
import { fillAll } from "../lib/text.ts";
import { Card } from "./Card.tsx";
import { Md } from "./Md.tsx";
import { SplitHeading } from "./SplitHeading.tsx";

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2.5 text-[15px] leading-relaxed text-ink">
    {items.map((x, i) => <li key={i} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-g" aria-hidden="true" /><span>{x}</span></li>)}
  </ul>
);

export function InfoSection({ cfg, c, split }: { cfg: Config; c: Product; split: boolean }) {
  const t = (s: string) => <Md text={fillAll(cfg, c, s)} />;
  const hasTerms = c.terms.length > 0;
  return (
    <div className="mx-auto mt-14 grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
      <section aria-labelledby="h-info">
        <SplitHeading text="Informasi Penting" enabled={split} className="mb-4 text-2xl font-semibold text-g sm:text-3xl" />
        <Card className="p-5" hover={false}><div id="h-info"><List items={cfg.info.map(t)} /></div></Card>
      </section>
      <div className="space-y-10">
        {hasTerms && (
          <section>
            <SplitHeading text={`Syarat & Ketentuan ${c.nm}`} enabled={split} className="mb-4 text-2xl font-semibold text-g sm:text-3xl" />
            <Card className="p-5" hover={false}><List items={c.terms.map(t)} /></Card>
          </section>
        )}
        <section>
          <SplitHeading text="Pengaduan Nasabah" enabled={split} className="mb-4 text-2xl font-semibold text-g sm:text-3xl" />
          <Card className="space-y-2 p-5 text-[15px] leading-relaxed" hover={false}>
            <p>{cfg.cs}</p><p className="font-semibold">{cfg.ojk}</p>
            {cfg.extra && <p className="text-mut">{cfg.extra}</p>}
          </Card>
        </section>
      </div>
    </div>
  );
}

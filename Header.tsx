import { useConfig } from "../hooks/useConfig.tsx";
import { fill } from "../lib/format.ts";
import { SplitHeading } from "./SplitHeading.tsx";

export function Header() {
  const { config: c } = useConfig();
  return (
    <header className="relative overflow-hidden bg-g text-white">
      <svg className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        {[90, 70, 50, 30].map((r) => <circle key={r} cx="100" cy="100" r={r} stroke="var(--ac)" strokeWidth="1" />)}
      </svg>
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 pb-8 pt-8 sm:flex-row sm:items-center sm:gap-8 sm:pb-10 sm:pt-10">
        <div className="rounded-2xl bg-white px-4 py-2.5 shadow-lift">
          <img src={c.logo} alt={`Logo ${c.bank} ${c.unit}`} className="block h-12 w-auto max-w-[200px] sm:h-14" />
        </div>
        <div>
          <SplitHeading as="h1" text={fill(c.heroTitle, { unit: c.unit, bank: c.bank })} enabled={c.anim.splitTitles}
            className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" />
          <p className="mt-2 max-w-xl text-base text-white/85 sm:text-lg">{c.tagline}</p>
        </div>
      </div>
    </header>
  );
}

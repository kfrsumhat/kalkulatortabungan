import { useConfig } from "../hooks/useConfig.tsx";
import { fill } from "../lib/format.ts";
import { SplitHeading } from "./SplitHeading.tsx";

export function Header() {
  const { config: c } = useConfig();
  return (
    <header className="relative isolate z-0 overflow-hidden bg-g text-white">
      {c.cover && (
        <>
          <img src={c.cover} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: "color-mix(in srgb, var(--g) 80%, transparent)" }} aria-hidden="true" />
        </>
      )}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:gap-6 sm:px-5 sm:py-7">
        <div className="shrink-0 rounded-xl bg-white px-3 py-2 shadow-lift">
          <img src={c.logo} alt={`Logo ${c.bank} ${c.unit}`} className="block h-8 w-auto max-w-[140px] sm:h-12 sm:max-w-[200px]" />
        </div>
        <div className="min-w-0">
          <SplitHeading as="h1" text={fill(c.heroTitle, { unit: c.unit, bank: c.bank })} enabled={c.anim.splitTitles}
            className="text-lg font-semibold leading-tight sm:text-3xl" />
          <p className="mt-0.5 text-xs text-white/85 sm:mt-1.5 sm:text-base">{c.tagline}</p>
        </div>
      </div>
    </header>
  );
}

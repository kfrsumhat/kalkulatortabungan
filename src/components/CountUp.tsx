import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { rp } from "../lib/format.ts";
import { useReducedMotion } from "../hooks/useReducedMotion.ts";

/** Count-up angka hasil (GSAP, ±0.6 dtk). */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const rm = useReducedMotion();
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (rm) { node.textContent = rp(value); prev.current = value; return; }
    const o = { v: prev.current };
    const tw = gsap.to(o, { v: value, duration: 0.6, ease: "power2.out", onUpdate: () => { node.textContent = rp(o.v); } });
    prev.current = value;
    return () => { tw.kill(); };
  }, [value, rm]);
  return <span ref={el} className={className} aria-label={rp(value)}>{rp(value)}</span>;
}

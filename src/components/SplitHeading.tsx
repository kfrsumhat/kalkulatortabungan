import { createElement, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords } from "../lib/split-words.ts";
import { useReducedMotion } from "../hooks/useReducedMotion.ts";

gsap.registerPlugin(ScrollTrigger);

interface Props { as?: "h1" | "h2" | "h3"; text: string; className?: string; enabled?: boolean }

/** Judul muncul per kata (GSAP + ScrollTrigger). Hanya GSAP yang menganimasikan elemen ini. */
export function SplitHeading({ as = "h2", text, className, enabled = true }: Props) {
  const ref = useRef<HTMLElement>(null);
  const rm = useReducedMotion();
  const on = enabled && !rm;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll(".sw-i");
      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.to(words, {
        yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert(); // bersihkan tween + ScrollTrigger, kembalikan style
  }, [text, on]);

  const words = splitWords(text);
  return createElement(
    as,
    { ref, className, "aria-label": text },
    words.map((w, i) => (
      <span key={i + w} aria-hidden="true">
        <span className="sw"><span className="sw-i">{w}</span></span>
        {i < words.length - 1 ? " " : ""}
      </span>
    ))
  );
}

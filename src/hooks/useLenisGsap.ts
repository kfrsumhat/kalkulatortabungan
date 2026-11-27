import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenisRef } from "../lib/lenisRef.ts";

gsap.registerPlugin(ScrollTrigger);

/** Lenis dibuat sekali, disinkronkan dengan GSAP ticker; berhenti saat admin terbuka / reduced motion. */
export function useLenisGsap(enabled: boolean, paused: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ duration: 1.1, prevent: (n: Element) => !!n.closest("[data-lenis-prevent]") });
    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const l = lenisRef.current;
    if (!l) return;
    if (paused) l.stop(); else l.start();
  }, [paused, enabled]);
}
